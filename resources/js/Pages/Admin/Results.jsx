import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useState } from 'react';

function SpecializationSelector({ specializations, selected, onChange, t }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <button
                onClick={() => onChange('')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    !selected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                }`}
            >
                {t('all')}
            </button>
            {specializations.map((s) => (
                <button
                    key={s.id}
                    onClick={() => onChange(s.id)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        String(selected) === String(s.id)
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                >
                    <span className="font-mono font-bold">{s.code}</span>
                    <span className="ml-1.5 hidden sm:inline text-xs opacity-80">{s.name}</span>
                </button>
            ))}
        </div>
    );
}

function GradeInput({ value, onChange }) {
    const num = value !== '' && value !== null ? parseFloat(value) : null;
    return (
        <input
            type="number"
            min={0}
            max={20}
            step={0.25}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="—"
            className={`w-20 rounded-lg border px-2 py-1 text-center text-sm font-semibold focus:outline-none focus:ring-1 ${
                num !== null
                    ? num >= 10
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-400 focus:ring-emerald-300'
                        : 'border-red-200 bg-red-50 text-red-600 focus:border-red-400 focus:ring-red-300'
                    : 'border-gray-200 text-gray-700 focus:border-indigo-400 focus:ring-indigo-300'
            }`}
        />
    );
}

function StatusDot({ isPublished, t }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-600'
        }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
            {isPublished ? t('published_badge') : t('draft_label')}
        </span>
    );
}

function ModuleCard({ module, t }) {
    const [expanded, setExpanded]   = useState(false);
    const [grades, setGrades]       = useState(() => {
        const init = {};
        module.students.forEach((s) => { init[s.id] = s.grade !== null ? String(s.grade) : ''; });
        return init;
    });
    const [saving, setSaving]       = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // 'publish' | 'unpublish'

    function saveGrades() {
        setSaving(true);
        router.post(route('admin.results.update-grades', module.id), { grades }, {
            preserveScroll: true,
            onSuccess: (page) => {
                // Refresh grades from fresh data
                const fresh = page.props.modules?.find((m) => m.id === module.id);
                if (fresh) {
                    const updated = {};
                    fresh.students.forEach((s) => { updated[s.id] = s.grade !== null ? String(s.grade) : ''; });
                    setGrades(updated);
                }
            },
            onFinish: () => setSaving(false),
        });
    }

    function doPublish() {
        setPublishing(true);
        router.post(route('admin.results.publish', module.id), {}, {
            preserveScroll: true,
            onFinish: () => { setPublishing(false); setConfirmAction(null); },
        });
    }

    function doUnpublish() {
        setPublishing(true);
        router.post(route('admin.results.unpublish', module.id), {}, {
            preserveScroll: true,
            onFinish: () => { setPublishing(false); setConfirmAction(null); },
        });
    }

    const gradedCount = module.students.filter((s) => {
        const v = grades[s.id];
        return v !== '' && v !== null && v !== undefined;
    }).length;
    const totalCount = module.students.length;

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            {/* Card header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900">{module.name}</h3>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500">{module.code}</span>
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                            Coeff. {module.coefficient}
                        </span>
                        {module.semester_name && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                {module.semester_name}
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                        {t('teacher')}: <span className="font-medium text-gray-600">{module.teacher_name}</span>
                        {module.avg_grade !== null && (
                            <span className="ms-2">
                                · {t('class_avg')}:
                                <span className={`ms-1 font-semibold ${module.avg_grade >= 10 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {module.avg_grade}/20
                                </span>
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Progress */}
                    <div className="text-center">
                        <p className="text-[10px] font-semibold uppercase text-gray-400">{t('graded_label')}</p>
                        <p className="text-sm font-bold text-gray-700">{gradedCount}<span className="font-normal text-gray-400">/{totalCount}</span></p>
                    </div>

                    <StatusDot isPublished={module.is_published} t={t} />

                    {/* Action buttons */}
                    {confirmAction === null && (
                        <>
                            {!module.is_published ? (
                                <button
                                    onClick={() => setConfirmAction('publish')}
                                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                >
                                    {t('publish_results')}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setConfirmAction('publish')}
                                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                    >
                                        {t('republish_label')}
                                    </button>
                                    <button
                                        onClick={() => setConfirmAction('unpublish')}
                                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                                    >
                                        {t('unpublish_label')}
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    {/* Confirm publish */}
                    {confirmAction === 'publish' && (
                        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5">
                            <span className="text-xs text-amber-700">{t('notify_students_confirm')}</span>
                            <button onClick={doPublish} disabled={publishing} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-60">
                                {publishing ? '…' : t('yes')}
                            </button>
                            <button onClick={() => setConfirmAction(null)} className="text-xs text-gray-400 hover:text-gray-600">{t('no')}</button>
                        </div>
                    )}

                    {/* Confirm unpublish */}
                    {confirmAction === 'unpublish' && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5">
                            <span className="text-xs text-red-700">{t('hide_from_students_confirm')}</span>
                            <button onClick={doUnpublish} disabled={publishing} className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-60">
                                {publishing ? '…' : t('yes')}
                            </button>
                            <button onClick={() => setConfirmAction(null)} className="text-xs text-gray-400 hover:text-gray-600">{t('no')}</button>
                        </div>
                    )}

                    {/* Expand/collapse */}
                    <button
                        onClick={() => setExpanded((v) => !v)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                        {expanded ? `${t('hide_sessions')} ▲` : `${t('edit')} ${t('col_grades')} ▼`}
                    </button>
                </div>
            </div>

            {/* Expanded grades table */}
            {expanded && (
                <>
                    <div className="border-t border-gray-100 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-50">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">#</th>
                                    <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{t('student')}</th>
                                    <th className="px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">{t('col_grades')} (0–20)</th>
                                    <th className="px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">{t('rank_col')}</th>
                                    <th className="px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">{t('pass_fail_col')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {module.students.map((s, idx) => {
                                    const val = grades[s.id] ?? '';
                                    const num = val !== '' ? parseFloat(val) : null;
                                    return (
                                        <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-2.5 text-xs text-gray-400">{idx + 1}</td>
                                            <td className="px-5 py-2.5">
                                                <p className="text-sm font-medium text-gray-900">{s.name}</p>
                                            </td>
                                            <td className="px-5 py-2.5 text-center">
                                                <GradeInput
                                                    value={val}
                                                    onChange={(v) => setGrades((prev) => ({ ...prev, [s.id]: v }))}
                                                />
                                            </td>
                                            <td className="px-5 py-2.5 text-center">
                                                {s.rank !== null && s.rank !== undefined ? (
                                                    <span className="text-sm font-semibold text-indigo-700">#{s.rank}</span>
                                                ) : (
                                                    <span className="text-xs text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-2.5 text-center">
                                                {num !== null ? (
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                        num >= 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                        {num >= 10 ? t('pass_label') : t('fail_label')}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-300">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t border-gray-100 px-5 py-3 flex justify-end">
                        <button
                            onClick={saveGrades}
                            disabled={saving}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {saving ? t('saving_label') : t('save_grades')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function Results({ modules, class_ranking, specializations = [], filters = {} }) {
    const { t } = useLanguage();
    const [rankingExpanded, setRankingExpanded] = useState(false);

    const selectedSpec = filters.specialization_id ?? '';

    function handleSpecChange(id) {
        router.get(route('admin.results.index'), { specialization_id: id || undefined }, {
            preserveState: true,
            replace: true,
        });
    }

    const publishedCount = modules.filter((m) => m.is_published).length;
    const totalModules   = modules.length;
    const totalStudents  = class_ranking.length;

    const selectedSpecName = specializations.find((s) => String(s.id) === String(selectedSpec))?.name ?? null;

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{t('nav_academic_results')}</h2>}>
            <Head title="Results" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* ── Specialization filter ── */}
                    {specializations.length > 0 && (
                        <div className="rounded-xl bg-white px-5 py-4 shadow-sm">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                {t('specialization')}
                            </p>
                            <SpecializationSelector
                                specializations={specializations}
                                selected={selectedSpec}
                                onChange={handleSpecChange}
                                t={t}
                            />
                        </div>
                    )}

                    {/* ── Summary stats ── */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[
                            { label: `Total ${t('nav_modules')}`, value: totalModules, color: 'bg-indigo-50 text-indigo-800' },
                            { label: t('published_badge'),     value: publishedCount, color: 'bg-emerald-50 text-emerald-800' },
                            { label: t('status_pending'),       value: totalModules - publishedCount, color: 'bg-amber-50 text-amber-800' },
                            { label: `${t('students_count')} Ranked`, value: totalStudents, color: 'bg-gray-50 text-gray-700' },
                        ].map((s) => (
                            <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
                                <p className="text-xs font-semibold uppercase tracking-wide opacity-60">{s.label}</p>
                                <p className="mt-1 text-3xl font-extrabold">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── Module cards ── */}
                    <div>
                        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                            {t('nav_modules')}
                            {selectedSpecName && (
                                <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 normal-case tracking-normal">
                                    {selectedSpecName}
                                </span>
                            )}
                        </h2>
                        <div className="space-y-4">
                            {modules.length === 0 ? (
                                <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
                                    {t('no_data')}
                                </div>
                            ) : (
                                modules.map((module) => <ModuleCard key={module.id} module={module} t={t} />)
                            )}
                        </div>
                    </div>

                    {/* ── Class Ranking ── */}
                    {class_ranking.length > 0 && (
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            <button
                                onClick={() => setRankingExpanded((v) => !v)}
                                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50"
                            >
                                <div>
                                    <p className="font-semibold text-gray-900">{t('final_ranking')}</p>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        {class_ranking.length} {t('ranked_by_published')}
                                    </p>
                                </div>
                                <span className="text-gray-400">{rankingExpanded ? '▲' : '▼'}</span>
                            </button>

                            {rankingExpanded && (
                                <div className="border-t border-gray-100">
                                    <ul className="divide-y divide-gray-50">
                                        {class_ranking.map((s, i) => {
                                            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                                            return (
                                                <li key={s.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50">
                                                    <div className="w-8 shrink-0 text-center">
                                                        {medal
                                                            ? <span className="text-lg">{medal}</span>
                                                            : <span className="text-sm font-bold text-gray-400">{i + 1}</span>
                                                        }
                                                    </div>
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                                        {s.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{s.name}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-base font-extrabold ${
                                                            s.average >= 16 ? 'text-emerald-600'
                                                            : s.average >= 10 ? 'text-indigo-700'
                                                            : 'text-red-500'
                                                        }`}>
                                                            {s.average.toFixed(2)}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400">/ 20</p>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
