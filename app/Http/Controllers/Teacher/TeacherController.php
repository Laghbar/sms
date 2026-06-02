<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $teacher = $request->user()->load('taughtModules');

        $moduleIds = $teacher->taughtModules->pluck('id');

        $stats = [
            'modules'  => $teacher->taughtModules->count(),
            'students' => \App\Models\Module::whereIn('id', $moduleIds)
                ->withCount('students')
                ->get()
                ->sum('students_count'),
            'tps'      => \App\Models\Tp::whereIn('module_id', $moduleIds)->count(),
        ];

        return Inertia::render('Teacher/Dashboard', ['stats' => $stats]);
    }

    public function modules(Request $request): Response
    {
        $modules = $request->user()
            ->taughtModules()
            ->withCount('students')
            ->with('schedules')
            ->orderBy('semester')
            ->get();

        return Inertia::render('Teacher/Modules', ['modules' => $modules]);
    }

    public function schedule(Request $request): Response
    {
        $moduleIds = $request->user()->taughtModules()->pluck('modules.id');

        $schedules = \App\Models\Schedule::whereIn('module_id', $moduleIds)
            ->with('module:id,name,code')
            ->orderByRaw("FIELD(day,'monday','tuesday','wednesday','thursday','friday','saturday')")
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Teacher/Schedule', ['schedules' => $schedules]);
    }
}
