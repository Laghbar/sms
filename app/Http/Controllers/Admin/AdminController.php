<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
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
}
