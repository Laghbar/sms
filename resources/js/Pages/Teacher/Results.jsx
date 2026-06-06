import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

function gradeColor(v) {
    if (v === null || v === undefined || v === '') return 'text-gray-400';
    return parseFloat(v) >= 10 ? 'text-emerald-600' : 'text-red-500';
}

function buildGrades(mod) {
    const init = {};
    mod.students.forEach((s) => {
        init[s.id] = s.grade !== null && s.grade !== undefined ? String(s.grade) : '';
    });
    return init;
}

function buildNotes(mod) {
    const init = {};
    mod.students.forEach((s) => { init[s.id] = s.note ?? ''; });
    return init;
}

function StatBadge({ label, value, color = 'gray' }) {
    const colors = {
        gray:   'bg-gray-100 text-gray-600',
        green:  'bg-emerald-100 text-emerald-700',
        amber:  'bg-amber-100 text-amber-700',
        indigo: 'bg-indigo-100 text-indigo-700',
    };
    return (
        <div className={`rounded-lg px-3 py-1.5 text-center ${colors[color]}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
            <p className="text-sm font-bold">{value}</p>
        </div>
    );
}

export default function Results({ modules }) {
    const { t } = useLanguage();
    const [selectedId, setSelectedId]           = useState(modules[0]?.id ?? null);
    const [grades, setGrades]                   = useState(() => modules[0] ? buildGrades(modules[0]) : {});
    const [notes, setNotes]                     = useState(() => modules[0] ? buildNotes(modules[0]) : {});
    const [panel, setPanel]                     = useState('grades');
    const [saving, setSaving]                   = useState(false);
    const [savingNotes, setSavingNotes]         = useState(false);
    const [publishing, setPublishing]           = useState(false);
    const [unpublishing, setUnpublishing]       = useState(false);
    const [confirmPublish, setConfirmPublish]   = useState(false);
    const [confirmUnpublish, setConfirmUnpublish] = useState(false);

    const module = modules.find((m) => m.id === selectedId);

    function selectModule(mod) {
        setSelectedId(mod.id);
        setGrades(buildGrades(mod));
        setNotes(buildNotes(mod));
        setConfirmPublish(false);
        setConfirmUnpublish(false);
        setPanel('grades');
    }

    function save() {
        setSaving(true);
        router.post(route('teacher.results.save', module.id), { grades }, {
            preserveScroll: true,
            onSuccess: (page) => {
                const fresh = page.props.modules?.find((m) => m.id === selectedId);
                if (fresh) { setGrades(buildGrades(fresh)); setNotes(buildNotes(fresh)); }
            },
            onFinish: () => setSaving(false),
        });
    }

    function saveNotes() {
        setSavingNotes(true);
        router.post(route('teacher.results.notes', module.id), { notes }, {
            preserveScroll: true,
            onFinish: () => setSavingNotes(false),
        });
    }

    function publish() {
        setPublishing(true);
        router.post(route('teacher.results.publish', module.id), {}, {
            preserveScroll: true,
            onFinish: () => { setPublishing(false); setConfirmPublish(false); },
        });
    }

    function unpublish() {
        setUnpublishing(true);
        router.post(route('teacher.results.unpublish', module.id), {}, {
            preserveScroll: true,
            onFinish: () => { setUnpublishing(false); setConfirmUnpublish(false); },
        });
    }

    // Class statistics for the current module
    function getStats(mod) {
        const currentGrades = Object.values(grades)
            .map((v) => v !== '' ? parseFloat(v) : null)
            .filter((v) => v !== null && !isNaN(v));
        const graded   = currentGrades.length;
        const total    = mod.students.length;
        const avgGrade = graded > 0 ? (currentGrades.reduce((s, v) => s + v, 0) / graded).toFixed(2) : null;
        const passing  = currentGrades.filter((v) => v >= 10).length;
        return { graded, total, avgGrade, passing };
    }

    if (!modules.length) {
        return (
            <TeacherLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{t('nav_results_teacher')}</h2>}>
                <Head title={t('nav_results_teacher')} />
                <div className="py-12">
                    <div className="mx-auto max-w-5xl px-4">
                        <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
                            {t('no_modules_teacher')}
                        </div>
                    </div>
                </div>
            </TeacherLayout>
        );
    }

    const stats = module ? getStats(module) : null;

    return (
        <TeacherLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{t('results_management')}</h2>}>
            <Head title={t('nav_results_teacher')} />

            <div className="py-8">
                <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Module tabs */}
                    <div className="flex flex-wrap gap-2">
                        {modules.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => selectModule(m)}
                                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                    m.id === selectedId
                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-700'
                                }`}
                            >
                                {m.name}
                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                    m.id === selectedId ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {m.semester_name}
                                </span>
                                {m.is_published && (
                                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">✓</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {module && (
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            {/* Module header */}
                            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {module.name}
                                            <span className="ms-2 font-mono text-sm text-gray-400">({module.code})</span>
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-400">
                                            {module.semester_name} · Coeff. {module.coefficient} · {module.students.length} {t('students_label')}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Stats */}
                                        {stats && (
                                            <div className="flex gap-2">
                                                <StatBadge label={t('graded_label')} value={`${stats.graded}/${stats.total}`} color="indigo" />
                                                {stats.avgGrade && <StatBadge label={t('class_avg')} value={`${stats.avgGrade}/20`} color={parseFloat(stats.avgGrade) >= 10 ? 'green' : 'amber'} />}
                                                {stats.graded > 0 && <StatBadge label={t('passing_label')} value={`${stats.passing}/${stats.graded}`} color="green" />}
                                            </div>
                                        )}

                                        {/* Panel toggle */}
                                        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
                                            <button
                                                onClick={() => setPanel('grades')}
                                                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${panel === 'grades' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                {t('panel_grades')}
                                            </button>
                                            <button
                                                onClick={() => setPanel('notes')}
                                                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${panel === 'notes' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                {t('panel_notes')}
                                            </button>
                                        </div>

                                        {/* Publication badge */}
                                        {module.is_published ? (
                                            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                ✓ {t('published_badge')}
                                                {module.published_at && (
                                                    <span className="text-emerald-500 font-normal">
                                                        · {new Date(module.published_at).toLocaleDateString('en-GB')}
                                                    </span>
                                                )}
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                {t('draft_label')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {module.students.length === 0 ? (
                                <div className="p-10 text-center text-sm text-gray-400">
                                    {t('no_students')}
                                </div>
                            ) : (
                                <>
                                    {/* ── Notes panel ── */}
                                    {panel === 'notes' && (
                                        <div className="divide-y divide-gray-50">
                                            <div className="bg-indigo-50 px-6 py-3 text-xs text-indigo-600">
                                                {t('private_notes_hint')}
                                            </div>
                                            {module.students.map((s) => (
                                                <div key={s.id} className="flex items-start gap-4 px-6 py-4">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                                                        {s.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="mb-1.5 text-sm font-medium text-gray-900">{s.name}</p>
                                                        <textarea
                                                            value={notes[s.id] ?? ''}
                                                            onChange={(e) => setNotes((prev) => ({ ...prev, [s.id]: e.target.value }))}
                                                            rows={2}
                                                            placeholder={t('add_note_placeholder')}
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* ── Grades table ── */}
                                    {panel === 'grades' && (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-100">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            {t('students_label')}
                                                        </th>
                                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            {t('grade')} <span className="font-normal text-gray-400">(0–20)</span>
                                                        </th>
                                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            {t('status')}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {module.students.map((s, idx) => {
                                                        const val = grades[s.id] ?? '';
                                                        const num = val !== '' ? parseFloat(val) : null;
                                                        return (
                                                            <tr key={s.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                                                            {idx + 1}
                                                                        </div>
                                                                        <span className="text-sm font-medium text-gray-900">{s.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-3 text-center">
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        max={20}
                                                                        step={0.25}
                                                                        value={val}
                                                                        onChange={(e) =>
                                                                            setGrades((prev) => ({
                                                                                ...prev,
                                                                                [s.id]: e.target.value,
                                                                            }))
                                                                        }
                                                                        placeholder="—"
                                                                        className={`w-24 rounded-lg border px-3 py-1.5 text-center text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
                                                                            num !== null
                                                                                ? num >= 10
                                                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-400'
                                                                                    : 'border-red-200 bg-red-50 text-red-600 focus:border-red-400'
                                                                                : 'border-gray-200 text-gray-700'
                                                                        }`}
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-3 text-center">
                                                                    {num !== null ? (
                                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                                            num >= 10
                                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                                : 'bg-red-100 text-red-600'
                                                                        }`}>
                                                                            {num >= 10 ? t('pass_label') : t('fail_label')}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs text-gray-300">{t('not_entered')}</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* ── Actions footer ── */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
                                        {panel === 'grades' ? (
                                            <>
                                                <button
                                                    onClick={save}
                                                    disabled={saving}
                                                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                                                >
                                                    {saving ? t('loading') : t('save_grades')}
                                                </button>

                                                <div className="flex items-center gap-2">
                                                    {/* Publish flow */}
                                                    {!module.is_published && !confirmPublish && (
                                                        <button
                                                            onClick={() => setConfirmPublish(true)}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                                                        >
                                                            {t('publish_results')}
                                                        </button>
                                                    )}
                                                    {!module.is_published && confirmPublish && (
                                                        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2">
                                                            <p className="text-xs text-amber-700">{t('confirm_publish_msg')}</p>
                                                            <button onClick={publish} disabled={publishing} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
                                                                {publishing ? '…' : t('confirm')}
                                                            </button>
                                                            <button onClick={() => setConfirmPublish(false)} className="text-xs text-gray-400 hover:text-gray-600">{t('cancel')}</button>
                                                        </div>
                                                    )}

                                                    {/* Unpublish flow */}
                                                    {module.is_published && !confirmUnpublish && (
                                                        <button
                                                            onClick={() => setConfirmUnpublish(true)}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-5 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
                                                        >
                                                            {t('unpublish_label')}
                                                        </button>
                                                    )}
                                                    {module.is_published && confirmUnpublish && (
                                                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2">
                                                            <p className="text-xs text-red-700">{t('confirm_unpublish_msg')}</p>
                                                            <button onClick={unpublish} disabled={unpublishing} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60">
                                                                {unpublishing ? '…' : t('confirm')}
                                                            </button>
                                                            <button onClick={() => setConfirmUnpublish(false)} className="text-xs text-gray-400 hover:text-gray-600">{t('cancel')}</button>
                                                        </div>
                                                    )}

                                                    {/* Re-publish if already published */}
                                                    {module.is_published && !confirmUnpublish && (
                                                        <button
                                                            onClick={() => setConfirmPublish(true)}
                                                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                                                        >
                                                            {t('republish_label')}
                                                        </button>
                                                    )}
                                                    {module.is_published && confirmPublish && (
                                                        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2">
                                                            <p className="text-xs text-amber-700">{t('confirm_republish_msg')}</p>
                                                            <button onClick={publish} disabled={publishing} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
                                                                {publishing ? '…' : t('confirm')}
                                                            </button>
                                                            <button onClick={() => setConfirmPublish(false)} className="text-xs text-gray-400 hover:text-gray-600">{t('cancel')}</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <button
                                                onClick={saveNotes}
                                                disabled={savingNotes}
                                                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                                            >
                                                {savingNotes ? t('loading') : t('save_notes_btn')}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
}
