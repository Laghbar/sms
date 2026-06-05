<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseFile;
use App\Models\TpSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CourseFileController extends Controller
{
    public function index(Request $request): Response
    {
        $student   = $request->user();
        $moduleIds = $student->enrolledModules()->pluck('modules.id');

        $mySubmissions = TpSubmission::where('student_id', $student->id)
            ->whereHas('courseFile', fn ($q) => $q->whereIn('module_id', $moduleIds))
            ->get()
            ->keyBy('course_file_id');

        $today = now()->startOfDay();

        $files = CourseFile::whereIn('module_id', $moduleIds)
            ->with('module:id,name,code')
            ->withCount('comments')
            ->when($request->module_id, fn ($q) => $q->where('module_id', $request->module_id))
            ->when($request->type,      fn ($q) => $q->where('type', $request->type))
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($f) use ($mySubmissions, $today) {
                $sub    = $mySubmissions->get($f->id);
                $isOpen = $f->due_date === null || $today->lte($f->due_date);

                return [
                    'id'                    => $f->id,
                    'title'                 => $f->title,
                    'description'           => $f->description,
                    'type'                  => $f->type,
                    'due_date'              => $f->due_date?->toDateString(),
                    'is_open'               => $isOpen,
                    'file_name'             => $f->file_name,
                    'file_size'             => $f->file_size,
                    'module'                => $f->module,
                    'created_at'            => $f->created_at->toDateString(),
                    'download_url'          => route('student.course-files.download', $f->id),
                    'discussion_url'        => route('student.course-files.discussion', $f->id),
                    'comments_count'        => $f->comments_count,
                    'submission'            => $sub ? [
                        'id'           => $sub->id,
                        'file_name'    => $sub->file_name,
                        'file_size'    => $sub->file_size,
                        'submitted_at' => $sub->created_at->toDateTimeString(),
                    ] : null,
                    'submit_url'            => route('student.tp-submissions.store', $f->id),
                    'delete_submission_url' => $sub
                        ? route('student.tp-submissions.destroy', $sub->id)
                        : null,
                ];
            });

        $modules = $student->enrolledModules()->get(['modules.id', 'modules.name', 'modules.code']);

        return Inertia::render('Student/CourseFiles', [
            'files'   => $files,
            'modules' => $modules,
            'filters' => $request->only(['module_id', 'type']),
        ]);
    }

    public function discussion(Request $request, CourseFile $courseFile): Response
    {
        $moduleIds = $request->user()->enrolledModules()->pluck('modules.id');

        if (! $moduleIds->contains($courseFile->module_id)) {
            abort(403);
        }

        $comments = $courseFile->comments()
            ->whereNull('parent_id')
            ->with([
                'user:id,name,role',
                'replies' => fn ($q) => $q->with('user:id,name,role'),
            ])
            ->orderBy('created_at')
            ->get()
            ->map(fn ($c) => $this->formatComment($c));

        return Inertia::render('Student/CourseFileDiscussion', [
            'courseFile' => [
                'id'             => $courseFile->id,
                'title'          => $courseFile->title,
                'type'           => $courseFile->type,
                'module'         => $courseFile->module()->select('id', 'name', 'code')->first(),
                'store_url'      => route('student.course-file-comments.store', $courseFile->id),
                'files_url'      => route('student.course-files.index'),
            ],
            'comments'   => $comments,
        ]);
    }

    public function download(Request $request, CourseFile $courseFile)
    {
        $moduleIds = $request->user()->enrolledModules()->pluck('modules.id');

        if (! $moduleIds->contains($courseFile->module_id)) {
            abort(403);
        }

        return Storage::disk('public')->download($courseFile->file_path, $courseFile->file_name);
    }

    private function formatComment($c): array
    {
        return [
            'id'         => $c->id,
            'body'       => $c->body,
            'created_at' => $c->created_at->diffForHumans(),
            'user'       => [
                'id'   => $c->user->id,
                'name' => $c->user->name,
                'role' => $c->user->role->value,
            ],
            'delete_url' => route('student.course-file-comments.destroy', $c->id),
            'replies'    => $c->replies->map(fn ($r) => [
                'id'         => $r->id,
                'body'       => $r->body,
                'created_at' => $r->created_at->diffForHumans(),
                'user'       => [
                    'id'   => $r->user->id,
                    'name' => $r->user->name,
                    'role' => $r->user->role->value,
                ],
                'delete_url' => route('student.course-file-comments.destroy', $r->id),
            ])->values(),
        ];
    }
}
