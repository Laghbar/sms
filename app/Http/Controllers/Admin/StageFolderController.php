<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StageFolderRequest;
use App\Notifications\StageFolderReady;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StageFolderController extends Controller
{
    public function index(): Response
    {
        $requests = StageFolderRequest::with(['student.specialization', 'student.semesterObj'])
            ->latest()
            ->get()
            ->map(fn (StageFolderRequest $r) => [
                'id'               => $r->id,
                'status'           => $r->status,
                'phone'            => $r->phone,
                'company_name'     => $r->company_name,
                'company_address'  => $r->company_address,
                'internship_start' => $r->internship_start?->toDateString(),
                'duration_weeks'   => $r->duration_weeks,
                'notes'            => $r->notes,
                'admin_note'       => $r->admin_note,
                'file_name'        => $r->file_name,
                'has_file'         => (bool) $r->file_path,
                'created_at'       => $r->created_at->toDateString(),
                'student'          => [
                    'id'             => $r->student->id,
                    'name'           => $r->student->name,
                    'email'          => $r->student->email,
                    'specialization' => $r->student->specialization?->name,
                    'semester'       => $r->student->semesterObj?->name,
                ],
            ]);

        $counts = [
            'pending'    => $requests->where('status', 'pending')->count(),
            'processing' => $requests->where('status', 'processing')->count(),
            'ready'      => $requests->where('status', 'ready')->count(),
        ];

        return Inertia::render('Admin/StageFolders', [
            'requests' => $requests,
            'counts'   => $counts,
        ]);
    }

    public function updateStatus(Request $request, StageFolderRequest $stageFolderRequest)
    {
        $request->validate([
            'status'     => ['required', 'in:pending,processing,ready'],
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $stageFolderRequest->update([
            'status'     => $request->status,
            'admin_note' => $request->admin_note,
        ]);

        return back()->with('success', 'Statut mis à jour.');
    }

    public function upload(Request $request, StageFolderRequest $stageFolderRequest)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,doc,docx,zip', 'max:20480'],
        ]);

        if ($stageFolderRequest->file_path) {
            Storage::disk('public')->delete($stageFolderRequest->file_path);
        }

        $file = $request->file('file');
        $path = $file->store('stage-folders', 'public');

        $stageFolderRequest->update([
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'status'    => 'ready',
        ]);

        $stageFolderRequest->student->notify(new StageFolderReady($stageFolderRequest));

        return back()->with('success', 'Dossier uploadé et étudiant notifié.');
    }

    public function download(StageFolderRequest $stageFolderRequest)
    {
        abort_unless($stageFolderRequest->file_path, 404);

        return Storage::disk('public')->download($stageFolderRequest->file_path, $stageFolderRequest->file_name);
    }

    public function destroy(StageFolderRequest $stageFolderRequest)
    {
        if ($stageFolderRequest->file_path) {
            Storage::disk('public')->delete($stageFolderRequest->file_path);
        }
        $stageFolderRequest->delete();

        return back()->with('success', 'Demande supprimée.');
    }
}
