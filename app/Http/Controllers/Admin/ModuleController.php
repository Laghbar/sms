<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    public function index(Request $request): Response
    {
        $modules = Module::query()
            ->withCount(['teachers', 'students', 'schedules'])
            ->when($request->search, fn ($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
            )
            ->orderBy('semester')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Modules', [
            'modules' => $modules,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'code'        => ['required', 'string', 'max:50', 'unique:modules,code'],
            'coefficient' => ['required', 'integer', 'min:1', 'max:10'],
            'semester'    => ['required', 'integer', 'min:1', 'max:10'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        Module::create($validated);

        return back()->with('success', 'Module created.');
    }

    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'code'        => ['required', 'string', 'max:50', "unique:modules,code,{$module->id}"],
            'coefficient' => ['required', 'integer', 'min:1', 'max:10'],
            'semester'    => ['required', 'integer', 'min:1', 'max:10'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $module->update($validated);

        return back()->with('success', 'Module updated.');
    }

    public function destroy(Module $module)
    {
        $module->delete();

        return back()->with('success', 'Module deleted.');
    }

    public function students(Module $module): Response
    {
        $enrolled  = $module->students()->orderBy('name')->get(['users.id', 'users.name', 'users.email']);
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
        $request->validate([
            'student_id' => ['required', 'exists:users,id'],
        ]);

        $module->students()->syncWithoutDetaching([$request->student_id]);

        return back()->with('success', 'Student enrolled.');
    }

    public function unenrollStudent(Module $module, User $student)
    {
        $module->students()->detach($student->id);

        return back()->with('success', 'Student removed.');
    }
}
