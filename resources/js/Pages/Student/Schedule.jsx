import StudentLayout from '@/Layouts/StudentLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS = {
    monday:    'Lundi',
    tuesday:   'Mardi',
    wednesday: 'Mercredi',
    thursday:  'Jeudi',
    friday:    'Vendredi',
    saturday:  'Samedi',
};

const TYPE_STYLES = {
    cours: 'bg-indigo-50 border-indigo-300 text-indigo-900',
    td:    'bg-amber-50  border-amber-300  text-amber-900',
    tp:    'bg-emerald-50 border-emerald-300 text-emerald-900',
};

const TYPE_LABELS = { cours: 'Cours', td: 'TD', tp: 'TP' };

const PX_PER_HOUR = 80;
const START_HOUR  = 8;
const END_HOUR    = 19;

function parseMinutes(t) {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
}

function fmt(t) {
    return t ? t.slice(0, 5) : '';
}

function SessionBlock({ s }) {
    const startMin = parseMinutes(s.start_time);
    const endMin   = parseMinutes(s.end_time);
    const top    = ((startMin - START_HOUR * 60) / 60) * PX_PER_HOUR;
    const height = Math.max(((endMin - startMin) / 60) * PX_PER_HOUR - 3, 20);
    const style  = TYPE_STYLES[s.type] ?? TYPE_STYLES.cours;

    return (
        <div
            className={`absolute left-1 right-1 overflow-hidden rounded-lg border px-2 py-1 text-xs leading-tight ${style}`}
            style={{ top: `${top}px`, height: `${height}px` }}
        >
            <p className="truncate font-semibold">{s.module?.name}</p>
            {height > 38 && (
                <p className="truncate opacity-60">{s.room} · {TYPE_LABELS[s.type]}</p>
            )}
            {height > 54 && (
                <p className="opacity-50">{fmt(s.start_time)} – {fmt(s.end_time)}</p>
            )}
            {height > 68 && s.week_parity !== 'all' && (
                <span className="mt-1 inline-block rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-medium">
                    {s.week_parity === 'odd' ? 'Sem. A' : 'Sem. B'}
                </span>
            )}
        </div>
    );
}

export default function Schedule({ schedules }) {
    const [parity, setParity] = useState('all');

    const filtered = schedules.filter(
        (s) => parity === 'all' || s.week_parity === 'all' || s.week_parity === parity
    );

    const byDay     = DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {});
    filtered.forEach((s) => byDay[s.day]?.push(s));
    const activeDays  = DAYS.filter((d) => byDay[d].length > 0);
    const hours       = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
    const halfHours   = Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, i) => i);
    const totalHeight = (END_HOUR - START_HOUR) * PX_PER_HOUR;

    return (
        <StudentLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Emploi du Temps
                </h2>
            }
        >
            <Head title="Emploi du Temps" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Legend */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: 'Cours', cls: 'bg-indigo-50 text-indigo-700 border-indigo-300' },
                                { label: 'TD',    cls: 'bg-amber-50  text-amber-700  border-amber-300' },
                                { label: 'TP',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
                            ].map((l) => (
                                <span
                                    key={l.label}
                                    className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${l.cls}`}
                                >
                                    {l.label}
                                </span>
                            ))}
                        </div>

                        {/* Week parity toggle */}
                        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
                            {[
                                { value: 'all',  label: 'Toutes' },
                                { value: 'odd',  label: 'Sem. A' },
                                { value: 'even', label: 'Sem. B' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setParity(opt.value)}
                                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                                        parity === opt.value
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Timetable */}
                    {activeDays.length === 0 ? (
                        <div className="rounded-xl bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
                            Aucune séance planifiée.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
                            <div className="min-w-[600px]">

                                {/* Day header row */}
                                <div className="flex border-b border-gray-100">
                                    <div className="w-14 shrink-0 border-r border-gray-100" />
                                    {activeDays.map((day) => (
                                        <div
                                            key={day}
                                            className="flex-1 border-r border-gray-100 px-2 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-600 last:border-r-0"
                                        >
                                            {DAY_LABELS[day]}
                                        </div>
                                    ))}
                                </div>

                                {/* Grid body */}
                                <div className="flex" style={{ height: `${totalHeight}px` }}>

                                    {/* Time labels */}
                                    <div className="relative w-14 shrink-0 border-r border-gray-100">
                                        {hours.map((h) => (
                                            <div
                                                key={h}
                                                className="absolute right-2 -translate-y-2 text-[10px] text-gray-400"
                                                style={{ top: `${(h - START_HOUR) * PX_PER_HOUR}px` }}
                                            >
                                                {String(h).padStart(2, '0')}h
                                            </div>
                                        ))}
                                    </div>

                                    {/* Day columns */}
                                    {activeDays.map((day) => (
                                        <div
                                            key={day}
                                            className="relative flex-1 border-r border-gray-100 last:border-r-0"
                                        >
                                            {/* Half-hour lines */}
                                            {halfHours.map((i) => (
                                                <div
                                                    key={i}
                                                    className={`absolute left-0 right-0 ${
                                                        i % 2 === 0
                                                            ? 'border-t border-gray-100'
                                                            : 'border-t border-dashed border-gray-100'
                                                    }`}
                                                    style={{ top: `${(i / 2) * PX_PER_HOUR}px` }}
                                                />
                                            ))}

                                            {/* Session blocks */}
                                            {byDay[day].map((s) => (
                                                <SessionBlock key={s.id} s={s} />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
