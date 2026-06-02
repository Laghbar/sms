<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $teacher = $request->user();
        $teacher->update(['events_last_seen_at' => now()]);

        $myEvents = Event::where('created_by', $teacher->id)
            ->withCount('registeredUsers')
            ->latest('starts_at')
            ->get();

        $allEvents = Event::where('created_by', '!=', $teacher->id)
            ->where('starts_at', '>=', now())
            ->withCount('registeredUsers')
            ->orderBy('starts_at')
            ->get()
            ->map(fn ($e) => [
                ...$e->toArray(),
                'is_registered' => $e->registeredUsers()->where('user_id', $teacher->id)->exists(),
            ]);

        return Inertia::render('Teacher/Events', [
            'myEvents'  => $myEvents,
            'allEvents' => $allEvents,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('events', 'public');
        }

        Event::create([...$validated, 'created_by' => $request->user()->id]);

        return back()->with('success', 'Event created.');
    }

    public function update(Request $request, Event $event)
    {
        abort_if($event->created_by !== $request->user()->id, 403);

        $validated = $this->validated($request, $event);

        if ($request->hasFile('image')) {
            if ($event->image) Storage::disk('public')->delete($event->image);
            $validated['image'] = $request->file('image')->store('events', 'public');
        }

        $event->update($validated);

        return back()->with('success', 'Event updated.');
    }

    public function destroy(Request $request, Event $event)
    {
        abort_if($event->created_by !== $request->user()->id, 403);

        if ($event->image) Storage::disk('public')->delete($event->image);
        $event->delete();

        return back()->with('success', 'Event deleted.');
    }

    public function register(Request $request, Event $event)
    {
        $event->registeredUsers()->syncWithoutDetaching([$request->user()->id]);

        return back()->with('success', 'Registered for event.');
    }

    public function unregister(Request $request, Event $event)
    {
        $event->registeredUsers()->detach($request->user()->id);

        return back()->with('success', 'Unregistered from event.');
    }

    private function validated(Request $request, ?Event $event = null): array
    {
        return $request->validate([
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['required', 'string'],
            'location'         => ['required', 'string', 'max:255'],
            'starts_at'        => ['required', 'date'],
            'ends_at'          => ['nullable', 'date', 'after:starts_at'],
            'image'            => ['nullable', 'image', 'max:2048'],
            'max_participants' => ['nullable', 'integer', 'min:1'],
        ]);
    }
}
