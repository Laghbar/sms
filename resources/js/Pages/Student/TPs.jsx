import StudentLayout from '@/Layouts/StudentLayout';
import { Head } from '@inertiajs/react';

const STATUS = {
    upcoming:  { label: 'Upcoming',  classes: 'bg-blue-100 text-blue-700' },
    due_today: { label: 'Due Today', classes: 'bg-amber-100 text-amber-700' },
    overdue:   { label: 'Overdue',   classes: 'bg-red-100 text-red-700' },
};

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(dateStr) {
    const diff = Math.ceil((new Date(dateStr) - new Date().setHours(0,0,0,0)) / 86400000);
    if (diff < 0)  return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return 'Due today';
    return `${diff}d left`;
}

export default function TPs({ tps }) {
    const groups = {
        due_today: tps.filter(t => t.status === 'due_today'),
        upcoming:  tps.filter(t => t.status === 'upcoming'),
        overdue:   tps.filter(t => t.status === 'overdue'),
    };

    return (
        <StudentLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Practical Work (TPs)</h2>}>
            <Head title="TPs" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {tps.length === 0 && (
                        <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
                            No TPs assigned yet.
                        </div>
                    )}

                    {[
                        { key: 'due_today', title: '⚠️ Due Today' },
                        { key: 'upcoming',  title: '📅 Upcoming' },
                        { key: 'overdue',   title: '🔴 Overdue' },
                    ].map(({ key, title }) => {
                        const items = groups[key];
                        if (!items.length) return null;
                        return (
                            <div key={key}>
                                <h3 className="mb-3 text-sm font-semibold text-gray-600">{title}</h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {items.map(tp => {
                                        const st = STATUS[tp.status];
                                        return (
                                            <div key={tp.id} className="rounded-xl bg-white shadow-sm overflow-hidden">
                                                <div className="p-5">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="font-semibold text-gray-900">{tp.title}</p>
                                                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${st.classes}`}>
                                                            {st.label}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-xs text-indigo-600 font-medium">
                                                        {tp.module?.name} <span className="text-gray-400">({tp.module?.code})</span>
                                                    </p>

                                                    {tp.description && (
                                                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{tp.description}</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3 text-xs text-gray-500">
                                                    <span>📅 {formatDate(tp.due_date)}</span>
                                                    <span className={key === 'overdue' ? 'text-red-500 font-medium' : key === 'due_today' ? 'text-amber-600 font-medium' : ''}>
                                                        {daysUntil(tp.due_date)}
                                                    </span>
                                                    <span>Max: <strong>{tp.max_grade}</strong></span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </StudentLayout>
    );
}
