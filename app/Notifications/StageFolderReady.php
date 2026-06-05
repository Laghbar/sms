<?php

namespace App\Notifications;

use App\Models\StageFolderRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StageFolderReady extends Notification
{
    use Queueable;

    public function __construct(public StageFolderRequest $request) {}

    public function via(object $notifiable): array { return ['database']; }

    public function toArray(object $notifiable): array
    {
        return [
            'type'       => 'stage_folder_ready',
            'request_id' => $this->request->id,
            'message'    => 'Votre dossier de stage est prêt. Vous pouvez le télécharger.',
        ];
    }
}
