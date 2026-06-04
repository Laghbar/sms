<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\Module;
use App\Notifications\ExamAnnounced;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
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

        return Inertia::render('Admin/Exams', [
            'exams'   => $exams,
            'modules' => $modules,
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
}
