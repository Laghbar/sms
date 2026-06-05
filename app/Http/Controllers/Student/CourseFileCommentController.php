<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseFile;
use App\Models\CourseFileComment;
use App\Models\User;
use App\Notifications\CourseFileCommentNotification;
use Illuminate\Http\Request;

class CourseFileCommentController extends Controller
{
    public function store(Request $request, CourseFile $courseFile)
    {
        $student   = $request->user();
        $moduleIds = $student->enrolledModules()->pluck('modules.id');

        if (! $moduleIds->contains($courseFile->module_id)) {
            abort(403);
        }

        $validated = $request->validate([
            'body'      => ['required', 'string', 'max:1000'],
            'parent_id' => ['nullable', 'exists:course_file_comments,id'],
        ]);

        $comment = CourseFileComment::create([
            'course_file_id' => $courseFile->id,
            'user_id'        => $student->id,
            'parent_id'      => $validated['parent_id'] ?? null,
            'body'           => $validated['body'],
        ]);

        // Load module so the notification can reference it
        $courseFile->loadMissing('module');

        if (is_null($comment->parent_id)) {
            // New top-level comment → notify the teacher of this module
            $teacherId = $courseFile->module?->teacher_id;
            if ($teacherId && $teacherId !== $student->id) {
                $teacher = User::find($teacherId);
                $teacher?->notify(new CourseFileCommentNotification(
                    $courseFile, $student, $comment->body, 'new_comment'
                ));
            }
        } else {
            // Reply → notify the parent comment's author (if different person)
            $parent = CourseFileComment::with('user')->find($comment->parent_id);
            if ($parent && $parent->user_id !== $student->id) {
                $parent->user->notify(new CourseFileCommentNotification(
                    $courseFile, $student, $comment->body, 'comment_reply'
                ));
            }
        }

        return back()->with('success', 'Comment posted.');
    }

    public function destroy(Request $request, CourseFileComment $comment)
    {
        if ($comment->user_id !== $request->user()->id) {
            abort(403);
        }

        $comment->delete();

        return back();
    }
}
