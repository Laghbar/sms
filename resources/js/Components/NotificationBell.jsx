import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

function BellIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    );
}

function NotificationIcon({ type }) {
    const icons = {
        exam:                    '📝',
        results:                 '📊',
        password_forgot:         '🔑',
        new_comment:             '💬',
        comment_reply:           '↩️',
        stage_folder_requested:  '📁',
        stage_folder_ready:      '✅',
        exam_timetable:          '🗓️',
    };
    return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-base">
            {icons[type] ?? '📢'}
        </div>
    );
}

function NotificationContent({ n }) {
    const { type } = n.data;

    if (type === 'new_comment') {
        return (
            <>
                <p className="text-xs font-semibold text-emerald-600">New Comment</p>
                <p className="mt-0.5 text-xs text-gray-500">
                    <span className="font-medium text-gray-800">{n.data.commenter_name}</span>
                    {' commented on '}
                    <span className="font-medium text-indigo-700">{n.data.course_file_title}</span>
                    {n.data.module_name && <span className="text-gray-400"> · {n.data.module_name}</span>}
                </p>
                {n.data.body_preview && (
                    <p className="mt-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600 italic line-clamp-2">
                        "{n.data.body_preview}"
                    </p>
                )}
            </>
        );
    }

    if (type === 'comment_reply') {
        return (
            <>
                <p className="text-xs font-semibold text-indigo-600">Reply to your comment</p>
                <p className="mt-0.5 text-xs text-gray-500">
                    <span className="font-medium text-gray-800">{n.data.commenter_name}</span>
                    {' replied in '}
                    <span className="font-medium text-indigo-700">{n.data.course_file_title}</span>
                    {n.data.module_name && <span className="text-gray-400"> · {n.data.module_name}</span>}
                </p>
                {n.data.body_preview && (
                    <p className="mt-1 rounded-md bg-indigo-50 px-2 py-1 text-xs text-indigo-700 italic line-clamp-2">
                        "{n.data.body_preview}"
                    </p>
                )}
            </>
        );
    }

    if (type === 'password_forgot') {
        return (
            <>
                <p className="text-xs font-semibold text-amber-600">Password Reset Request</p>
                <p className="mt-0.5 text-sm font-medium text-gray-900">{n.data.user_name}</p>
                <p className="text-xs text-gray-500">{n.data.user_email}</p>
                <div className="mt-1.5 flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1">
                    <span className="text-xs text-amber-600">Temp password:</span>
                    <span className="font-mono text-xs font-bold text-amber-800 select-all">{n.data.temp_password}</span>
                </div>
            </>
        );
    }

    if (type === 'results') {
        return (
            <>
                <p className="text-xs font-semibold text-indigo-700">
                    Results Published — {n.data.module_name}
                    <span className="ms-1 font-normal text-indigo-400">({n.data.module_code})</span>
                </p>
                <p className="mt-0.5 text-sm text-gray-700">{n.data.message}</p>
            </>
        );
    }

    if (type === 'exam') {
        return (
            <>
                <p className="text-xs font-semibold text-indigo-700">
                    Exam — {n.data.module_name}
                    <span className="ms-1 font-normal text-indigo-400">({n.data.module_code})</span>
                </p>
                <p className="mt-0.5 text-sm font-medium text-gray-900">{n.data.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                    📅 {new Date(n.data.exam_date).toLocaleDateString('en-GB', {
                        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                    })}
                    {n.data.start_time && ` at ${n.data.start_time}`}
                    {n.data.end_time   && ` – ${n.data.end_time}`}
                </p>
                {n.data.location && <p className="text-xs text-gray-500">📍 {n.data.location}</p>}
            </>
        );
    }

    if (type === 'exam_timetable') {
        return (
            <>
                <p className="text-xs font-semibold text-indigo-600">Calendrier des examens</p>
                <p className="mt-0.5 text-sm font-medium text-gray-900">{n.data.title}</p>
                {n.data.specialization && (
                    <p className="text-xs text-gray-500">{n.data.specialization}</p>
                )}
                <p className="mt-0.5 text-xs text-gray-500">{n.data.message}</p>
            </>
        );
    }

    if (type === 'stage_folder_requested') {
        return (
            <>
                <p className="text-xs font-semibold text-violet-600">Demande de dossier de stage</p>
                <p className="mt-0.5 text-sm font-medium text-gray-900">{n.data.student_name}</p>
                <p className="text-xs text-gray-500">A soumis une demande de dossier de stage.</p>
            </>
        );
    }

    if (type === 'stage_folder_ready') {
        return (
            <>
                <p className="text-xs font-semibold text-emerald-600">Dossier de stage prêt</p>
                <p className="mt-0.5 text-sm text-gray-700">{n.data.message}</p>
                <p className="mt-0.5 text-xs font-medium text-emerald-500">Cliquez pour le télécharger →</p>
            </>
        );
    }

    return <p className="text-sm text-gray-500">New notification</p>;
}

export default function NotificationBell() {
    const { notifications, unread_notifications_count } = usePage().props;
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handler(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    function markAllRead() {
        router.post(route('notifications.read-all'), {}, { preserveScroll: true });
        setOpen(false);
    }

    function markRead(id) {
        router.patch(route('notifications.read', id), {}, { preserveScroll: true });
    }

    function handleClick(n) {
        // Mark as read, then navigate to the discussion page if available
        if (n.data.discussion_url) {
            router.patch(route('notifications.read', n.id), {}, {
                preserveScroll: true,
                onFinish: () => router.visit(n.data.discussion_url),
            });
            setOpen(false);
        }
    }

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative flex items-center justify-center rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
                aria-label="Notifications"
            >
                <BellIcon className="h-5 w-5" />
                {unread_notifications_count > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
                        {unread_notifications_count > 9 ? '9+' : unread_notifications_count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-100 bg-white shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">
                            Notifications
                            {unread_notifications_count > 0 && (
                                <span className="ms-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                    {unread_notifications_count}
                                </span>
                            )}
                        </p>
                        {unread_notifications_count > 0 && (
                            <button onClick={markAllRead} className="text-xs text-indigo-600 hover:text-indigo-800">
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                            <li className="px-4 py-8 text-center text-sm text-gray-400">
                                No new notifications.
                            </li>
                        ) : (
                            notifications.map((n) => {
                                const isClickable = !!n.data.discussion_url;
                                const isUnread    = !n.read_at;

                                return (
                                    <li
                                        key={n.id}
                                        className={`px-4 py-3 transition-colors ${
                                            isUnread ? 'bg-indigo-50/60' : ''
                                        } ${isClickable ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50'}`}
                                        onClick={isClickable ? () => handleClick(n) : undefined}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Unread dot */}
                                            <div className="relative mt-1 shrink-0">
                                                <NotificationIcon type={n.data.type} />
                                                {isUnread && (
                                                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <NotificationContent n={n} />
                                                <p className="mt-1 text-xs text-gray-400">{n.created_at}</p>
                                                {isClickable && (
                                                    <p className="mt-0.5 text-xs font-medium text-indigo-500">
                                                        View discussion →
                                                    </p>
                                                )}
                                            </div>

                                            {/* Dismiss button — stops propagation so click-to-navigate doesn't fire */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                                                title="Dismiss"
                                                className="shrink-0 text-gray-300 hover:text-gray-500"
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </li>
                                );
                            })
                        )}
                    </ul>

                    {notifications.length > 0 && (
                        <div className="border-t border-gray-100 px-4 py-2 text-center">
                            <button onClick={markAllRead} className="text-xs text-gray-400 hover:text-gray-600">
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
