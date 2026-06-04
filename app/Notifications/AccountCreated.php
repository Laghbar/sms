<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountCreated extends Notification
{

    public function __construct(
        private readonly string $plainPassword,
        private readonly string $role,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $loginUrl  = url('/');
        $roleLabel = ucfirst($this->role);

        return (new MailMessage)
            ->subject('Your SMS Account Has Been Created')
            ->greeting("Hello {$notifiable->name},")
            ->line("An account has been created for you on the **Student Management System** as a **{$roleLabel}**.")
            ->line('Here are your login credentials:')
            ->line("**Email:** {$notifiable->email}")
            ->line("**Password:** `{$this->plainPassword}`")
            ->action('Log In Now', $loginUrl)
            ->line('For security reasons, please change your password after your first login.')
            ->salutation('The SMS Team');
    }
}
