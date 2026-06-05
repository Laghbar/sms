import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link } from '@inertiajs/react';

function StatBadge({ label, value, color }) {
    return (
        <div className={`rounded-lg px-3 py-1.5 text-center ${color}`}>
            <p className="text-lg font-bold leading-none">{value}</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide opacity-75">{label}</p>
        </div>
    );
}

export default function Attendance({ modules }) {
    const grouped = [...new Set(modules.map(m => m.semester))].sort((a, b) => a - b);

    return (
        <TeacherLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Attendance</h2>}>
            <Head title="Attendance" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    {modules.length === 0 && (
                        <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
                            No modules assigned yet.
                        </div>
                    )}

                    {grouped.map(sem => {
                        const semModules = modules.filter(m => m.semester === sem);
                        return (
                            <div key={sem}>
                                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">S{sem}</h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {semModules.map(mod => (
                                        <div key={mod.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                                            {/* Card header */}
                                            <div className="bg-indigo-600 px-5 py-4">
                                                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">{mod.code}</p>
                                                <p className="mt-0.5 truncate text-base font-bold text-white">{mod.name}</p>
                                            </div>

                                            {/* Stats row */}
                                            <div className="flex gap-2 px-5 py-4">
                                                <StatBadge label="Students"  value={mod.students_count} color="bg-indigo-50 text-indigo-700" />
                                                <StatBadge label="Sessions"  value={mod.sessions_count} color="bg-emerald-50 text-emerald-700" />
                                                <div className="flex-1 rounded-lg bg-gray-50 px-3 py-1.5">
                                                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Last session</p>
                                                    <p className="mt-0.5 text-xs font-semibold text-gray-600">
                                                        {mod.last_session
                                                            ? new Date(mod.last_session).toLocaleDateString('en-GB', { day:'2-digit', month:'short' })
                                                            : '—'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action */}
                                            <div className="border-t border-gray-100 px-5 py-3">
                                                <Link
                                                    href={route('teacher.attendance.session', mod.id)}
                                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                    </svg>
                                                    Take Attendance
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </TeacherLayout>
    );
}
