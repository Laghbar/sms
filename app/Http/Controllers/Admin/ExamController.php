<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamTimetable;
use App\Models\Module;
use App\Models\Specialization;
use App\Notifications\ExamAnnounced;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    public function index(): Response
    {
        $exams = Exam::with('module:id,name,code,semester')
            ->latest('exam_date')
            ->get();

        $modules = Module::orderBy('semester')->orderBy('name')->get(['id', 'name', 'code', 'semester']);

        $timetables = ExamTimetable::with(['uploader:id,name', 'specialization:id,name'])
            ->latest()
            ->get()
            ->map(fn ($t) => [
                'id'               => $t->id,
                'title'            => $t->title,
                'file_name'        => $t->file_name,
                'file_size'        => $t->file_size,
                'uploaded_by'      => $t->uploader?->name,
                'specialization'   => $t->specialization?->name,
                'created_at'       => $t->created_at->toDateString(),
                'download_url'     => route('admin.exams.timetables.download', $t->id),
            ]);

        $specializations = Specialization::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Exams', [
            'exams'           => $exams,
            'modules'         => $modules,
            'timetables'      => $timetables,
            'specializations' => $specializations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'module_id'   => ['required', 'exists:modules,id'],
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'exam_date'   => ['required', 'date'],
            'start_time'  => ['nullable', 'date_format:H:i'],
            'end_time'    => ['nullable', 'date_format:H:i', 'after:start_time'],
            'location'    => ['nullable', 'string', 'max:255'],
        ]);

        $exam = Exam::create([...$validated, 'created_by' => $request->user()->id]);

        $exam->load('module.students');
        $students = $exam->module->students;

        if ($students->isNotEmpty()) {
            Notification::send($students, new ExamAnnounced($exam));
        }

        return back()->with('success', 'Exam announced and students notified.');
    }

    public function update(Request $request, Exam $exam)
    {
        $validated = $request->validate([
            'module_id'   => ['required', 'exists:modules,id'],
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'exam_date'   => ['required', 'date'],
            'start_time'  => ['nullable', 'date_format:H:i'],
            'end_time'    => ['nullable', 'date_format:H:i', 'after:start_time'],
            'location'    => ['nullable', 'string', 'max:255'],
        ]);

        $exam->update($validated);

        return back()->with('success', 'Exam updated.');
    }

    public function destroy(Exam $exam)
    {
        $exam->delete();

        return back()->with('success', 'Exam deleted.');
    }

    // ── Timetable file upload ─────────────────────────────────────────────────

    public function uploadTimetable(Request $request)
    {
        $request->validate([
            'title'             => ['required', 'string', 'max:255'],
            'specialization_id' => ['nullable', 'exists:specializations,id'],
            'file'              => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:20480'],
        ]);

        $file = $request->file('file');
        $path = $file->store('exam-timetables', 'public');

        ExamTimetable::create([
            'uploaded_by'       => $request->user()->id,
            'specialization_id' => $request->specialization_id ?: null,
            'title'             => $request->title,
            'file_path'         => $path,
            'file_name'         => $file->getClientOriginalName(),
            'file_size'         => $file->getSize(),
            'mime_type'         => $file->getMimeType(),
        ]);

        return back()->with('success', 'Timetable uploaded successfully.');
    }

    public function deleteTimetable(ExamTimetable $timetable)
    {
        Storage::disk('public')->delete($timetable->file_path);
        $timetable->delete();

        return back()->with('success', 'Timetable deleted.');
    }

    public function downloadTimetable(ExamTimetable $timetable)
    {
        return Storage::disk('public')->download($timetable->file_path, $timetable->file_name);
    }
}
