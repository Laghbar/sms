<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Module;
use App\Models\Specialization;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function dashboard(): Response
    {
        $totalModules    = Module::count();
        $publishedCount  = Module::where('is_published', true)->count();
        $gradesEntered   = Grade::count();
        $studentsGraded  = Grade::distinct('student_id')->count('student_id');

        // Per-module publication status for the summary table
        $moduleSummary = Module::with('teacher:id,name')
            ->withCount('students')
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

        $stats = [
            'teachers'         => User::where('role', Role::Teacher)->count(),
            'students'         => User::where('role', Role::Student)->count(),
            'admins'           => User::where('role', Role::Admin)->count(),
            'modules'          => $totalModules,
            'modules_published'=> $publishedCount,
            'modules_pending'  => $totalModules - $publishedCount,
            'grades_entered'   => $gradesEntered,
            'students_graded'  => $studentsGraded,
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats'         => $stats,
            'moduleSummary' => $moduleSummary,
        ]);
    }

    public function users(Request $request): Response
    {
        $query = User::query()
            ->whereNot('role', Role::Admin)
            ->with(['specialization:id,name,code', 'semesterObj:id,name'])
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
            ->orderBy('created_at', 'desc');

        $users = $query->paginate(15)->withQueryString();

        $users->getCollection()->transform(function (User $u) {
            return [
                'id'             => $u->id,
                'name'           => $u->name,
                'email'          => $u->email,
                'role'           => $u->role->value,
                'created_at'     => $u->created_at->toDateString(),
                'specialization' => $u->specialization
                    ? ['name' => $u->specialization->name, 'code' => $u->specialization->code]
                    : null,
                'semester'       => $u->semesterObj?->name,
            ];
        });

        $specializations = Specialization::orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('Admin/Users', [
            'users'           => $users,
            'filters'         => $request->only('search', 'role', 'specialization_id'),
            'specializations' => $specializations,
        ]);
    }

    public function destroy(User $user): RedirectResponse
    {
        abort_if($user->isAdmin(), 403);
        $name = $user->name;
        $user->delete();
        return back()->with('success', "User \"{$name}\" has been deleted.");
    }

}
