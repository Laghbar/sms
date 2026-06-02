<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function dashboard(): Response
    {
        $stats = [
            'teachers' => User::where('role', Role::Teacher)->count(),
            'students' => User::where('role', Role::Student)->count(),
            'admins'   => User::where('role', Role::Admin)->count(),
        ];

        return Inertia::render('Admin/Dashboard', ['stats' => $stats]);
    }

    public function users(Request $request): Response
    {
        $query = User::query()
            ->whereNot('role', Role::Admin)
            ->when($request->search, fn ($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when($request->role, fn ($q) =>
                $q->where('role', $request->role)
            )
            ->orderBy('created_at', 'desc');

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Users', [
            'users'   => $users,
            'filters' => $request->only('search', 'role'),
        ]);
    }
}
