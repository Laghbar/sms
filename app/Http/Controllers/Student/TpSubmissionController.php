<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseFile;
use App\Models\TpSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TpSubmissionController extends Controller
{
    public function store(Request $request, CourseFile $courseFile)
    {
        // Must be a TP file
        if ($courseFile->type !== 'tp') {
            abort(403);
        }

        // Student must be enrolled in the module
        $moduleIds = $request->user()->enrolledModules()->pluck('modules.id');
        if (! $moduleIds->contains($courseFile->module_id)) {
            abort(403);
        }

        // Deadline must not have passed
        if ($courseFile->due_date && now()->startOfDay()->gt($courseFile->due_date)) {
            return back()->withErrors(['file' => 'The submission deadline has passed.']);
        }

        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,doc,docx,zip,rar,ppt,pptx', 'max:51200'],
        ]);

        $student  = $request->user();
        $file     = $request->file('file');
        $path     = $file->store('tp-submissions', 'public');

        // Delete old submission file if re-submitting
        $existing = TpSubmission::where('course_file_id', $courseFile->id)
            ->where('student_id', $student->id)
            ->first();

        if ($existing) {
            Storage::disk('public')->delete($existing->file_path);
            $existing->update([
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);
        } else {
            TpSubmission::create([
                'course_file_id' => $courseFile->id,
                'student_id'     => $student->id,
                'file_path'      => $path,
                'file_name'      => $file->getClientOriginalName(),
                'file_size'      => $file->getSize(),
                'mime_type'      => $file->getMimeType(),
            ]);
        }

        return back()->with('success', 'TP submitted successfully.');
    }

    public function destroy(Request $request, TpSubmission $submission)
    {
        if ($submission->student_id !== $request->user()->id) {
            abort(403);
        }

        // Cannot delete after deadline
        $cf = $submission->courseFile;
        if ($cf->due_date && now()->startOfDay()->gt($cf->due_date)) {
            return back()->withErrors(['file' => 'The submission deadline has passed.']);
        }

        Storage::disk('public')->delete($submission->file_path);
        $submission->delete();

        return back()->with('success', 'Submission removed.');
    }
}
