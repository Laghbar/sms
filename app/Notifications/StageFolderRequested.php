<?php

namespace App\Notifications;

use App\Models\StageFolderRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StageFolderRequested extends Notification
{
    use Queueable;

    public function __construct(public StageFolderRequest $request) {}

    public function via(object $notifiable): array { return ['database']; }

    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'stage_folder_requested',
            'request_id'   => $this->request->id,
            'student_name' => $this->request->student->name,
            'message'      => "{$this->request->student->name} a demandé un dossier de stage.",
        ];
    }
}
