<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ModuleScheduleController extends Controller
{
    public function store(Request $request, Module $module)
    {
        $validated = $request->validate([
            'day'         => ['required', 'in:monday,tuesday,wednesday,thursday,friday,saturday'],
            'type'        => ['required', 'in:cours,td,tp'],
            'start_time'  => ['required', 'date_format:H:i'],
            'end_time'    => ['required', 'date_format:H:i', 'after:start_time'],
            'room'        => ['required', 'string', 'max:100'],
            'week_parity' => ['required', 'in:all,odd,even'],
        ]);

        $module->schedules()->create($validated);

        return back()->with('success', 'Session added.');
    }

    public function destroy(Module $module, Schedule $schedule)
    {
        $schedule->delete();

        return back()->with('success', 'Session removed.');
    }
}
