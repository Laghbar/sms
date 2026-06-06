<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $modules = $request->user()
            ->taughtModules()
            ->withCount('students')
            ->orderBy('semester')
            ->get()
            ->map(fn (Module $m) => [
                'id'             => $m->id,
                'name'           => $m->name,
                'code'           => $m->code,
                'semester'       => $m->semester,
                'students_count' => $m->students_count,
                'sessions_count' => Attendance::where('module_id', $m->id)
                    ->distinct('session_date')
                    ->count('session_date'),
                'last_session'   => Attendance::where('module_id', $m->id)
                    ->max('session_date'),
            ]);

        return Inertia::render('Teacher/Attendance', ['modules' => $modules]);
    }

    public function session(Request $request, Module $module): Response
    {
        abort_unless(
            $request->user()->taughtModules()->where('modules.id', $module->id)->exists(),
            403
        );

        $date = $request->date ?? today()->toDateString();

        $students = $module->students()->orderBy('name')->get(['users.id', 'users.name']);

        $existing = Attendance::where('module_id', $module->id)
            ->where('session_date', $date)
            ->get()
            ->keyBy('student_id');

        $rows = $students->map(fn ($s) => [
            'student_id' => $s->id,
            'name'       => $s->name,
            'status'     => $existing->get($s->id)?->status ?? null,
            'note'       => $existing->get($s->id)?->note ?? '',
        ]);

        $sessions = Attendance::where('module_id', $module->id)
            ->selectRaw('session_date, count(*) as total,
                sum(status = "present")  as present_count,
                sum(status = "absent")   as absent_count,
                sum(status = "late")     as late_count,
                sum(status = "excused")  as excused_count')
            ->groupBy('session_date')
            ->orderByDesc('session_date')
            ->limit(20)
            ->get();

        return Inertia::render('Teacher/AttendanceSession', [
            'module'   => [
                'id'       => $module->id,
                'name'     => $module->name,
                'code'     => $module->code,
                'semester' => $module->semester,
            ],
            'date'     => $date,
            'rows'     => $rows,
            'sessions' => $sessions,
        ]);
    }

    public function save(Request $request, Module $module)
    {
        abort_unless(
            $request->user()->taughtModules()->where('modules.id', $module->id)->exists(),
            403
        );

        $validated = $request->validate([
            'date'                   => ['required', 'date'],
            'records'                => ['required', 'array'],
            'records.*.student_id'   => ['required', 'exists:users,id'],
            'records.*.status'       => ['required', 'in:present,absent,late,excused'],
            'records.*.note'         => ['nullable', 'string', 'max:255'],
        ]);

        $markedBy = $request->user()->id;

        $yearId = AcademicYear::currentId();

        foreach ($validated['records'] as $record) {
            Attendance::updateOrCreate(
                [
                    'module_id'        => $module->id,
                    'student_id'       => $record['student_id'],
                    'session_date'     => $validated['date'],
                ],
                [
                    'status'           => $record['status'],
                    'note'             => $record['note'] ?? null,
                    'marked_by'        => $markedBy,
                    'academic_year_id' => $yearId,
                ]
            );
        }

        return redirect()
            ->route('teacher.attendance.session', [$module, 'date' => $validated['date']])
            ->with('success', 'Attendance saved.');
    }
}
