<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        $announcements = Announcement::with('author:id,name')
            ->latest()
            ->get();

        return Inertia::render('Admin/Announcements', [
            'announcements' => $announcements,
        ]);
    }

    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'prompt' => ['required', 'string', 'min:10', 'max:1000'],
        ]);

        $apiKey = config('services.anthropic.key');

        if (! $apiKey) {
            return response()->json(['error' => 'Anthropic API key not configured.'], 503);
        }

        $systemPrompt = <<<'PROMPT'
You are an assistant that writes formal announcements for a university student management system.
Given a brief description of an event or information, produce a professional announcement.
Rules:
- Title: concise, clear, in title case (max 100 characters)
- Content: 2–3 short paragraphs, professional tone, suitable for students and faculty
- Do NOT use markdown formatting in the content (no **, no #, no bullets)
- Respond ONLY with valid JSON: {"title": "...", "content": "..."}
PROMPT;

        $response = Http::withHeaders([
            'x-api-key'         => $apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type'      => 'application/json',
        ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
            'model'      => 'claude-haiku-4-5-20251001',
            'max_tokens' => 1024,
            'system'     => $systemPrompt,
            'messages'   => [
                ['role' => 'user', 'content' => $request->prompt],
            ],
        ]);

        if ($response->failed()) {
            return response()->json(['error' => 'AI service unavailable. Please try again.'], 502);
        }

        $text = $response->json('content.0.text', '');

        $json = json_decode($text, true);

        if (! $json || ! isset($json['title'], $json['content'])) {
            return response()->json(['error' => 'Could not parse AI response. Please retry.'], 422);
        }

        return response()->json([
            'title'   => trim($json['title']),
            'content' => trim($json['content']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'   => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'prompt'  => ['nullable', 'string', 'max:1000'],
        ]);

        Announcement::create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Announcement published.');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return back()->with('success', 'Announcement deleted.');
    }
}
