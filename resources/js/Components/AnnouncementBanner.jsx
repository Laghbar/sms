import { usePage } from '@inertiajs/react';
import { useState } from 'react';

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

export default function AnnouncementBanner() {
    const { announcements } = usePage().props;
    const [dismissed, setDismissed] = useState([]);

    if (!announcements?.length) return null;

    const visible = announcements.filter((a) => !dismissed.includes(a.id));
    if (!visible.length) return null;

    const latest = visible[0];
    const moreCount = visible.length - 1;

    return (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
            <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 sm:px-6 lg:px-8">
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-base">📢</span>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-amber-900">{latest.title}</p>
                        <p className="mt-0.5 text-sm text-amber-800 line-clamp-2 whitespace-pre-line">
                            {latest.content}
                        </p>
                        <p className="mt-1 text-xs text-amber-600">
                            {formatDate(latest.created_at)}
                            {moreCount > 0 && (
                                <span className="ms-2 font-medium">
                                    +{moreCount} more announcement{moreCount > 1 ? 's' : ''}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setDismissed((prev) => [...prev, latest.id])}
                    className="shrink-0 rounded p-1 text-amber-500 hover:bg-amber-100 hover:text-amber-700"
                    aria-label="Dismiss"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
