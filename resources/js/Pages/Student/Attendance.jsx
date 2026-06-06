import StudentLayout from '@/Layouts/StudentLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const STATUS = {
    present: { label: 'Présent',  bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    absent:  { label: 'Absent',   bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500' },
    late:    { label: 'Retard',   bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400' },
    excused: { label: 'Excusé',   bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400' },
};

function StatusBadge({ status }) {
    const s = STATUS[status] ?? STATUS.present;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
}

function RateBar({ rate }) {
    const color = rate === null ? 'bg-gray-200'
        : rate >= 80 ? 'bg-emerald-500'
        : rate >= 60 ? 'bg-amber-400'
        : 'bg-red-500';
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${rate ?? 0}%` }} />
        </div>
    );
}

function ModuleCard({ mod }) {
    const [open, setOpen] = useState(false);
    const { stats, sessions } = mod;
    const hasData = stats.total > 0;

    const rateColor = stats.rate === null ? 'text-gray-400'
        : stats.rate >= 80 ? 'text-emerald-600'
        : stats.rate >= 60 ? 'text-amber-500'
        : 'text-red-600';

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            {/* Header */}
            <div className="bg-indigo-600 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">{mod.code}</p>
                <p className="mt-0.5 truncate text-base font-bold text-white">{mod.name}</p>
            </div>

            <div className="px-5 py-4 space-y-4">
                {!hasData ? (
                    <p className="text-center text-sm text-gray-400 italic py-2">Aucune séance enregistrée.</p>
                ) : (
                    <>
                        {/* Rate */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">Taux de présence</span>
                            <span className={`text-lg font-bold ${rateColor}`}>
                                {stats.rate !== null ? `${stats.rate}%` : '—'}
                            </span>
                        </div>
                        <RateBar rate={stats.rate} />

                        {/* Stats grid */}
                        <div className="grid grid-cols-4 gap-2 text-center">
                            {[
                                { label: 'Présent',  value: stats.present, color: 'text-emerald-600 bg-emerald-50' },
                                { label: 'Absent',   value: stats.absent,  color: 'text-red-600 bg-red-50' },
                                { label: 'Retard',   value: stats.late,    color: 'text-amber-600 bg-amber-50' },
                                { label: 'Excusé',   value: stats.excused, color: 'text-slate-600 bg-slate-50' },
                            ].map(s => (
                                <div key={s.label} className={`rounded-lg px-2 py-2 ${s.color}`}>
                                    <p className="text-xl font-bold leading-none">{s.value}</p>
                                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide opacity-75">{s.label}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-xs text-gray-400">{stats.total} séance{stats.total > 1 ? 's' : ''} au total</p>
                    </>
                )}

                {/* Toggle sessions */}
                {hasData && (
                    <button
                        onClick={() => setOpen(o => !o)}
                        className="flex w-full items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition"
                    >
                        <span>{open ? 'Masquer' : 'Voir'} les séances</span>
                        <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}

                {/* Sessions list */}
                {open && (
                    <div className="space-y-1 border-t border-gray-50 pt-2">
                        {sessions.map((s, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-gray-50">
                                <span className="text-sm text-gray-600">
                                    {new Date(s.date).toLocaleDateString('fr-FR', {
                                        weekday: 'short', day: '2-digit', month: 'short'
                                    })}
                                </span>
                                <div className="flex items-center gap-2">
                                    {s.note && (
                                        <span className="text-xs text-gray-400 italic">"{s.note}"</span>
                                    )}
                                    <StatusBadge status={s.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Attendance({ modules }) {
    const semesters = [...new Set(modules.map(m => m.semester))].sort((a, b) => a - b);

    const totalSessions = modules.reduce((s, m) => s + m.stats.total, 0);
    const totalAbsences = modules.reduce((s, m) => s + m.stats.absent, 0);
    const avgRate = modules.filter(m => m.stats.rate !== null).length > 0
        ? Math.round(modules.filter(m => m.stats.rate !== null).reduce((s, m) => s + m.stats.rate, 0)
            / modules.filter(m => m.stats.rate !== null).length)
        : null;

    return (
        <StudentLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Mon Assiduité</h2>}>
            <Head title="Assiduité" />

            <div className="py-10">
                <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* Global summary */}
                    {totalSessions > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Taux global',    value: avgRate !== null ? `${avgRate}%` : '—',
                                  color: avgRate === null ? 'text-gray-400' : avgRate >= 80 ? 'text-emerald-600' : avgRate >= 60 ? 'text-amber-500' : 'text-red-600',
                                  bg: 'bg-white' },
                                { label: 'Total séances',  value: totalSessions, color: 'text-indigo-600',  bg: 'bg-white' },
                                { label: 'Absences',       value: totalAbsences, color: totalAbsences > 0 ? 'text-red-600' : 'text-emerald-600', bg: 'bg-white' },
                            ].map(s => (
                                <div key={s.label} className={`rounded-xl ${s.bg} shadow-sm px-5 py-4 text-center`}>
                                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {modules.length === 0 ? (
                        <div className="rounded-xl bg-white py-16 text-center shadow-sm">
                            <p className="text-gray-400 text-sm">Aucun module inscrit.</p>
                        </div>
                    ) : (
                        semesters.map(sem => (
                            <div key={sem}>
                                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                                    Semestre {sem}
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {modules.filter(m => m.semester === sem).map(mod => (
                                        <ModuleCard key={mod.id} mod={mod} />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
