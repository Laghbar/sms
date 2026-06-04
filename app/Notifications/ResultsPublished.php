<?php

namespace App\Notifications;

use App\Models\Module;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ResultsPublished extends Notification
{
    use Queueable;

    public function __construct(public Module $module) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'results',
            'module_id'   => $this->module->id,
            'module_name' => $this->module->name,
            'module_code' => $this->module->code,
            'message'     => "Results for {$this->module->name} have been published.",
        ];
    }
}
