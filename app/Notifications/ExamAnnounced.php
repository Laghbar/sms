<?php

namespace App\Notifications;

use App\Models\Exam;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ExamAnnounced extends Notification
{
    use Queueable;

    public function __construct(public Exam $exam) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $exam = $this->exam;

        return [
            'type'        => 'exam',
            'exam_id'     => $exam->id,
            'title'       => $exam->title,
            'module_name' => $exam->module->name,
            'module_code' => $exam->module->code,
            'exam_date'   => $exam->exam_date->toDateString(),
            'start_time'  => $exam->start_time ? substr($exam->start_time, 0, 5) : null,
            'end_time'    => $exam->end_time   ? substr($exam->end_time,   0, 5) : null,
            'location'    => $exam->location,
            'description' => $exam->description,
        ];
    }
}
