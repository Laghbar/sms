<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use App\Models\Specialization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(): Response
    {
        // Determine active semester parity based on month:
        // Sept–Jan (months 9-12, 1) → semester 1 → show odd semesters (S1, S3, …)
        // Feb–Aug (months 2-8)      → semester 2 → show even semesters (S2, S4, …)
        $month            = now()->month;
        $isFirstSemester  = $month >= 9 || $month === 1;

        $specializations = Specialization::with(['semesters' => fn ($q) => $q->orderBy('name')])
            ->orderBy('name')
            ->get()
            ->map(fn ($spec) => [
                'id'        => $spec->id,
                'name'      => $spec->name,
                'code'      => $spec->code,
                'semesters' => $spec->semesters
                    ->filter(function ($sem) use ($isFirstSemester) {
                        preg_match('/\d+/', $sem->name, $m);
                        $num = (int) ($m[0] ?? 1);
                        return $isFirstSemester ? ($num % 2 !== 0) : ($num % 2 === 0);
                    })
                    ->values()
                    ->map(fn ($sem) => [
                        'id'             => $sem->id,
                        'name'           => $sem->name,
                        'has_timetable'  => (bool) $sem->timetable_path,
                        'timetable_name' => $sem->timetable_name,
                        'timetable_url'  => $sem->timetable_path
                            ? Storage::url($sem->timetable_path)
                            : null,
                    ]),
            ]);

        return Inertia::render('Admin/Schedules', ['specializations' => $specializations]);
    }

    public function uploadTimetable(Request $request, Semester $semester)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:20480'],
        ]);

        // Delete old file if exists
        if ($semester->timetable_path) {
            Storage::disk('public')->delete($semester->timetable_path);
        }

        $file = $request->file('file');
        $path = $file->store("timetables", 'public');

        $semester->update([
            'timetable_path' => $path,
            'timetable_name' => $file->getClientOriginalName(),
        ]);

        return back()->with('success', "Timetable uploaded for {$semester->name}.");
    }

    public function deleteTimetable(Semester $semester)
    {
        if ($semester->timetable_path) {
            Storage::disk('public')->delete($semester->timetable_path);
            $semester->update(['timetable_path' => null, 'timetable_name' => null]);
        }

        return back()->with('success', "Timetable removed from {$semester->name}.");
    }
}
