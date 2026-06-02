<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Tp;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $student = $request->user();
        $moduleIds = $student->enrolledModules()->pluck('modules.id');

        $results = $student->results()->whereIn('module_id', $moduleIds)->get();
        $average = $results->isNotEmpty() ? round($results->avg('grade'), 2) : null;

        $stats = [
            'modules'        => $moduleIds->count(),
            'average'        => $average,
            'pending_tps'    => Tp::whereIn('module_id', $moduleIds)
                                    ->where('due_date', '>=', now()->toDateString())
                                    ->count(),
        ];

        return Inertia::render('Student/Dashboard', ['stats' => $stats]);
    }

    public function results(Request $request): Response
    {
        $student = $request->user();

        $modules = $student->enrolledModules()
            ->with(['results' => fn ($q) => $q->where('student_id', $student->id)])
            ->orderBy('semester')
            ->get()
            ->map(function ($module) {
                $results = $module->results;
                return [
                    'id'          => $module->id,
                    'name'        => $module->name,
                    'code'        => $module->code,
                    'coefficient' => $module->coefficient,
                    'semester'    => $module->semester,
                    'grades'      => $results->mapWithKeys(fn ($r) => [$r->exam_type => $r->grade]),
                    'average'     => $results->isNotEmpty()
                        ? round($results->avg('grade'), 2)
                        : null,
                ];
            });

        return Inertia::render('Student/Results', ['modules' => $modules]);
    }

    public function schedule(Request $request): Response
    {
        $moduleIds = $request->user()->enrolledModules()->pluck('modules.id');

        $schedules = Schedule::whereIn('module_id', $moduleIds)
            ->with('module:id,name,code')
            ->orderByRaw("FIELD(day,'monday','tuesday','wednesday','thursday','friday','saturday')")
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Student/Schedule', ['schedules' => $schedules]);
    }

    public function tps(Request $request): Response
    {
        $moduleIds = $request->user()->enrolledModules()->pluck('modules.id');

        $tps = Tp::whereIn('module_id', $moduleIds)
            ->with('module:id,name,code')
            ->orderBy('due_date')
            ->get()
            ->map(function ($tp) {
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
