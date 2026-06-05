<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Semester;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    public function index(Request $request): Response
    {
        $specId  = $request->specialization_id;
        $semId   = $request->semester_id;

        // Only query modules when both filters are chosen
        $modules = null;
        if ($specId && $semId) {
            $modules = Module::query()
                ->with(['teacher:id,name'])
                ->withCount(['students', 'schedules'])
                ->where('specialization_id', $specId)
                ->where('semester_id', $semId)
                ->orderBy('name')
                ->get()
                ->map(fn (Module $m) => [
                    'id'              => $m->id,
                    'name'            => $m->name,
                    'code'            => $m->code,
                    'coefficient'     => $m->coefficient,
                    'description'     => $m->description,
                    'teacher_id'      => $m->teacher_id,
                    'teacher_name'    => $m->teacher?->name,
                    'is_published'    => $m->is_published,
                    'students_count'  => $m->students_count,
                    'semester_id'     => $m->semester_id,
                    'specialization_id' => $m->specialization_id,
                ]);
        }

        $teachers = User::where('role', Role::Teacher)->orderBy('name')->get(['id', 'name']);

        $specializations = Specialization::with(['semesters' => fn ($q) => $q->orderBy('name')])
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('Admin/Modules', [
            'modules'         => $modules,        // null = nothing selected yet
            'teachers'        => $teachers,
            'specializations' => $specializations,
            'filters'         => $request->only('specialization_id', 'semester_id'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'              => ['required', 'string', 'max:255'],
            'code'              => ['required', 'string', 'max:50', 'unique:modules,code'],
            'coefficient'       => ['required', 'integer', 'min:1', 'max:10'],
            'specialization_id' => ['required', 'exists:specializations,id'],
            'semester_id'       => ['required', 'exists:semesters,id'],
            'teacher_id'        => ['nullable', 'exists:users,id'],
            'description'       => ['nullable', 'string', 'max:1000'],
        ]);

        // Derive legacy semester integer from semester name (S1→1, S2→2 …)
        $semName = Semester::find($validated['semester_id'])?->name ?? 'S1';
        $validated['semester'] = (int) preg_replace('/\D/', '', $semName) ?: 1;

        $module = Module::create($validated);

        if ($validated['teacher_id'] ?? null) {
            $module->teachers()->syncWithoutDetaching([$validated['teacher_id']]);
        }

        return back()->with('success', "Module \"{$module->name}\" created.");
    }

    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'name'              => ['required', 'string', 'max:255'],
            'code'              => ['required', 'string', 'max:50', "unique:modules,code,{$module->id}"],
            'coefficient'       => ['required', 'integer', 'min:1', 'max:10'],
            'specialization_id' => ['required', 'exists:specializations,id'],
            'semester_id'       => ['required', 'exists:semesters,id'],
            'teacher_id'        => ['nullable', 'exists:users,id'],
            'description'       => ['nullable', 'string', 'max:1000'],
        ]);

        $semName = Semester::find($validated['semester_id'])?->name ?? 'S1';
        $validated['semester'] = (int) preg_replace('/\D/', '', $semName) ?: 1;

        $module->update($validated);

        if ($validated['teacher_id'] ?? null) {
            $module->teachers()->sync([$validated['teacher_id']]);
        } else {
            $module->teachers()->detach();
            $module->update(['teacher_id' => null]);
        }

        return back()->with('success', "Module \"{$module->name}\" updated.");
    }

    public function destroy(Module $module)
    {
        $name = $module->name;
        $module->delete();
        return back()->with('success', "Module \"{$name}\" deleted.");
    }

    public function students(Module $module): Response
    {
        $enrolled    = $module->students()->orderBy('name')->get(['users.id', 'users.name', 'users.email']);
        $enrolledIds = $enrolled->pluck('id');

        $available = User::where('role', Role::Student)
            ->whereNotIn('id', $enrolledIds)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/ModuleStudents', [
            'module'    => $module,
            'enrolled'  => $enrolled,
            'available' => $available,
        ]);
    }

    public function enrollStudent(Request $request, Module $module)
    {
        $request->validate(['student_id' => ['required', 'exists:users,id']]);
        $module->students()->syncWithoutDetaching([$request->student_id]);
        return back()->with('success', 'Student enrolled.');
    }

    public function unenrollStudent(Module $module, User $student)
    {
        $module->students()->detach($student->id);
        return back()->with('success', 'Student removed.');
    }
}
