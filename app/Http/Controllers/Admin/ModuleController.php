<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    public function index(Request $request): Response
    {
        $modules = Module::query()
            ->with(['teacher:id,name', 'specialization:id,name,code', 'semesterObj:id,name'])
            ->withCount(['students', 'schedules'])
            ->when($request->search, fn ($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
            )
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        // Flatten relationship data for Inertia
        $modules->getCollection()->transform(fn (Module $m) => [
            'id'             => $m->id,
            'name'           => $m->name,
            'code'           => $m->code,
            'semester'       => $m->semester,
            'coefficient'    => $m->coefficient,
            'description'    => $m->description,
            'teacher_id'     => $m->teacher_id,
            'teacher_name'   => $m->teacher?->name,
            'specialization_id'   => $m->specialization_id,
            'specialization_name' => $m->specialization?->name,
            'specialization_code' => $m->specialization?->code,
            'is_published'   => $m->is_published,
            'students_count' => $m->students_count,
            'schedules_count'=> $m->schedules_count,
        ]);

        $teachers        = User::where('role', Role::Teacher)->orderBy('name')->get(['id', 'name']);
        $specializations = Specialization::orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('Admin/Modules', [
            'modules'         => $modules,
            'teachers'        => $teachers,
            'specializations' => $specializations,
            'filters'         => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'              => ['required', 'string', 'max:255'],
            'code'              => ['required', 'string', 'max:50', 'unique:modules,code'],
            'coefficient'       => ['required', 'integer', 'min:1', 'max:10'],
            'semester'          => ['required', 'integer', 'min:1', 'max:10'],
            'description'       => ['nullable', 'string', 'max:1000'],
            'teacher_id'        => ['nullable', 'exists:users,id'],
            'specialization_id' => ['nullable', 'exists:specializations,id'],
        ]);

        $module = Module::create($validated);

        if ($validated['teacher_id'] ?? null) {
            $module->teachers()->syncWithoutDetaching([$validated['teacher_id']]);
        }

        return back()->with('success', 'Module created.');
    }

    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'name'              => ['required', 'string', 'max:255'],
            'code'              => ['required', 'string', 'max:50', "unique:modules,code,{$module->id}"],
            'coefficient'       => ['required', 'integer', 'min:1', 'max:10'],
            'semester'          => ['required', 'integer', 'min:1', 'max:10'],
            'description'       => ['nullable', 'string', 'max:1000'],
            'teacher_id'        => ['nullable', 'exists:users,id'],
            'specialization_id' => ['nullable', 'exists:specializations,id'],
        ]);

        $module->update($validated);

        // Keep legacy pivot in sync
        if ($validated['teacher_id'] ?? null) {
            $module->teachers()->sync([$validated['teacher_id']]);
        } else {
            $module->teachers()->detach();
        }

        return back()->with('success', 'Module updated.');
    }

    public function destroy(Module $module)
    {
        $module->delete();
        return back()->with('success', 'Module deleted.');
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
