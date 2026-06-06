<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $student = $request->user();
        $yearId  = AcademicYear::currentId();

        $modules = $student->enrolledModules()
            ->orderBy('semester')
            ->orderBy('name')
            ->get(['modules.id', 'modules.name', 'modules.code', 'modules.semester']);

        $data = $modules->map(function ($module) use ($student, $yearId) {
            $records = Attendance::where('module_id', $module->id)
                ->where('student_id', $student->id)
                ->where('academic_year_id', $yearId)
                ->orderBy('session_date')
                ->get(['session_date', 'status', 'note']);

            $total    = $records->count();
            $present  = $records->where('status', 'present')->count();
            $absent   = $records->where('status', 'absent')->count();
            $late     = $records->where('status', 'late')->count();
            $excused  = $records->where('status', 'excused')->count();
            $rate     = $total > 0 ? round(($present + $late) / $total * 100) : null;

            return [
                'id'       => $module->id,
                'name'     => $module->name,
                'code'     => $module->code,
                'semester' => $module->semester,
                'stats'    => compact('total', 'present', 'absent', 'late', 'excused', 'rate'),
                'sessions' => $records->map(fn ($r) => [
                    'date'   => $r->session_date->toDateString(),
                    'status' => $r->status,
                    'note'   => $r->note,
                ])->values(),
            ];
        });

        return Inertia::render('Student/Attendance', ['modules' => $data]);
    }
}
