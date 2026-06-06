import StudentLayout from '@/Layouts/StudentLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useLanguage } from '@/i18n/LanguageContext';

function InfoRow({ label, value, missing }) {
    return (
        <div className="flex gap-2 text-sm border-b border-gray-50 py-1.5">
            <span className="w-36 shrink-0 font-semibold text-gray-500">{label}</span>
            <span className={value ? 'text-gray-800' : 'italic text-gray-300'}>{value || missing || '—'}</span>
        </div>
    );
}

function Timeline({ status }) {
    const { t } = useLanguage();
    const STATUS = {
        pending:    { dot: 'bg-amber-400',    step: 0 },
        processing: { dot: 'bg-blue-500',     step: 1 },
        ready:      { dot: 'bg-emerald-500',  step: 2 },
    };
    const steps = [
        { key: 'pending',    label: t('timeline_submitted') },
        { key: 'processing', label: t('timeline_processing') },
        { key: 'ready',      label: t('timeline_ready') },
    ];
    const current = STATUS[status]?.step ?? 0;
    return (
        <div className="flex items-start">
            {steps.map((s, i) => (
                <div key={s.key} className="flex flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                        {i > 0 && <div className={`h-0.5 flex-1 ${i <= current ? 'bg-indigo-500' : 'bg-gray-200'}`} />}
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            i < current  ? 'bg-indigo-600 text-white' :
                            i === current ? `${STATUS[status].dot} text-white` :
                                           'bg-gray-200 text-gray-400'
                        }`}>
                            {i < current ? '✓' : i + 1}
                        </div>
                        {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${i < current ? 'bg-indigo-500' : 'bg-gray-200'}`} />}
                    </div>
                    <p className={`mt-1.5 text-center text-[11px] font-medium ${
                        i === current ? 'text-indigo-600' : i < current ? 'text-gray-600' : 'text-gray-400'
                    }`}>{s.label}</p>
                </div>
            ))}
        </div>
    );
}

/* ── Company update form ─────────────────────────────────────────────── */
function CompanyForm({ req }) {
    const { t } = useLanguage();
    const { data, setData, patch, processing, errors } = useForm({
        company_name:    req.company_name    ?? '',
        company_address: req.company_address ?? '',
    });

    const F = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';

    function submit(e) {
        e.preventDefault();
        patch(route('student.stage-folder.update-company', req.id));
    }

    const hasCompany = req.company_name || req.company_address;

    return (
        <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-base">🏢</span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">
                        {hasCompany ? t('company_info') : t('company_found')}
                    </p>
                    <p className="text-xs text-indigo-500">
                        {hasCompany ? t('company_update_hint2') : t('company_update_hint')}
                    </p>
                </div>
            </div>

            {hasCompany && (
                <div className="rounded-lg bg-white px-3 py-2 text-sm space-y-0.5">
                    <InfoRow label={t('company_name')}    value={req.company_name} />
                    <InfoRow label={t('company_address')} value={req.company_address} />
                </div>
            )}

            <form onSubmit={submit} className="space-y-2">
                <input type="text" value={data.company_name}
                    onChange={e => setData('company_name', e.target.value)}
                    placeholder={t('company_name')}
                    className={F} />
                <input type="text" value={data.company_address}
                    onChange={e => setData('company_address', e.target.value)}
                    placeholder={t('company_address')}
                    className={F} />
                <div className="flex justify-end">
                    <button type="submit" disabled={processing}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                        {processing ? t('submitting') : hasCompany ? t('update_company') : t('add_company')}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ── Page ────────────────────────────────────────────────────────────── */
export default function StageFolder({ student_info, folderRequest }) {
    const { t } = useLanguage();
    const { flash } = usePage().props;
    const F = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';

    const { data, setData, post, processing, errors, reset } = useForm({
        phone:            '',
        internship_start: '',
        duration_weeks:   '',
        notes:            '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('student.stage-folder.store'), { onSuccess: () => reset() });
    }

    function cancel() {
        if (!window.confirm(t('cancel_request') + '?')) return;
        router.delete(route('student.stage-folder.cancel', folderRequest.id));
    }

    return (
        <StudentLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{t('stage_folder_title')}</h2>}>
            <Head title="Dossier de Stage" />

            <div className="py-10">
                <div className="mx-auto max-w-2xl space-y-5 px-4 sm:px-6 lg:px-8">

                    {/* Flash */}
                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {flash.success}
                        </div>
                    )}

                    {/* Student identity (always visible) */}
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4 space-y-1.5">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-400">{t('your_info')}</p>
                        <InfoRow label={t('name_surname')}   value={student_info.name} />
                        <InfoRow label={t('email')}          value={student_info.email} />
                        <InfoRow label={t('field_of_study')} value={student_info.specialization} />
                        <InfoRow label={t('level')}          value={student_info.semester} />
                    </div>

                    {folderRequest ? (
                        /* ── Existing request ── */
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            <div className="bg-indigo-600 px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">{t('request_number')}{folderRequest.id} · {folderRequest.created_at}</p>
                                <p className="mt-0.5 text-base font-bold text-white">{t('stage_technical')}</p>
                            </div>

                            <div className="space-y-5 px-6 py-5">
                                <Timeline status={folderRequest.status} />

                                {/* Step 1 details — what they submitted */}
                                <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{t('step1_label')}</p>
                                    <div className="rounded-lg bg-gray-50 px-4 py-2 space-y-0.5">
                                        <InfoRow label={t('phone')}         value={folderRequest.phone} />
                                        <InfoRow label={t('desired_start')} value={folderRequest.internship_start} />
                                        <InfoRow label={t('duration_weeks')} value={folderRequest.duration_weeks ? `${folderRequest.duration_weeks} semaines` : null} />
                                        {folderRequest.notes && <InfoRow label={t('remarks')} value={folderRequest.notes} />}
                                    </div>
                                </div>

                                {/* Step 2 — company details (editable at any time) */}
                                <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{t('step2_label')}</p>
                                    <CompanyForm req={folderRequest} />
                                </div>

                                {/* Admin note */}
                                {folderRequest.admin_note && (
                                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">{t('admin_note')}</p>
                                        <p className="mt-1 text-sm text-blue-800">{folderRequest.admin_note}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-1">
                                    {folderRequest.status === 'ready' && folderRequest.has_file && (
                                        <a href={route('student.stage-folder.download', folderRequest.id)}
                                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            {t('download_folder')}
                                        </a>
                                    )}
                                    {folderRequest.status === 'pending' && (
                                        <button onClick={cancel}
                                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
                                            {t('cancel_request')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── Initial request form — step 1 only ── */
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h3 className="text-base font-semibold text-gray-900">{t('request_title')}</h3>
                                <p className="mt-0.5 text-xs text-gray-400">{t('request_subtitle')}</p>
                            </div>

                            <form onSubmit={submit} className="space-y-4 px-6 py-5">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        {t('phone')} <span className="text-red-500">*</span>
                                    </label>
                                    <input type="tel" value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        placeholder="ex: 06 12 34 56 78" className={F} />
                                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            {t('desired_start')} <span className="font-normal text-gray-400">{t('optional')}</span>
                                        </label>
                                        <input type="date" value={data.internship_start}
                                            onChange={e => setData('internship_start', e.target.value)}
                                            className={F} />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            {t('duration_weeks')} <span className="font-normal text-gray-400">{t('optional')}</span>
                                        </label>
                                        <input type="number" min="1" max="52" value={data.duration_weeks}
                                            onChange={e => setData('duration_weeks', e.target.value)}
                                            placeholder="ex: 8" className={F} />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        {t('remarks')} <span className="font-normal text-gray-400">{t('optional')}</span>
                                    </label>
                                    <textarea rows={2} value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        placeholder="Informations supplémentaires…" className={F} />
                                </div>

                                <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-600">
                                    {t('step2_hint')}
                                </div>

                                <div className="flex justify-end pt-1">
                                    <button type="submit" disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                                        {processing ? t('submitting') : t('submit_request')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
