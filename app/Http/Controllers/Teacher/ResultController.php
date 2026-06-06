<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Module;
use App\Notifications\ResultsPublished;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class ResultController extends Controller
{
    public function index(Request $request): Response
    {
        $teacher = $request->user();

        // Primary: modules where teacher_id = this teacher (new direct assignment)
        $modules = Module::where('teacher_id', $teacher->id)
            ->with(['students:id,name,email', 'semesterObj:id,name'])
            ->orderBy('name')
            ->get();

        // Fallback: also include legacy pivot-assigned modules not yet migrated
        $legacyIds = $teacher->taughtModules()->pluck('modules.id');
        $alreadyIds = $modules->pluck('id');
        $missingIds = $legacyIds->diff($alreadyIds);

        if ($missingIds->isNotEmpty()) {
            $legacyModules = Module::whereIn('id', $missingIds)
                ->with(['students:id,name,email', 'semesterObj:id,name'])
                ->orderBy('name')
                ->get();
            $modules = $modules->concat($legacyModules);
        }

        $result = $modules->map(function (Module $module) {
            $grades = Grade::where('module_id', $module->id)
                ->pluck('grade', 'student_id');

            return [
                'id'           => $module->id,
                'name'         => $module->name,
                'code'         => $module->code,
                'coefficient'  => $module->coefficient,
                'semester_name' => $module->semesterObj?->name ?? ('S' . $module->semester),
                'is_published' => $module->is_published,
                'published_at' => $module->published_at?->toDateTimeString(),
                'students'     => $module->students->map(fn (object $s) => [
                    'id'    => $s->id,
                    'name'  => $s->name,
                    'grade' => isset($grades[$s->id]) ? (float) $grades[$s->id] : null,
                    'note'  => $s->pivot->note ?? '',
                ])->values(),
            ];
        });

        return Inertia::render('Teacher/Results', ['modules' => $result]);
    }

    public function saveGrades(Request $request, Module $module): \Illuminate\Http\RedirectResponse
    {
        $this->authorizeTeacher($request, $module);

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
                    ['student_id' => $studentId, 'module_id' => $module->id, 'academic_year_id' => AcademicYear::currentId()],
                    ['grade' => $grade]
                );
            }
        }

        return back()->with('success', 'Grades saved successfully.');
    }

    public function publish(Request $request, Module $module): \Illuminate\Http\RedirectResponse
    {
        $this->authorizeTeacher($request, $module);

        $module->update([
            'is_published' => true,
            'published_at' => now(),
            'published_by' => $request->user()->id,
        ]);

        $students = $module->students;
        if ($students->isNotEmpty()) {
            Notification::send($students, new ResultsPublished($module));
        }

        return back()->with('success', 'Results published — students have been notified.');
    }

    public function unpublish(Request $request, Module $module): \Illuminate\Http\RedirectResponse
    {
        $this->authorizeTeacher($request, $module);

        $module->update([
            'is_published' => false,
            'published_at' => null,
            'published_by' => null,
        ]);

        return back()->with('success', 'Results unpublished.');
    }

    public function saveNotes(Request $request, Module $module): \Illuminate\Http\RedirectResponse
    {
        $this->authorizeTeacher($request, $module);

        $request->validate([
            'notes'   => ['required', 'array'],
            'notes.*' => ['nullable', 'string', 'max:1000'],
        ]);

        foreach ($request->notes as $studentId => $note) {
            DB::table('student_module')
                ->where('student_id', $studentId)
                ->where('module_id', $module->id)
                ->update(['note' => $note ?: null]);
        }

        return back()->with('success', 'Notes saved.');
    }

    private function authorizeTeacher(Request $request, Module $module): void
    {
        $teacher = $request->user();
        $direct  = $module->teacher_id === $teacher->id;
        $pivot   = $teacher->taughtModules()->where('modules.id', $module->id)->exists();
        abort_if(!$direct && !$pivot, 403);
    }
}
