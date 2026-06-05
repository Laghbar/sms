<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\CourseFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CourseFileController extends Controller
{
    public function index(Request $request): Response
    {
        $teacher   = $request->user();
        $moduleIds = $teacher->taughtModules()->pluck('modules.id');

        $files = CourseFile::whereIn('module_id', $moduleIds)
            ->with('module:id,name,code')
            ->withCount(['submissions', 'comments'])
            ->when($request->module_id, fn ($q) => $q->where('module_id', $request->module_id))
            ->when($request->type,      fn ($q) => $q->where('type', $request->type))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($f) => [
                'id'                => $f->id,
                'title'             => $f->title,
                'description'       => $f->description,
                'type'              => $f->type,
                'due_date'          => $f->due_date?->toDateString(),
                'file_name'         => $f->file_name,
                'file_size'         => $f->file_size,
                'module'            => $f->module,
                'created_at'        => $f->created_at->toDateString(),
                'download_url'      => route('teacher.course-files.download', $f->id),
                'submissions_count' => $f->submissions_count,
                'submissions_url'   => route('teacher.course-files.submissions', $f->id),
                'comments_count'    => $f->comments_count,
                'discussion_url'    => route('teacher.course-files.discussion', $f->id),
            ]);

        $modules = $teacher->taughtModules()->orderBy('semester')->get(['modules.id', 'modules.name', 'modules.code']);

        return Inertia::render('Teacher/CourseFiles', [
            'files'   => $files,
            'modules' => $modules,
            'filters' => $request->only(['module_id', 'type']),
        ]);
    }

    public function store(Request $request)
    {
        $moduleIds = $request->user()->taughtModules()->pluck('modules.id');
        $isTp      = $request->input('type') === 'tp';

        $validated = $request->validate([
            'module_id'   => ['required', 'integer', 'in:' . $moduleIds->implode(',')],
            'type'        => ['required', 'in:cours,td,tp'],
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'due_date'    => [$isTp ? 'required' : 'nullable', 'date', 'after_or_equal:today'],
            'file'        => ['required', 'file', 'mimes:pdf,doc,docx,ppt,pptx', 'max:51200'],
        ]);

        $file = $request->file('file');
        $path = $file->store('course-files', 'public');

        CourseFile::create([
            'module_id'   => $validated['module_id'],
            'uploaded_by' => $request->user()->id,
            'type'        => $validated['type'],
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date'    => $isTp ? $validated['due_date'] : null,
            'file_path'   => $path,
            'file_name'   => $file->getClientOriginalName(),
            'file_size'   => $file->getSize(),
            'mime_type'   => $file->getMimeType(),
        ]);

        return back()->with('success', 'File uploaded.');
    }

    public function destroy(Request $request, CourseFile $courseFile)
    {
        $moduleIds = $request->user()->taughtModules()->pluck('modules.id');

        if (! $moduleIds->contains($courseFile->module_id)) {
            abort(403);
        }

        foreach ($courseFile->submissions as $sub) {
            Storage::disk('public')->delete($sub->file_path);
        }

        Storage::disk('public')->delete($courseFile->file_path);
        $courseFile->delete();

        return back()->with('success', 'File deleted.');
    }

    public function download(Request $request, CourseFile $courseFile)
    {
        $moduleIds = $request->user()->taughtModules()->pluck('modules.id');

        if (! $moduleIds->contains($courseFile->module_id)) {
            abort(403);
        }

        return Storage::disk('public')->download($courseFile->file_path, $courseFile->file_name);
    }

    public function submissions(Request $request, CourseFile $courseFile): Response
    {
        $moduleIds = $request->user()->taughtModules()->pluck('modules.id');

        if (! $moduleIds->contains($courseFile->module_id)) {
            abort(403);
        }

        $submissions = $courseFile->submissions()
            ->with('student:id,name,email')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($s) => [
                'id'           => $s->id,
                'student'      => $s->student,
                'file_name'    => $s->file_name,
                'file_size'    => $s->file_size,
                'submitted_at' => $s->created_at->toDateTimeString(),
                'download_url' => route('teacher.course-files.submission-download', $s->id),
            ]);

        return Inertia::render('Teacher/CourseFileSubmissions', [
            'courseFile'  => [
                'id'       => $courseFile->id,
                'title'    => $courseFile->title,
                'due_date' => $courseFile->due_date?->toDateString(),
                'module'   => $courseFile->module()->select('id', 'name', 'code')->first(),
            ],
            'submissions' => $submissions,
        ]);
    }

    public function submissionDownload(Request $request, \App\Models\TpSubmission $submission)
    {
        $moduleIds = $request->user()->taughtModules()->pluck('modules.id');

        if (! $moduleIds->contains($submission->courseFile->module_id)) {
            abort(403);
        }

        return Storage::disk('public')->download($submission->file_path, $submission->file_name);
    }

    public function discussion(Request $request, CourseFile $courseFile): Response
    {
        $moduleIds = $request->user()->taughtModules()->pluck('modules.id');

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

        return Inertia::render('Teacher/CourseFileDiscussion', [
            'courseFile' => [
                'id'          => $courseFile->id,
                'title'       => $courseFile->title,
                'type'        => $courseFile->type,
                'module'      => $courseFile->module()->select('id', 'name', 'code')->first(),
                'store_url'   => route('teacher.course-file-comments.store', $courseFile->id),
                'files_url'   => route('teacher.course-files.index'),
            ],
            'comments'   => $comments,
        ]);
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
            'delete_url' => route('teacher.course-file-comments.destroy', $c->id),
            'replies'    => $c->replies->map(fn ($r) => [
                'id'         => $r->id,
                'body'       => $r->body,
                'created_at' => $r->created_at->diffForHumans(),
                'user'       => [
                    'id'   => $r->user->id,
                    'name' => $r->user->name,
                    'role' => $r->user->role->value,
                ],
                'delete_url' => route('teacher.course-file-comments.destroy', $r->id),
            ])->values(),
        ];
    }
}
