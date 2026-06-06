<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AcademicYearController extends Controller
{
    public function index(): Response
    {
        $years = AcademicYear::orderByDesc('start_date')
            ->get()
            ->map(fn (AcademicYear $y) => [
                'id'           => $y->id,
                'name'         => $y->name,
                'start_date'   => $y->start_date->toDateString(),
                'end_date'     => $y->end_date->toDateString(),
                'is_current'   => $y->is_current,
                'students'     => DB::table('student_module')
                    ->where('academic_year_id', $y->id)
                    ->distinct('student_id')->count('student_id'),
                'grades'       => Grade::where('academic_year_id', $y->id)->count(),
                'attendances'  => Attendance::where('academic_year_id', $y->id)->count(),
            ]);

        return Inertia::render('Admin/AcademicYears', ['years' => $years]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'       => ['required', 'string', 'max:20', 'unique:academic_years,name'],
            'start_date' => ['required', 'date'],
            'end_date'   => ['required', 'date', 'after:start_date'],
        ]);

        AcademicYear::create([
            'name'       => $request->name,
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
            'is_current' => false,
        ]);

        return back()->with('success', "Academic year \"{$request->name}\" created.");
    }

    public function setCurrent(AcademicYear $academicYear)
    {
        // Unset all others first
        AcademicYear::where('id', '!=', $academicYear->id)
            ->update(['is_current' => false]);

        $academicYear->update(['is_current' => true]);

        return back()->with('success', "\"{$academicYear->name}\" is now the active academic year.");
    }

    public function destroy(AcademicYear $academicYear)
    {
        if ($academicYear->is_current) {
            return back()->withErrors(['general' => 'Cannot delete the current academic year.']);
        }

        $hasData = DB::table('student_module')->where('academic_year_id', $academicYear->id)->exists()
            || Grade::where('academic_year_id', $academicYear->id)->exists();

        if ($hasData) {
            return back()->withErrors(['general' => 'Cannot delete a year that has data. Archive it instead.']);
        }

        $academicYear->delete();

        return back()->with('success', "Academic year deleted.");
    }
}
