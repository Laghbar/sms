import StudentLayout from '@/Layouts/StudentLayout';
import { Head } from '@inertiajs/react';

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Schedule({ timetable, examTimetables = [] }) {
    return (
        <StudentLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Emploi du Temps</h2>}>
            <Head title="Emploi du Temps" />

            <div className="py-12">
                <div className="mx-auto max-w-xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* ── Class timetable ──────────────────────────────────── */}
                    <section>
                        <h3 className="mb-3 text-sm font-semibold text-gray-600">Emploi du Temps des Cours</h3>
                        {timetable ? (
                            <a
                                href={timetable.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-5 rounded-2xl border border-indigo-200 bg-white px-6 py-5 shadow-sm transition hover:border-indigo-400 hover:shadow-md"
                            >
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-3xl">
                                    {timetable.name?.toLowerCase().endsWith('.pdf') ? '📄' : '📝'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-base font-semibold text-gray-900">Emploi du Temps</p>
                                    <p className="mt-0.5 truncate text-sm text-indigo-500">{timetable.name}</p>
                                </div>
                                <div className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                                    Télécharger
                                </div>
                            </a>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
                                <p className="text-3xl mb-2">🗓️</p>
                                <p className="text-sm font-medium text-gray-500">Aucun emploi du temps disponible.</p>
                                <p className="mt-1 text-xs text-gray-400">Contactez votre administration.</p>
                            </div>
                        )}
                    </section>

                    {/* ── Exam timetables ──────────────────────────────────── */}
                    <section>
                        <h3 className="mb-3 text-sm font-semibold text-gray-600">
                            Calendriers d'Examens
                            {examTimetables.length > 0 && (
                                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                    {examTimetables.length}
                                </span>
                            )}
                        </h3>

                        {examTimetables.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
                                <p className="text-3xl mb-2">📋</p>
                                <p className="text-sm font-medium text-gray-500">Aucun calendrier d'examens publié.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {examTimetables.map((t) => (
                                    <a
                                        key={t.id}
                                        href={t.download_url}
                                        className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-white px-5 py-4 shadow-sm transition hover:border-amber-300 hover:shadow-md"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-2xl">
                                            📋
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                                            <p className="mt-0.5 truncate text-xs text-gray-400">
                                                {t.file_name} · Publié le {formatDate(t.created_at)}
                                            </p>
                                        </div>
                                        <div className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white">
                                            Télécharger
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </section>

                </div>
            </div>
        </StudentLayout>
    );
}
