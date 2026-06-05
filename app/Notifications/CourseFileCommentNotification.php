<?php

namespace App\Notifications;

use App\Models\CourseFile;
use App\Models\User;
use Illuminate\Notifications\Notification;

class CourseFileCommentNotification extends Notification
{
    public function __construct(
        private readonly CourseFile $courseFile,
        private readonly User       $commenter,
        private readonly string     $body,
        private readonly string     $notifType, // 'new_comment' | 'comment_reply'
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        // Build the correct discussion URL based on the recipient's role
        $discussionUrl = $notifiable->isTeacher()
            ? route('teacher.course-files.discussion', $this->courseFile->id)
            : route('student.course-files.discussion', $this->courseFile->id);

        return [
            'type'              => $this->notifType,
            'course_file_id'    => $this->courseFile->id,
            'course_file_title' => $this->courseFile->title,
            'module_name'       => $this->courseFile->module?->name ?? '',
            'commenter_name'    => $this->commenter->name,
            'body_preview'      => mb_substr($this->body, 0, 120),
            'discussion_url'    => $discussionUrl,
        ];
    }
}
