<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $student = $request->user();
        $student->update(['events_last_seen_at' => now()]);

        $events = Event::withCount('registeredUsers')
            ->orderBy('starts_at')
            ->get()
            ->map(fn ($e) => [
                ...$e->toArray(),
                'is_registered' => $e->registeredUsers()->where('user_id', $student->id)->exists(),
                'is_full'       => $e->isFull(),
            ]);

        return Inertia::render('Student/Events', ['events' => $events]);
    }

    public function register(Request $request, Event $event)
    {
        if ($event->isFull()) {
            return back()->with('error', 'This event is full.');
        }

        $event->registeredUsers()->syncWithoutDetaching([$request->user()->id]);

        return back()->with('success', 'You are registered!');
    }

    public function unregister(Request $request, Event $event)
    {
        $event->registeredUsers()->detach($request->user()->id);

        return back()->with('success', 'Registration cancelled.');
    }
}
