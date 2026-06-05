<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use App\Models\Specialization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SpecializationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'code'        => ['required', 'string', 'max:20', 'unique:specializations,code'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $spec = Specialization::create([
            'name'        => $validated['name'],
            'code'        => strtoupper(trim($validated['code'])),
            'description' => $validated['description'] ?? null,
        ]);

        foreach (['S1', 'S2', 'S3', 'S4'] as $sem) {
            Semester::create(['specialization_id' => $spec->id, 'name' => $sem]);
        }

        return back()->with('success', "Specialization \"{$spec->name}\" created with semesters S1–S4.");
    }

    public function destroy(Specialization $specialization): RedirectResponse
    {
        $name = $specialization->name;

        foreach ($specialization->semesters as $semester) {
            if ($semester->timetable_path) {
                Storage::disk('public')->delete($semester->timetable_path);
            }
        }

        $specialization->delete();

        return back()->with('success', "Specialization \"{$name}\" deleted.");
    }
}
