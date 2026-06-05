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

        // Pre-load student's submissions for quick lookup
        $mySubmissions = TpSubmission::where('student_id', $student->id)
            ->whereHas('courseFile', fn ($q) => $q->whereIn('module_id', $moduleIds))
            ->get()
            ->keyBy('course_file_id');

        $today = now()->startOfDay();

        $files = CourseFile::whereIn('module_id', $moduleIds)
            ->with('module:id,name,code')
            ->when($request->module_id, fn ($q) => $q->where('module_id', $request->module_id))
            ->when($request->type,      fn ($q) => $q->where('type', $request->type))
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($f) use ($mySubmissions, $today) {
                $sub      = $mySubmissions->get($f->id);
                $isOpen   = $f->due_date === null || $today->lte($f->due_date);

                return [
                    'id'           => $f->id,
                    'title'        => $f->title,
                    'description'  => $f->description,
                    'type'         => $f->type,
                    'due_date'     => $f->due_date?->toDateString(),
                    'is_open'      => $isOpen,
                    'file_name'    => $f->file_name,
                    'file_size'    => $f->file_size,
                    'module'       => $f->module,
                    'created_at'   => $f->created_at->toDateString(),
                    'download_url' => route('student.course-files.download', $f->id),
                    'submission'   => $sub ? [
                        'id'           => $sub->id,
                        'file_name'    => $sub->file_name,
                        'file_size'    => $sub->file_size,
                        'submitted_at' => $sub->created_at->toDateTimeString(),
                    ] : null,
                    'submit_url'   => route('student.tp-submissions.store', $f->id),
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

    public function download(Request $request, CourseFile $courseFile)
    {
        $moduleIds = $request->user()->enrolledModules()->pluck('modules.id');

        if (! $moduleIds->contains($courseFile->module_id)) {
            abort(403);
        }

        return Storage::disk('public')->download($courseFile->file_path, $courseFile->file_name);
    }
}
