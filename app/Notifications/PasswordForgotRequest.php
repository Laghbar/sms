<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Notification;

class PasswordForgotRequest extends Notification
{
    public function __construct(
        private readonly User   $requestingUser,
        private readonly string $tempPassword,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'          => 'password_forgot',
            'user_name'     => $this->requestingUser->name,
            'user_email'    => $this->requestingUser->email,
            'temp_password' => $this->tempPassword,
        ];
    }
}
