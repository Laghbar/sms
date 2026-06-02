<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Tp;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TpController extends Controller
{
    public function index(Request $request): Response
    {
        $teacher   = $request->user();
        $moduleIds = $teacher->taughtModules()->pluck('modules.id');

        $tps = Tp::whereIn('module_id', $moduleIds)
            ->with('module:id,name,code')
            ->when($request->module_id, fn ($q) =>
                $q->where('module_id', $request->module_id)
            )
            ->orderBy('due_date')
            ->get()
            ->map(fn ($tp) => [
                'id'          => $tp->id,
                'title'       => $tp->title,
                'description' => $tp->description,
                'due_date'    => $tp->due_date->toDateString(),
                'max_grade'   => $tp->max_grade,
                'module'      => $tp->module,
                'is_past'     => $tp->due_date->isPast(),
            ]);

        $modules = $teacher->taughtModules()->orderBy('semester')->get(['modules.id', 'modules.name', 'modules.code']);

        return Inertia::render('Teacher/TPs', [
            'tps'     => $tps,
            'modules' => $modules,
            'filters' => $request->only('module_id'),
        ]);
    }

    public function store(Request $request)
    {
        $moduleIds = $request->user()->taughtModules()->pluck('modules.id');

        $validated = $request->validate([
            'module_id'   => ['required', 'integer', 'in:' . $moduleIds->implode(',')],
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'due_date'    => ['required', 'date', 'after_or_equal:today'],
            'max_grade'   => ['required', 'numeric', 'min:1', 'max:100'],
        ]);

        Tp::create($validated);

        return back()->with('success', 'TP created.');
    }

    public function update(Request $request, Tp $tp)
    {
        $moduleIds = $request->user()->taughtModules()->pluck('modules.id');

        if (! $moduleIds->contains($tp->module_id)) {
            abort(403);
        }

        $validated = $request->validate([
            'module_id'   => ['required', 'integer', 'in:' . $moduleIds->implode(',')],
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'due_date'    => ['required', 'date'],
            'max_grade'   => ['required', 'numeric', 'min:1', 'max:100'],
        ]);

        $tp->update($validated);

        return back()->with('success', 'TP updated.');
    }

    public function destroy(Request $request, Tp $tp)
    {
        $moduleIds = $request->user()->taughtModules()->pluck('modules.id');

        if (! $moduleIds->contains($tp->module_id)) {
            abort(403);
        }

        $tp->delete();

        return back()->with('success', 'TP deleted.');
    }
}
