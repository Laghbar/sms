<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Module;
use App\Models\User;
use App\Notifications\ResultsPublished;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class ResultController extends Controller
{
    public function index(): Response
    {
        $modules = Module::with(['teacher:id,name', 'semesterObj:id,name', 'specialization:id,name'])
            ->orderBy('name')
            ->get()
            ->map(function (Module $module) {
                $grades       = Grade::where('module_id', $module->id)->get();
                $enrolledCount = $module->students()->count();
                $gradedCount  = $grades->count();
                $avgGrade     = $gradedCount > 0 ? round($grades->avg('grade'), 2) : null;

                // All enrolled students with their current grade
                $students = User::where('role', Role::Student)
                    ->whereHas('enrolledModules', fn ($q) => $q->where('modules.id', $module->id))
                    ->orderBy('name')
                    ->get(['id', 'name'])
                    ->map(function (User $s) use ($grades) {
                        $g = $grades->firstWhere('student_id', $s->id);
                        return [
                            'id'    => $s->id,
                            'name'  => $s->name,
                            'grade' => $g ? (float) $g->grade : null,
                        ];
                    });

                // Per-module ranking
                $ranked = $grades->sortByDesc('grade')->values();
                $rankMap = [];
                foreach ($ranked as $i => $g) {
                    $rankMap[$g->student_id] = $i + 1;
                }

                $studentsWithRank = $students->map(fn ($s) => array_merge(
                    $s,
                    ['rank' => $rankMap[$s['id']] ?? null]
                ))->values();

                return [
                    'id'             => $module->id,
                    'name'           => $module->name,
                    'code'           => $module->code,
                    'coefficient'    => $module->coefficient,
                    'teacher_name'   => $module->teacher?->name ?? 'Unassigned',
                    'teacher_id'     => $module->teacher_id,
                    'semester_name'  => $module->semesterObj?->name ?? ('S' . $module->semester),
                    'specialization' => $module->specialization?->name,
                    'is_published'   => $module->is_published,
                    'published_at'   => $module->published_at?->toDateString(),
                    'enrolled_count' => $enrolledCount,
                    'graded_count'   => $gradedCount,
                    'avg_grade'      => $avgGrade,
                    'students'       => $studentsWithRank,
                ];
            });

        // Overall class ranking based on published modules
        $publishedModules = Module::where('is_published', true)->get(['id', 'coefficient']);
        $publishedIds     = $publishedModules->pluck('id');

        $classRanking = [];
        if ($publishedIds->isNotEmpty()) {
            $allGrades = Grade::whereIn('module_id', $publishedIds)->get();
            $coefMap   = $publishedModules->keyBy('id');

            $classRanking = User::where('role', Role::Student)
                ->get(['id', 'name'])
                ->map(function (User $s) use ($allGrades, $coefMap) {
                    $sGrades = $allGrades->where('student_id', $s->id);
                    if ($sGrades->isEmpty()) return null;

                    $totalCoef = 0; $weighted = 0;
                    foreach ($sGrades as $g) {
                        $c = $coefMap->get($g->module_id)?->coefficient ?? 1;
                        $totalCoef += $c;
                        $weighted  += $g->grade * $c;
                    }
                    return [
                        'id'      => $s->id,
                        'name'    => $s->name,
                        'average' => $totalCoef > 0 ? round($weighted / $totalCoef, 2) : null,
                    ];
                })
                ->filter(fn ($s) => $s && $s['average'] !== null)
                ->sortByDesc('average')
                ->values()
                ->toArray();
        }

        return Inertia::render('Admin/Results', [
            'modules'       => $modules,
            'class_ranking' => $classRanking,
        ]);
    }

    public function updateGrades(Request $request, Module $module): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'grades'   => ['required', 'array'],
            'grades.*' => ['nullable', 'numeric', 'min:0', 'max:20'],
        ]);

        foreach ($request->grades as $studentId => $rawGrade) {
            $grade = ($rawGrade !== null && $rawGrade !== '') ? (float) $rawGrade : null;

            if ($grade === null) {
                Grade::where('student_id', $studentId)->where('module_id', $module->id)->delete();
            } else {
                Grade::updateOrCreate(
                    ['student_id' => $studentId, 'module_id' => $module->id],
                    ['grade' => $grade]
                );
            }
        }

        return back()->with('success', 'Grades updated successfully.');
    }

    public function publish(Request $request, Module $module): \Illuminate\Http\RedirectResponse
    {
        $module->update([
            'is_published' => true,
            'published_at' => now(),
            'published_by' => $request->user()->id,
        ]);

        $students = $module->students;
        if ($students->isNotEmpty()) {
            Notification::send($students, new ResultsPublished($module));
        }

        return back()->with('success', "Results for \"{$module->name}\" published — students notified.");
    }

    public function unpublish(Module $module): \Illuminate\Http\RedirectResponse
    {
        $module->update([
            'is_published' => false,
            'published_at' => null,
            'published_by' => null,
        ]);

        return back()->with('success', "Results for \"{$module->name}\" unpublished.");
    }
}
