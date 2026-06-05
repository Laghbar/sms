<?php

namespace App\Http\Controllers\Auth;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\PasswordForgotRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function create(): Response
    {
        $admin = User::where('role', Role::Admin)->first();

        return Inertia::render('Auth/ForgotPassword', [
            'status'        => session('status'),
            'admin_contact' => $admin?->email,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ], [
            'email.exists' => 'No account found with that email address.',
        ]);

        $user = User::where('email', $request->email)->firstOrFail();

        // Generate a temporary password and save it
        $tempPassword = Str::random(10);
        $user->update(['password' => Hash::make($tempPassword)]);

        // Notify every admin via database notification
        User::where('role', Role::Admin)->each(
            fn ($admin) => $admin->notify(new PasswordForgotRequest($user, $tempPassword))
        );

        return back()->with(
            'status',
            'The administrator has been notified. Please contact them to receive your temporary password.'
        );
    }
}
