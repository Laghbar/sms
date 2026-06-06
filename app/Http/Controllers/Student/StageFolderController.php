<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StageFolderRequest;
use App\Notifications\StageFolderRequested;
use App\Models\User;
use App\Enums\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StageFolderController extends Controller
{
    public function index(Request $request): Response
    {
        $student  = $request->user()->load(['specialization', 'semesterObj']);
        $existing = StageFolderRequest::where('student_id', $student->id)->latest()->first();

        return Inertia::render('Student/StageFolder', [
            'student_info' => [
                'name'           => $student->name,
                'email'          => $student->email,
                'specialization' => $student->specialization?->name,
                'semester'       => $student->semesterObj?->name,
            ],
            'folderRequest' => $existing ? [
                'id'               => $existing->id,
                'status'           => $existing->status,
                'phone'            => $existing->phone,
                'company_name'     => $existing->company_name,
                'company_address'  => $existing->company_address,
                'internship_start' => $existing->internship_start?->toDateString(),
                'duration_weeks'   => $existing->duration_weeks,
                'notes'            => $existing->notes,
                'admin_note'       => $existing->admin_note,
                'file_name'        => $existing->file_name,
                'has_file'         => (bool) $existing->file_path,
                'created_at'       => $existing->created_at->toDateString(),
            ] : null,
        ]);
    }

    public function store(Request $request)
    {
        $active = StageFolderRequest::where('student_id', $request->user()->id)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        if ($active) {
            return back()->withErrors(['phone' => 'You already have an active request.']);
        }

        $validated = $request->validate([
            'phone'            => ['required', 'string', 'max:20'],
            'internship_start' => ['nullable', 'date'],
            'duration_weeks'   => ['nullable', 'integer', 'min:1', 'max:52'],
            'notes'            => ['nullable', 'string', 'max:1000'],
        ]);

        $folderRequest = StageFolderRequest::create([
            'student_id' => $request->user()->id,
            ...$validated,
        ]);

        $folderRequest->load('student');

        $admins = User::where('role', Role::Admin)->get();
        Notification::send($admins, new StageFolderRequested($folderRequest));

        return back()->with('success', 'Votre demande a été envoyée. L\'admin vous contactera prochainement.');
    }

    public function updateCompany(Request $request, StageFolderRequest $stageFolderRequest)
    {
        abort_unless($stageFolderRequest->student_id === $request->user()->id, 403);

        $validated = $request->validate([
            'company_name'    => ['nullable', 'string', 'max:255'],
            'company_address' => ['nullable', 'string', 'max:255'],
        ]);

        $stageFolderRequest->update($validated);

        return back()->with('success', 'Informations de l\'entreprise mises à jour.');
    }

    public function cancel(Request $request, StageFolderRequest $stageFolderRequest)
    {
        abort_unless($stageFolderRequest->student_id === $request->user()->id, 403);
        abort_unless($stageFolderRequest->isPending(), 403);

        $stageFolderRequest->delete();

        return back()->with('success', 'Demande annulée.');
    }

    public function download(Request $request, StageFolderRequest $stageFolderRequest)
    {
        abort_unless($stageFolderRequest->student_id === $request->user()->id, 403);
        abort_unless($stageFolderRequest->file_path, 404);

        return Storage::disk('public')->download($stageFolderRequest->file_path, $stageFolderRequest->file_name);
    }
}
