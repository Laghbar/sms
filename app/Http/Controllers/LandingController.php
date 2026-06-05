<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\Event;
use App\Models\Module;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __invoke(): mixed
    {
        if (auth()->check()) {
            $user = auth()->user();
            if ($user->isAdmin())   return redirect()->route('admin.dashboard');
            if ($user->isTeacher()) return redirect()->route('teacher.dashboard');
            return redirect()->route('student.dashboard');
        }

        $stats = [
            'students' => User::where('role', Role::Student)->count(),
            'teachers' => User::where('role', Role::Teacher)->count(),
            'modules'  => Module::count(),
            'events'   => Event::count(),
        ];

        $events = Event::where('starts_at', '>=', now())
            ->orderBy('starts_at')
            ->limit(3)
            ->get()
            ->map(fn ($e) => [
                'id'          => $e->id,
                'title'       => $e->title,
                'description' => $e->description,
                'location'    => $e->location,
                'starts_at'   => $e->starts_at->toDateTimeString(),
                'status'      => $e->status,
            ]);

        return Inertia::render('Welcome', [
            'stats'  => $stats,
            'events' => $events,
        ]);
    }
}
