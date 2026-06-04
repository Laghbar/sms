<?php

namespace App\Http\Controllers\Student;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Module;
use App\Models\Schedule;
use App\Models\Tp;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $student   = $request->user();
        $moduleIds = $student->enrolledModules()->pluck('modules.id');

        $grades  = Grade::where('student_id', $student->id)->whereIn('module_id', $moduleIds)->get();
        $average = $grades->isNotEmpty() ? round($grades->avg('grade'), 2) : null;

        $stats = [
            'modules'     => $moduleIds->count(),
            'average'     => $average,
            'pending_tps' => Tp::whereIn('module_id', $moduleIds)
                                ->where('due_date', '>=', now()->toDateString())
                                ->count(),
        ];

        return Inertia::render('Student/Dashboard', ['stats' => $stats]);
    }

    public function results(Request $request): Response
    {
        $student = $request->user();

        // ── Step 1: Fetch all modules for the student's specialization & semester ──
        $allModules = collect();

        if ($student->specialization_id && $student->semester_id) {
            $allModules = Module::where('specialization_id', $student->specialization_id)
                ->where('semester_id', $student->semester_id)
                ->with(['teacher:id,name', 'semesterObj:id,name'])
                ->orderBy('name')
                ->get();
        }

        // Fallback: enrolled modules (for students not yet linked to a specialization)
        if ($allModules->isEmpty()) {
            $allModules = $student->enrolledModules()
                ->with(['teacher:id,name', 'semesterObj:id,name'])
                ->orderBy('name')
                ->get();
        }

        $moduleIds = $allModules->pluck('id');

        // ── Step 2: Grades for all students in these modules (needed for rankings) ──
        $allGrades = Grade::whereIn('module_id', $moduleIds)->get();

        // This student's grades keyed by module_id
        $myGrades = $allGrades->where('student_id', $student->id)->keyBy('module_id');

        // ── Step 3: Per-module ranking ──────────────────────────────────────────────
        $moduleRankings = [];
        foreach ($allModules as $module) {
            if (! $module->is_published) continue;

            $sorted = $allGrades->where('module_id', $module->id)
                ->sortByDesc('grade')
                ->values();

            $rank = null;
            foreach ($sorted as $i => $g) {
                if ($g->student_id === $student->id) {
                    $rank = $i + 1;
                    break;
                }
            }

            $moduleRankings[$module->id] = [
                'rank'  => $rank,
                'total' => $sorted->count(),
            ];
        }

        // ── Step 4: Build per-module payload ───────────────────────────────────────
        $modules = $allModules->map(function (Module $module) use ($myGrades, $moduleRankings) {
            $gradeRow = $myGrades->get($module->id);

            return [
                'id'           => $module->id,
                'name'         => $module->name,
                'code'         => $module->code,
                'coefficient'  => $module->coefficient,
                'teacher_name' => $module->teacher?->name ?? 'TBA',
                'is_published' => $module->is_published,
                'published_at' => $module->published_at?->toDateString(),
                'grade'        => ($module->is_published && $gradeRow) ? (float) $gradeRow->grade : null,
                'module_rank'  => $moduleRankings[$module->id] ?? null,
            ];
        })->values();

        // ── Step 5: Final average (published & graded modules only) ────────────────
        $publishedWithGrade = $modules->filter(fn ($m) => $m['is_published'] && $m['grade'] !== null);
        $totalCoef          = $publishedWithGrade->sum('coefficient');
        $finalAverage       = $totalCoef > 0
            ? round($publishedWithGrade->sum(fn ($m) => $m['grade'] * $m['coefficient']) / $totalCoef, 2)
            : null;

        // ── Step 6: Global final ranking across all students in same spec/semester ──
        $classStudents = User::where('role', Role::Student)
            ->where('specialization_id', $student->specialization_id)
            ->where('semester_id', $student->semester_id)
            ->get(['id', 'name']);

        if ($classStudents->isEmpty()) {
            // Fallback: all students enrolled in these modules
            $classStudents = User::where('role', Role::Student)
                ->whereHas('enrolledModules', fn ($q) => $q->whereIn('modules.id', $moduleIds->toArray()))
                ->get(['id', 'name']);
        }

        $publishedModuleIds = $allModules->where('is_published', true)->pluck('id');
        $publishedGrades    = Grade::whereIn('module_id', $publishedModuleIds)->get();
        $coefMap            = $allModules->whereIn('id', $publishedModuleIds->toArray())->keyBy('id');

        $rankings = $classStudents->map(function (User $s) use ($publishedGrades, $coefMap) {
            $sGrades = $publishedGrades->where('student_id', $s->id);
            if ($sGrades->isEmpty()) return null;

            $totalCoef   = 0;
            $weightedSum = 0;
            foreach ($sGrades as $g) {
                $coef         = $coefMap->get($g->module_id)?->coefficient ?? 1;
                $totalCoef   += $coef;
                $weightedSum += $g->grade * $coef;
            }

            return [
                'id'      => $s->id,
                'name'    => $s->name,
                'average' => $totalCoef > 0 ? round($weightedSum / $totalCoef, 2) : null,
            ];
        })
        ->filter(fn ($s) => $s !== null && $s['average'] !== null)
        ->sortByDesc('average')
        ->values();

        $myRank = null;
        foreach ($rankings as $i => $s) {
            if ($s['id'] === $student->id) { $myRank = $i + 1; break; }
        }

        $pendingCount = $modules->filter(fn ($m) => ! $m['is_published'])->count();

        return Inertia::render('Student/Results', [
            'modules'        => $modules,
            'final_average'  => $finalAverage,
            'my_rank'        => $myRank,
            'total_students' => $rankings->count(),
            'top10'          => $rankings->take(10)->values(),
            'pending_count'  => $pendingCount,
        ]);
    }

    public function schedule(Request $request): Response
    {
        $student   = $request->user();
        $moduleIds = $student->enrolledModules()->pluck('modules.id');

        $schedules = Schedule::whereIn('module_id', $moduleIds)
            ->with('module:id,name,code')
            ->orderByRaw("FIELD(day,'monday','tuesday','wednesday','thursday','friday','saturday')")
            ->orderBy('start_time')
            ->get();

        // Timetable file for this student's semester
        $timetable = null;
        if ($student->semester_id) {
            $sem = \App\Models\Semester::find($student->semester_id);
            if ($sem && $sem->timetable_path) {
                $timetable = [
                    'name' => $sem->timetable_name,
                    'url'  => \Illuminate\Support\Facades\Storage::url($sem->timetable_path),
                ];
            }
        }

        return Inertia::render('Student/Schedule', [
            'schedules' => $schedules,
            'timetable' => $timetable,
        ]);
    }

    public function tps(Request $request): Response
    {
        $moduleIds = $request->user()->enrolledModules()->pluck('modules.id');

        $tps = Tp::whereIn('module_id', $moduleIds)
            ->with('module:id,name,code')
            ->orderBy('due_date')
            ->get()
            ->map(function (Tp $tp) {
                $today = now()->toDateString();
                $due   = $tp->due_date->toDateString();
                return [
                    'id'          => $tp->id,
                    'title'       => $tp->title,
                    'description' => $tp->description,
                    'due_date'    => $due,
                    'max_grade'   => $tp->max_grade,
                    'module'      => $tp->module,
                    'status'      => $due < $today ? 'overdue' : ($due === $today ? 'due_today' : 'upcoming'),
                ];
            });

        return Inertia::render('Student/TPs', ['tps' => $tps]);
    }
}
