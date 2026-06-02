<x-mail::message>
# {{ $event->title }}

Dear **{{ $recipient->name }}**,

A new event has been announced at **{{ config('app.name') }}**:

---

**📍 Location:** {{ $event->location }}

**📅 Date:** {{ $event->starts_at->format('l, F j, Y \a\t g:i A') }}
@if($event->ends_at)

**⏰ Ends:** {{ $event->ends_at->format('l, F j, Y \a\t g:i A') }}
@endif
@if($event->max_participants)

**👥 Capacity:** {{ $event->max_participants }} participants
@endif

---

{{ $event->description }}

<x-mail::button :url="route('student.events.index')">
View Event & Register
</x-mail::button>

Best regards,<br>
**{{ config('app.name') }}**
</x-mail::message>
