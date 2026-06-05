<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\CourseFile;
use App\Models\CourseFileComment;
use App\Notifications\CourseFileCommentNotification;
use Illuminate\Http\Request;

class CourseFileCommentController extends Controller
{
    public function store(Request $request, CourseFile $courseFile)
    {
        $teacher   = $request->user();
        $moduleIds = $teacher->taughtModules()->pluck('modules.id');

        if (! $moduleIds->contains($courseFile->module_id)) {
            abort(403);
        }

        $validated = $request->validate([
            'body'      => ['required', 'string', 'max:1000'],
            'parent_id' => ['nullable', 'exists:course_file_comments,id'],
        ]);

        $comment = CourseFileComment::create([
            'course_file_id' => $courseFile->id,
            'user_id'        => $teacher->id,
            'parent_id'      => $validated['parent_id'] ?? null,
            'body'           => $validated['body'],
        ]);

        // Load module for the notification
        $courseFile->loadMissing('module');

        if (! is_null($comment->parent_id)) {
            // Teacher replied → notify the student who wrote the parent comment
            $parent = CourseFileComment::with('user')->find($comment->parent_id);
            if ($parent && $parent->user_id !== $teacher->id) {
                $parent->user->notify(new CourseFileCommentNotification(
                    $courseFile, $teacher, $comment->body, 'comment_reply'
                ));
            }
        }

        return back();
    }

    public function destroy(Request $request, CourseFileComment $comment)
    {
        $moduleIds = $request->user()->taughtModules()->pluck('modules.id');

        if (! $moduleIds->contains($comment->courseFile->module_id)) {
            abort(403);
        }

        $comment->delete();

        return back();
    }
}
