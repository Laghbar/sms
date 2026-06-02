<?php

namespace App\Mail;

use App\Models\Event;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EventNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Event $event,
        public User  $recipient,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: '📅 New Event: ' . $this->event->title);
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.event-notification');
    }

    public function attachments(): array
    {
        return [];
    }
}
