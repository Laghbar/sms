<?php

namespace App\Http\Middleware;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
            'new_events_count' => $request->user()
                ? Event::when(
                    $request->user()->events_last_seen_at,
                    fn ($q) => $q->where('created_at', '>', $request->user()->events_last_seen_at)
                )->count()
                : 0,
            'notifications'              => $request->user()
                ? $request->user()->unreadNotifications()->latest()->limit(8)->get()
                    ->map(fn ($n) => [
                        'id'         => $n->id,
                        'data'       => $n->data,
                        'created_at' => $n->created_at->diffForHumans(),
                    ])->toArray()
                : [],
            'unread_notifications_count' => $request->user()
                ? $request->user()->unreadNotifications()->count()
                : 0,
        ];
    }
}
