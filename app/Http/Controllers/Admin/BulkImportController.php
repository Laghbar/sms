<?php

namespace App\Http\Controllers\Admin;

use App\Exports\UsersTemplateExport;
use App\Http\Controllers\Controller;
use App\Imports\UsersImport;
use App\Models\Specialization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BulkImportController extends Controller
{
    public function index(): Response
    {
        $specializations = Specialization::with('semesters:id,specialization_id,name')
            ->get(['id', 'name', 'code'])
            ->map(fn ($s) => [
                'id'        => $s->id,
                'name'      => $s->name,
                'code'      => $s->code,
                'semesters' => $s->semesters->pluck('name'),
            ]);

        return Inertia::render('Admin/BulkImport', [
            'specializations' => $specializations,
        ]);
    }

    public function downloadTemplate(string $role): BinaryFileResponse
    {
        abort_if(! in_array($role, ['student', 'teacher']), 404);

        $filename = "import_template_{$role}s.xlsx";

        return Excel::download(new UsersTemplateExport($role), $filename);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
            'role' => ['required', 'in:teacher,student'],
        ]);

        $import = new UsersImport($request->role);

        Excel::import($import, $request->file('file'));

        $count = $import->getRowCount();

        return back()->with('success', "Successfully imported {$count} {$request->role}(s).");
    }
}
