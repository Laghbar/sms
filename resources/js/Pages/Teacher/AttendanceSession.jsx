import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

function StatusButton({ status, selected, onClick, cfg }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                selected
                    ? `${cfg.bg} ${cfg.text} ring-2 ${cfg.ring} ring-offset-1`
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
        >
            {cfg.label}
        </button>
    );
}

export default function AttendanceSession({ module, date, rows, sessions }) {
    const { t } = useLanguage();
    const { flash } = usePage().props;

    const STATUS_CONFIG = {
        present: { label: t('present'), bg: 'bg-emerald-500', ring: 'ring-emerald-400', text: 'text-white', light: 'bg-emerald-50 text-emerald-700' },
        absent:  { label: t('absent'),  bg: 'bg-red-500',     ring: 'ring-red-400',     text: 'text-white', light: 'bg-red-50 text-red-700' },
        late:    { label: t('late'),    bg: 'bg-amber-400',   ring: 'ring-amber-300',   text: 'text-white', light: 'bg-amber-50 text-amber-700' },
        excused: { label: t('excused'), bg: 'bg-slate-400',   ring: 'ring-slate-300',   text: 'text-white', light: 'bg-slate-50 text-slate-700' },
    };

    const [records, setRecords] = useState(
        rows.map(r => ({ student_id: r.student_id, status: r.status, note: r.note }))
    );
    const [saving, setSaving] = useState(false);
    const [selectedDate, setSelectedDate] = useState(date);

    function setStatus(studentId, status) {
        setRecords(prev => prev.map(r =>
            r.student_id === studentId
                ? { ...r, status: r.status === status ? null : status }
                : r
        ));
    }

    function setNote(studentId, note) {
        setRecords(prev => prev.map(r =>
            r.student_id === studentId ? { ...r, note } : r
        ));
    }

    function handleDateChange(newDate) {
        setSelectedDate(newDate);
        router.get(route('teacher.attendance.session', module.id), { date: newDate }, { preserveState: false });
    }

    function save() {
        const unmarked = records.filter(r => !r.status);
        if (unmarked.length > 0) {
            const msg = t('confirm_unmarked').replace('{n}', unmarked.length);
            const ok = window.confirm(msg);
            if (!ok) return;
        }
        setSaving(true);
        router.post(
            route('teacher.attendance.save', module.id),
            { date: selectedDate, records: records.filter(r => r.status) },
            { onFinish: () => setSaving(false) }
        );
    }

    const markedCount = records.filter(r => r.status).length;
    const totalCount  = records.length;

    return (
        <TeacherLayout header={
            <div className="flex items-center gap-3">
                <Link href={route('teacher.attendance.index')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">{module.name}</h2>
                    <p className="text-xs text-gray-400">{module.code} · S{module.semester}</p>
                </div>
            </div>
        }>
            <Head title={`Attendance — ${module.name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Flash */}
                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {flash.success}
                        </div>
                    )}

                    {/* Date + progress bar */}
                    <div className="rounded-xl bg-white px-6 py-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-gray-600">{t('session_date')}</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={e => handleDateChange(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                />
                            </div>
                            <div className="text-sm text-gray-500">
                                <span className="font-semibold text-indigo-600">{markedCount}</span> / {totalCount} {t('marked')}
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-indigo-500 transition-all"
                                style={{ width: totalCount ? `${(markedCount / totalCount) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>

                    {/* Student list */}
                    {rows.length === 0 ? (
                        <div className="rounded-xl bg-white py-12 text-center text-sm text-gray-400 shadow-sm">
                            {t('no_students')}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            {/* Quick-mark all */}
                            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('students_label')}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">{t('mark_all')}</span>
                                    {Object.keys(STATUS_CONFIG).map(s => (
                                        <button key={s} type="button"
                                            onClick={() => setRecords(prev => prev.map(r => ({ ...r, status: s })))}
                                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CONFIG[s].light} hover:opacity-80`}>
                                            {STATUS_CONFIG[s].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {rows.map((row, i) => {
                                    const rec = records[i];
                                    return (
                                        <div key={row.student_id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                                            {/* Avatar */}
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                                {row.name.charAt(0).toUpperCase()}
                                            </div>

                                            {/* Name */}
                                            <span className="w-40 min-w-0 truncate text-sm font-medium text-gray-800">
                                                {row.name}
                                            </span>

                                            {/* Status buttons */}
                                            <div className="flex flex-1 flex-wrap gap-1.5">
                                                {Object.keys(STATUS_CONFIG).map(s => (
                                                    <StatusButton
                                                        key={s}
                                                        status={s}
                                                        selected={rec.status === s}
                                                        onClick={() => setStatus(row.student_id, s)}
                                                        cfg={STATUS_CONFIG[s]}
                                                    />
                                                ))}
                                            </div>

                                            {/* Note */}
                                            <input
                                                type="text"
                                                value={rec.note}
                                                onChange={e => setNote(row.student_id, e.target.value)}
                                                placeholder={t('note_placeholder_att')}
                                                className="w-32 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Save */}
                            <div className="flex items-center justify-end border-t border-gray-100 px-5 py-4">
                                <button
                                    onClick={save}
                                    disabled={saving || markedCount === 0}
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {saving ? t('loading') : t('save_attendance')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Past sessions */}
                    {sessions.length > 0 && (
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-5 py-3">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('session_history')}</h3>
                            </div>
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    <tr>
                                        <th className="px-5 py-2.5 text-left">Date</th>
                                        <th className="px-3 py-2.5 text-center text-emerald-600">{t('present')}</th>
                                        <th className="px-3 py-2.5 text-center text-red-500">{t('absent')}</th>
                                        <th className="px-3 py-2.5 text-center text-amber-500">{t('late')}</th>
                                        <th className="px-3 py-2.5 text-center text-slate-500">{t('excused')}</th>
                                        <th className="px-3 py-2.5 text-center">{t('attendance_rate_col')}</th>
                                        <th className="px-3 py-2.5" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {sessions.map(s => {
                                        const rate = s.total > 0
                                            ? Math.round((s.present_count / s.total) * 100)
                                            : 0;
                                        return (
                                            <tr key={s.session_date} className={`hover:bg-gray-50 ${s.session_date === date ? 'bg-indigo-50' : ''}`}>
                                                <td className="px-5 py-3 text-sm font-medium text-gray-700">
                                                    {new Date(s.session_date).toLocaleDateString('en-GB', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}
                                                </td>
                                                <td className="px-3 py-3 text-center text-sm font-semibold text-emerald-600">{s.present_count}</td>
                                                <td className="px-3 py-3 text-center text-sm font-semibold text-red-500">{s.absent_count}</td>
                                                <td className="px-3 py-3 text-center text-sm font-semibold text-amber-500">{s.late_count}</td>
                                                <td className="px-3 py-3 text-center text-sm font-semibold text-slate-500">{s.excused_count}</td>
                                                <td className="px-3 py-3 text-center">
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                                        rate >= 80 ? 'bg-emerald-100 text-emerald-700'
                                                        : rate >= 60 ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>{rate}%</span>
                                                </td>
                                                <td className="px-3 py-3 text-right">
                                                    <button
                                                        onClick={() => handleDateChange(s.session_date)}
                                                        className="text-xs text-indigo-500 hover:text-indigo-700"
                                                    >
                                                        {t('view')}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
}
