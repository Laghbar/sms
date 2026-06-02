<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Mail\EventNotification;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $request->user()->update(['events_last_seen_at' => now()]);

        $events = Event::with('organizer:id,name')
            ->withCount('registeredUsers')
            ->latest('starts_at')
            ->get();

        return Inertia::render('Admin/Events', ['events' => $events]);
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('events', 'public');
        }

        $event = Event::create([...$validated, 'created_by' => $request->user()->id]);

        if ($request->boolean('notify_students')) {
            $this->sendNotifications($event);
        }

        return back()->with('success', 'Event created.');
    }

    public function update(Request $request, Event $event)
    {
        $validated = $this->validated($request, $event);

        if ($request->hasFile('image')) {
            if ($event->image) Storage::disk('public')->delete($event->image);
            $validated['image'] = $request->file('image')->store('events', 'public');
        }

        $event->update($validated);

        return back()->with('success', 'Event updated.');
    }

    public function destroy(Event $event)
    {
        if ($event->image) Storage::disk('public')->delete($event->image);
        $event->delete();

        return back()->with('success', 'Event deleted.');
    }

    public function notify(Event $event)
    {
        $this->sendNotifications($event);

        return back()->with('success', 'Notifications sent to all students.');
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

    private function sendNotifications(Event $event): void
    {
        User::where('role', Role::Student)->chunkById(100, function ($students) use ($event) {
            foreach ($students as $student) {
                Mail::to($student->email)->queue(new EventNotification($event, $student));
            }
        });
    }
}
