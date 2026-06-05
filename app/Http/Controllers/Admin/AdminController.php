<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Module;
use App\Models\Semester;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $specId = $request->specialization_id;
        $semId  = $request->semester_id;

        // Global stats always use full counts
        $totalModules   = Module::count();
        $publishedCount = Module::where('is_published', true)->count();
        $gradesEntered  = Grade::count();
        $studentsGraded = Grade::distinct('student_id')->count('student_id');

        $stats = [
            'teachers'          => User::where('role', Role::Teacher)->count(),
            'students'          => User::where('role', Role::Student)->count(),
            'admins'            => User::where('role', Role::Admin)->count(),
            'modules'           => $totalModules,
            'modules_published' => $publishedCount,
            'modules_pending'   => $totalModules - $publishedCount,
            'grades_entered'    => $gradesEntered,
            'students_graded'   => $studentsGraded,
        ];

        // Module summary — filtered when spec+semester are selected
        $moduleSummary = null;
        if ($specId && $semId) {
            $moduleSummary = Module::with('teacher:id,name')
                ->withCount('students')
                ->where('specialization_id', $specId)
                ->where('semester_id', $semId)
                ->orderBy('name')
                ->get()
                ->map(fn (Module $m) => [
                    'id'             => $m->id,
                    'name'           => $m->name,
                    'teacher_name'   => $m->teacher?->name ?? '—',
                    'is_published'   => $m->is_published,
                    'students_count' => $m->students_count,
                    'grades_count'   => Grade::where('module_id', $m->id)->count(),
                ]);
        }

        $specializations = Specialization::with(['semesters' => fn ($q) => $q->orderBy('name')])
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('Admin/Dashboard', [
            'stats'           => $stats,
            'moduleSummary'   => $moduleSummary,  // null = nothing selected
            'specializations' => $specializations,
            'filters'         => $request->only('specialization_id', 'semester_id'),
        ]);
    }

    public function users(Request $request): Response
    {
        $query = User::query()
            ->whereNot('role', Role::Admin)
            ->with(['specialization:id,name,code', 'semesterObj:id,name', 'teachingModules:id,name,code,teacher_id'])
            ->when($request->search, fn ($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when($request->role, fn ($q) =>
                $q->where('role', $request->role)
            )
            ->when($request->specialization_id, fn ($q) =>
                $q->where('specialization_id', $request->specialization_id)
            )
            ->when($request->semester_id, fn ($q) =>
                $q->where('semester_id', $request->semester_id)
            )
            ->orderBy('created_at', 'desc');

        $users = $query->paginate(15)->withQueryString();

        $users->getCollection()->transform(function (User $u) {
            return [
                'id'             => $u->id,
                'name'           => $u->name,
                'email'          => $u->email,
                'role'           => $u->role->value,
                'created_at'     => $u->created_at->toDateString(),
                'specialization'   => $u->specialization
                    ? ['id' => $u->specialization->id, 'name' => $u->specialization->name, 'code' => $u->specialization->code]
                    : null,
                'semester'         => $u->semesterObj?->name,
                'semester_id'      => $u->semester_id,
                'teaching_modules' => $u->isTeacher()
                    ? $u->teachingModules->map(fn ($m) => ['id' => $m->id, 'name' => $m->name, 'code' => $m->code])->values()->toArray()
                    : [],
            ];
        });

        $specializations = Specialization::with('semesters:id,specialization_id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        $semesters = Semester::orderBy('name')->get(['id', 'specialization_id', 'name']);

        $modules = Module::with('specialization:id,code')
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'specialization_id']);

        return Inertia::render('Admin/Users', [
            'users'           => $users,
            'filters'         => $request->only('search', 'role', 'specialization_id', 'semester_id'),
            'specializations' => $specializations,
            'semesters'       => $semesters,
            'modules'         => $modules,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $role = $request->input('role', 'student');
        abort_if(! in_array($role, ['student', 'teacher']), 422);

        $rules = [
            'role'     => ['required', 'in:student,teacher'],
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];

        if ($role === 'student') {
            $rules['specialization_id'] = ['required', 'exists:specializations,id'];
            $rules['semester_id']       = ['required', 'exists:semesters,id'];
        } else {
            $rules['module_ids']   = ['nullable', 'array'];
            $rules['module_ids.*'] = ['exists:modules,id'];
        }

        $validated = $request->validate($rules);

        $user = User::create([
            'name'              => $validated['name'],
            'email'             => $validated['email'],
            'password'          => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role'              => $role === 'student' ? Role::Student : Role::Teacher,
            'email_verified_at' => now(),
            'specialization_id' => $validated['specialization_id'] ?? null,
            'semester_id'       => $validated['semester_id'] ?? null,
        ]);

        if ($role === 'student') {
            Module::where('specialization_id', $validated['specialization_id'])
                ->where('semester_id', $validated['semester_id'])
                ->get()
                ->each(fn ($m) => $m->students()->syncWithoutDetaching([$user->id]));

            return back()->with('success', "Student \"{$user->name}\" created and enrolled in modules.");
        }

        // Teacher — assign selected modules
        $moduleIds = $validated['module_ids'] ?? [];
        if ($moduleIds) {
            Module::whereIn('id', $moduleIds)->update(['teacher_id' => $user->id]);
            $user->taughtModules()->sync($moduleIds);
        }

        return back()->with('success', "Teacher \"{$user->name}\" created.");
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        abort_if($user->isAdmin(), 403);

        $validated = $request->validate([
            'name'              => ['required', 'string', 'max:255'],
            'specialization_id' => ['nullable', 'exists:specializations,id'],
            'semester_id'       => ['nullable', 'exists:semesters,id'],
            'module_ids'        => ['nullable', 'array'],
            'module_ids.*'      => ['exists:modules,id'],
        ]);

        $user->update(Arr::only($validated, ['name', 'specialization_id', 'semester_id']));

        // Auto-enrol student in modules for the new specialization/semester
        if ($user->isStudent() && ($validated['specialization_id'] ?? null) && ($validated['semester_id'] ?? null)) {
            Module::where('specialization_id', $validated['specialization_id'])
                ->where('semester_id', $validated['semester_id'])
                ->get()
                ->each(fn ($m) => $m->students()->syncWithoutDetaching([$user->id]));
        }

        // Sync teacher modules
        if ($user->isTeacher()) {
            $moduleIds = $validated['module_ids'] ?? [];

            // Remove teacher_id from modules no longer assigned
            Module::where('teacher_id', $user->id)
                ->whereNotIn('id', $moduleIds)
                ->update(['teacher_id' => null]);

            // Assign teacher_id to newly selected modules
            Module::whereIn('id', $moduleIds)->update(['teacher_id' => $user->id]);

            // Sync pivot table
            $user->taughtModules()->sync($moduleIds);
        }

        return back()->with('success', "User \"{$user->name}\" updated.");
    }

    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        abort_if($user->isAdmin(), 403);

        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->update(['password' => Hash::make($request->password)]);

        return back()->with('success', "Password reset for \"{$user->name}\".");
    }

    public function destroy(User $user): RedirectResponse
    {
        abort_if($user->isAdmin(), 403);
        $name = $user->name;
        $user->delete();
        return back()->with('success', "User \"{$name}\" has been deleted.");
    }

}
