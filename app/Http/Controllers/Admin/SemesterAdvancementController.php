<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Module;
use App\Models\Semester;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SemesterAdvancementController extends Controller
{
    private const NEXT = ['S1' => 'S2', 'S2' => 'S3', 'S3' => 'S4'];
    private const PASS_MARK = 10;

    public function index(): Response
    {
        return Inertia::render('Admin/Advancement', [
            'preview' => $this->buildPreview(),
        ]);
    }

    public function advance(Request $request): RedirectResponse
    {
        $request->validate(['confirmed' => ['required', 'accepted']]);

        $totalAdvanced  = 0;
        $totalRepeating = 0;
        $totalGraduated = 0;

        foreach (Specialization::with('semesters')->get() as $spec) {
            $sems = $spec->semesters->keyBy('name');

            foreach (self::NEXT as $fromName => $toName) {
                if (! isset($sems[$fromName], $sems[$toName])) {
                    continue;
                }

                $fromSem     = $sems[$fromName];
                $toSem       = $sems[$toName];
                $fromModules = Module::where('semester_id', $fromSem->id)->get();
                $toModules   = Module::where('semester_id', $toSem->id)->get();

                $students = User::where('role', Role::Student)
                    ->where('semester_id', $fromSem->id)
                    ->get();

                foreach ($students as $student) {
                    $avg = $this->weightedAverage($student->id, $fromModules);

                    if ($avg === null || $avg < self::PASS_MARK) {
                        $totalRepeating++;
                        continue; // stays in current semester
                    }

                    $student->update(['semester_id' => $toSem->id]);
                    $student->enrolledModules()->detach($fromModules->pluck('id')->all());
                    foreach ($toModules as $module) {
                        $module->students()->syncWithoutDetaching([$student->id]);
                    }
                    $totalAdvanced++;
                }
            }

            // S4 → Graduate (only students who pass S4)
            if (isset($sems['S4'])) {
                $s4Modules  = Module::where('semester_id', $sems['S4']->id)->get();
                $s4Students = User::where('role', Role::Student)
                    ->where('semester_id', $sems['S4']->id)
                    ->get();

                foreach ($s4Students as $student) {
                    $avg = $this->weightedAverage($student->id, $s4Modules);

                    if ($avg === null || $avg < self::PASS_MARK) {
                        $totalRepeating++;
                        continue;
                    }

                    $student->enrolledModules()->detach($s4Modules->pluck('id')->all());
                    $student->update(['semester_id' => null]);
                    $totalGraduated++;
                }
            }
        }

        $msg = [];
        if ($totalAdvanced > 0)  $msg[] = "{$totalAdvanced} student" . ($totalAdvanced  > 1 ? 's' : '') . " advanced";
        if ($totalGraduated > 0) $msg[] = "{$totalGraduated} student" . ($totalGraduated > 1 ? 's' : '') . " graduated";
        if ($totalRepeating > 0) $msg[] = "{$totalRepeating} student" . ($totalRepeating > 1 ? 's' : '') . " repeat (average < 10)";

        return redirect()->route('admin.advancement.index')
            ->with('success', implode(' · ', $msg) . '.');
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    /**
     * Weighted average (by coefficient) for a student across a set of modules.
     * Returns null if no grades have been entered at all.
     */
    private function weightedAverage(int $studentId, Collection $modules): ?float
    {
        if ($modules->isEmpty()) {
            return null;
        }

        $totalWeight = 0;
        $totalScore  = 0;
        $graded      = 0;

        foreach ($modules as $module) {
            $grade = Grade::where('student_id', $studentId)
                ->where('module_id', $module->id)
                ->value('grade');

            if ($grade !== null) {
                $totalScore  += $grade * $module->coefficient;
                $totalWeight += $module->coefficient;
                $graded++;
            }
        }

        if ($graded === 0 || $totalWeight === 0) {
            return null;
        }

        return round($totalScore / $totalWeight, 2);
    }

    // ─── Preview ────────────────────────────────────────────────────────────

    private function buildPreview(): array
    {
        $specs           = [];
        $totalAdvancing  = 0;
        $totalRepeating  = 0;
        $totalGraduating = 0;
        $totalPending    = 0; // rows still waiting for grades

        foreach (Specialization::with('semesters')->orderBy('code')->get() as $spec) {
            $sems = $spec->semesters->keyBy('name');
            $rows = [];

            $semNames = array_merge(array_keys(self::NEXT), ['S4']);

            foreach ($semNames as $fromName) {
                if (! isset($sems[$fromName])) {
                    continue;
                }

                $toName  = $fromName === 'S4' ? 'graduate' : (self::NEXT[$fromName] ?? null);
                $fromSem = $sems[$fromName];
                $modules = Module::where('semester_id', $fromSem->id)->get();

                $students = User::where('role', Role::Student)
                    ->where('semester_id', $fromSem->id)
                    ->get();

                if ($students->isEmpty()) {
                    continue;
                }

                // ── Check if every student has a grade in every module ────────
                $incompleteModules = [];
                foreach ($modules as $module) {
                    $gradedCount   = Grade::where('module_id', $module->id)
                        ->whereIn('student_id', $students->pluck('id'))
                        ->count();
                    $enrolledCount = $students->count();

                    if ($gradedCount < $enrolledCount) {
                        $incompleteModules[] = [
                            'name'    => $module->name,
                            'teacher' => $module->teacher?->name ?? 'Unassigned',
                            'graded'  => $gradedCount,
                            'total'   => $enrolledCount,
                        ];
                    }
                }

                $gradesComplete = empty($incompleteModules);

                $targetSem     = isset($sems[$toName]) ? $sems[$toName] : null;
                $targetModules = ($targetSem && $toName !== 'graduate')
                    ? Module::where('semester_id', $targetSem->id)->count()
                    : null;

                $row = [
                    'from'             => $fromName,
                    'to'               => $toName,
                    'total'            => $students->count(),
                    'grades_complete'  => $gradesComplete,
                    'incomplete_modules' => $incompleteModules,
                    'target_modules'   => $targetModules,
                    'warn_modules'     => $targetModules === 0 && $toName !== 'graduate',
                    // only populated when grades_complete
                    'advancing'        => 0,
                    'repeating'        => 0,
                ];

                if ($gradesComplete) {
                    foreach ($students as $student) {
                        $avg = $this->weightedAverage($student->id, $modules);
                        if ($avg !== null && $avg >= self::PASS_MARK) {
                            $row['advancing']++;
                        } else {
                            $row['repeating']++;
                        }
                    }

                    if ($fromName === 'S4') {
                        $totalGraduating += $row['advancing'];
                    } else {
                        $totalAdvancing += $row['advancing'];
                    }
                    $totalRepeating += $row['repeating'];
                } else {
                    $totalPending++;
                }

                $rows[] = $row;
            }

            if (! empty($rows)) {
                $specs[] = [
                    'id'   => $spec->id,
                    'code' => $spec->code,
                    'name' => $spec->name,
                    'rows' => $rows,
                ];
            }
        }

        $readyToAdvance = $totalPending === 0 && ($totalAdvancing + $totalGraduating + $totalRepeating) > 0;

        return [
            'specs'             => $specs,
            'total_advancing'   => $totalAdvancing,
            'total_graduating'  => $totalGraduating,
            'total_repeating'   => $totalRepeating,
            'total_pending'     => $totalPending,
            'ready_to_advance'  => $readyToAdvance,
            'nothing_to_do'     => empty($specs),
        ];
    }
}
