<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Imports\UsersImport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class BulkImportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/BulkImport');
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
