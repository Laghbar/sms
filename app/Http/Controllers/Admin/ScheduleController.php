<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $schedules = Schedule::query()
            ->with('module:id,name,code')
            ->when($request->module_id, fn ($q) =>
                $q->where('module_id', $request->module_id)
            )
            ->orderByRaw("CASE day
                WHEN 'monday'    THEN 1
                WHEN 'tuesday'   THEN 2
                WHEN 'wednesday' THEN 3
                WHEN 'thursday'  THEN 4
                WHEN 'friday'    THEN 5
                WHEN 'saturday'  THEN 6
            END")
            ->orderBy('start_time')
            ->paginate(20)
            ->withQueryString();

        $modules = Module::orderBy('semester')->orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('Admin/Schedules', [
            'schedules' => $schedules,
            'modules'   => $modules,
            'filters'   => $request->only('module_id'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'module_id'   => ['required', 'exists:modules,id'],
            'day'         => ['required', 'in:monday,tuesday,wednesday,thursday,friday,saturday'],
            'start_time'  => ['required', 'date_format:H:i'],
            'end_time'    => ['required', 'date_format:H:i', 'after:start_time'],
            'room'        => ['required', 'string', 'max:50'],
            'type'        => ['required', 'in:cours,td,tp'],
            'week_parity' => ['required', 'in:all,odd,even'],
        ]);

        Schedule::create($validated);

        return back()->with('success', 'Schedule created.');
    }

    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'module_id'   => ['required', 'exists:modules,id'],
            'day'         => ['required', 'in:monday,tuesday,wednesday,thursday,friday,saturday'],
            'start_time'  => ['required', 'date_format:H:i'],
            'end_time'    => ['required', 'date_format:H:i', 'after:start_time'],
            'room'        => ['required', 'string', 'max:50'],
            'type'        => ['required', 'in:cours,td,tp'],
            'week_parity' => ['required', 'in:all,odd,even'],
        ]);

        $schedule->update($validated);

        return back()->with('success', 'Schedule updated.');
    }

    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        return back()->with('success', 'Schedule deleted.');
    }
}
