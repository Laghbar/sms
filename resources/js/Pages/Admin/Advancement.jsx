import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useState } from 'react';

/* ── Helpers ─────────────────────────────────────────────────────────── */
function SemBadge({ name, t }) {
    if (name === 'graduate') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                🎓 {t('graduating_label').replace(' ✓', '')}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1 text-sm font-bold text-white">
            {name}
        </span>
    );
}

function Arrow() {
    return (
        <svg className="h-5 w-5 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
        </svg>
    );
}

/* ── Pending state: waiting for grades ───────────────────────────────── */
function PendingRow({ row, t }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="px-5 py-4 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 w-44 shrink-0">
                    <SemBadge name={row.from} t={t} />
                    <Arrow />
                    <SemBadge name={row.to} t={t} />
                </div>
                <span className="text-xs text-gray-400">{row.total} {t('student')}{row.total !== 1 ? 's' : ''}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('waiting_for')} {row.incomplete_modules.length} {t('teacher')}{row.incomplete_modules.length !== 1 ? 's' : ''} {t('to_submit_grades')}
                </span>
                <button onClick={() => setOpen(!open)}
                    className="ml-auto text-xs text-indigo-500 hover:underline">
                    {open ? t('hide_details') : t('show_details')}
                </button>
            </div>

            {open && (
                <div className="ml-46 rounded-lg border border-amber-100 bg-amber-50 divide-y divide-amber-100">
                    {row.incomplete_modules.map((m, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2 text-xs">
                            <span className="font-medium text-gray-700">{m.name}</span>
                            <span className="text-gray-500">{m.teacher}</span>
                            <span className="rounded-full bg-white border border-amber-200 px-2 py-0.5 text-amber-700 font-semibold">
                                {m.graded}/{m.total} {t('graded_label')}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Ready state: all grades in, show results ────────────────────────── */
function ReadyRow({ row, t }) {
    const isGrad = row.to === 'graduate';
    return (
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
            <div className="flex items-center gap-2 w-44 shrink-0">
                <SemBadge name={row.from} t={t} />
                <Arrow />
                <SemBadge name={row.to} t={t} />
            </div>
            <span className="text-xs text-gray-400 w-24 shrink-0">
                {row.total} {t('student')}{row.total !== 1 ? 's' : ''}
            </span>
            <div className="flex flex-wrap gap-2">
                {row.advancing > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <strong>{row.advancing}</strong> {isGrad ? t('graduating_label') : t('advancing_ok_label')}
                    </span>
                )}
                {row.repeating > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">
                        <strong>{row.repeating}</strong> {t('repeating_label')}
                    </span>
                )}
            </div>
            {row.warn_modules && (
                <span className="ml-auto rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                    ⚠ {row.to} {t('no_modules_semester')}
                </span>
            )}
        </div>
    );
}

/* ── Spec card ───────────────────────────────────────────────────────── */
function SpecCard({ spec, t }) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-5 py-3">
                <span className="rounded bg-indigo-600 px-2 py-0.5 font-mono text-xs font-bold text-white">
                    {spec.code}
                </span>
                <span className="text-sm font-medium text-gray-800">{spec.name}</span>
            </div>
            <div className="divide-y divide-gray-50">
                {spec.rows.map((row, i) =>
                    row.grades_complete
                        ? <ReadyRow key={i} row={row} t={t} />
                        : <PendingRow key={i} row={row} t={t} />
                )}
            </div>
        </div>
    );
}

/* ── Page ────────────────────────────────────────────────────────────── */
export default function Advancement({ preview }) {
    const { flash }               = usePage().props;
    const { t }                   = useLanguage();
    const [confirmed, setConfirmed] = useState(false);
    const { post, processing }    = useForm({});

    function submit(e) {
        e.preventDefault();
        post(route('admin.advancement.advance'), {
            data: { confirmed: '1' },
            onSuccess: () => setConfirmed(false),
        });
    }

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{t('advancement_title')}</h2>}>
            <Head title={t('advancement_title')} />

            <div className="py-10">
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

                    {/* Info */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800 space-y-1">
                        <p className="font-semibold">{t('advancement_how_works')}</p>
                        <ul className="list-inside list-disc space-y-0.5 text-blue-700">
                            <li>{t('advancement_rule1')}</li>
                            <li>{t('advancement_rule2')}</li>
                            <li>{t('advancement_rule3')}</li>
                        </ul>
                    </div>

                    {/* Nothing to do */}
                    {preview.nothing_to_do && (
                        <div className="rounded-xl bg-white px-6 py-12 text-center shadow-sm">
                            <p className="text-2xl mb-2">✅</p>
                            <p className="text-gray-600 font-medium">{t('no_active_students')}</p>
                        </div>
                    )}

                    {/* Waiting banner */}
                    {!preview.nothing_to_do && preview.total_pending > 0 && (
                        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                            <svg className="h-5 w-5 shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-semibold">
                                    {t('waiting_for')} {preview.total_pending} {t('semester')}{preview.total_pending !== 1 ? 's' : ''}
                                </p>
                                <p className="text-amber-700 mt-0.5">
                                    {t('waiting_grades_desc')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Spec cards */}
                    {preview.specs.map((spec) => (
                        <SpecCard key={spec.id} spec={spec} t={t} />
                    ))}

                    {/* Confirm & submit — only when ALL semesters are fully graded */}
                    {preview.ready_to_advance && (
                        <form onSubmit={submit}
                            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                            <h3 className="font-semibold text-gray-900">{t('confirm_advancement')}</h3>
                            <label className="flex cursor-pointer items-start gap-3">
                                <input type="checkbox" checked={confirmed}
                                    onChange={(e) => setConfirmed(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm text-gray-700">
                                    {t('confirm')}:&nbsp;
                                    <strong>{preview.total_advancing}</strong> {t('student')}{preview.total_advancing !== 1 ? 's' : ''} {t('advancing_ok_label')},{' '}
                                    <strong>{preview.total_graduating}</strong> {t('graduating_label')},{' '}
                                    {t('and')} <strong>{preview.total_repeating}</strong> {t('repeating_label')}.
                                </span>
                            </label>
                            <div className="flex justify-end">
                                <button type="submit" disabled={!confirmed || processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 transition">
                                    {processing ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                            </svg>
                                            {t('advancing_progress')}
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                                            </svg>
                                            {t('advance_btn')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </AdminLayout>
    );
}
