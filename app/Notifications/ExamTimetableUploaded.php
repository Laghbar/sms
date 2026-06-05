<?php

namespace App\Notifications;

use App\Models\ExamTimetable;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ExamTimetableUploaded extends Notification
{
    use Queueable;

    public function __construct(public ExamTimetable $timetable) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'             => 'exam_timetable',
            'timetable_id'     => $this->timetable->id,
            'title'            => $this->timetable->title,
            'specialization'   => $this->timetable->specialization?->name,
            'message'          => "Le calendrier des examens \"{$this->timetable->title}\" est disponible.",
        ];
    }
}
