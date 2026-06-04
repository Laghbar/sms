import StudentLayout from '@/Layouts/StudentLayout';
import { Head } from '@inertiajs/react';

export default function Schedule({ timetable }) {
    return (
        <StudentLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Emploi du Temps</h2>}>
            <Head title="Emploi du Temps" />

            <div className="py-12">
                <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
                    {timetable ? (
                        <a
                            href={timetable.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-5 rounded-2xl border border-indigo-200 bg-white px-6 py-5 shadow-sm transition hover:shadow-md hover:border-indigo-400"
                        >
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-3xl">
                                {timetable.name?.toLowerCase().endsWith('.pdf') ? '📄' : '📝'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-semibold text-gray-900">Emploi du Temps</p>
                                <p className="mt-0.5 truncate text-sm text-indigo-500">{timetable.name}</p>
                            </div>
                            <div className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                                Télécharger
                            </div>
                        </a>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                            <p className="text-4xl mb-3">🗓️</p>
                            <p className="text-sm font-medium text-gray-500">Aucun emploi du temps disponible pour le moment.</p>
                            <p className="mt-1 text-xs text-gray-400">Revenez plus tard ou contactez votre administration.</p>
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
