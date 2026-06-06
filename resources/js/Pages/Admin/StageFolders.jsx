import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

function StatusBadge({ status }) {
    const { t } = useLanguage();
    const STATUS = {
        pending:    { label: t('status_pending'),    color: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-400' },
        processing: { label: t('status_processing'), color: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500' },
        ready:      { label: t('status_ready'),      color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    };
    const s = STATUS[status] ?? STATUS.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex gap-2 text-sm border-b border-gray-50 py-1.5">
            <span className="w-36 shrink-0 font-semibold text-gray-500">{label}</span>
            <span className="text-gray-800">{value || <span className="italic text-gray-300">—</span>}</span>
        </div>
    );
}

/* ── Side drawer ─────────────────────────────────────────────────────── */
function RequestDrawer({ req, onClose }) {
    const { t } = useLanguage();
    const [tab, setTab] = useState('info');

    const statusForm = useForm({ status: req.status, admin_note: req.admin_note ?? '' });
    const uploadForm = useForm({ file: null });

    function saveStatus(e) {
        e.preventDefault();
        statusForm.patch(route('admin.stage-folders.status', req.id), { preserveScroll: true });
    }

    function uploadFile(e) {
        e.preventDefault();
        uploadForm.post(route('admin.stage-folders.upload', req.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    function deleteReq() {
        if (!window.confirm(t('delete_request') + '?')) return;
        router.delete(route('admin.stage-folders.destroy', req.id), { onSuccess: onClose });
    }

    const F = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
            <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('request_number')}{req.id} · {req.created_at}</p>
                        <h3 className="mt-0.5 text-lg font-bold text-gray-900">{req.student.name}</h3>
                        <div className="mt-1"><StatusBadge status={req.status} /></div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    {[['info', t('request_info')], ['status', t('update_status')], ['upload', t('upload_tab')]].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition ${
                                tab === key
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}>{label}</button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                    {/* ── Info tab ── */}
                    {tab === 'info' && (
                        <>
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">{t('student_identity')}</p>
                                <div className="rounded-lg bg-indigo-50 px-4 py-2">
                                    <InfoRow label={t('name_surname')}   value={req.student.name} />
                                    <InfoRow label={t('email')}          value={req.student.email} />
                                    <InfoRow label={t('field_of_study')} value={req.student.specialization} />
                                    <InfoRow label={t('level')}          value={req.student.semester} />
                                    <InfoRow label={t('phone')}          value={req.phone} />
                                </div>
                            </div>
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{t('stage_details')}</p>
                                <div className="rounded-lg bg-gray-50 px-4 py-2">
                                    <InfoRow label={t('company_name')}    value={req.company_name} />
                                    <InfoRow label={t('company_address')} value={req.company_address} />
                                    <InfoRow label={t('desired_start')}   value={req.internship_start} />
                                    <InfoRow label={t('duration_weeks')}  value={req.duration_weeks ? `${req.duration_weeks} semaines` : null} />
                                    {req.notes && <InfoRow label={t('remarks')} value={req.notes} />}
                                </div>
                            </div>
                            {req.admin_note && (
                                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                                    <p className="text-xs font-semibold text-blue-500">{t('admin_note')}</p>
                                    <p className="mt-1 text-sm text-blue-800">{req.admin_note}</p>
                                </div>
                            )}
                            {req.has_file && (
                                <a href={route('admin.stage-folders.download', req.id)}
                                    className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    {req.file_name}
                                </a>
                            )}
                            <button onClick={deleteReq}
                                className="w-full rounded-lg border border-red-200 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
                                {t('delete_request')}
                            </button>
                        </>
                    )}

                    {/* ── Status tab ── */}
                    {tab === 'status' && (
                        <form onSubmit={saveStatus} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('status')}</label>
                                <select value={statusForm.data.status}
                                    onChange={e => statusForm.setData('status', e.target.value)}
                                    className={F}>
                                    <option value="pending">{t('status_pending')}</option>
                                    <option value="processing">{t('status_processing')}</option>
                                    <option value="ready">{t('status_ready')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    {t('note_for_student')} <span className="font-normal text-gray-400">{t('optional')}</span>
                                </label>
                                <textarea rows={4} value={statusForm.data.admin_note}
                                    onChange={e => statusForm.setData('admin_note', e.target.value)}
                                    placeholder={t('note_placeholder')}
                                    className={F} />
                            </div>
                            <button type="submit" disabled={statusForm.processing}
                                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                                {statusForm.processing ? t('submitting') : t('save')}
                            </button>
                        </form>
                    )}

                    {/* ── Upload tab ── */}
                    {tab === 'upload' && (
                        <form onSubmit={uploadFile} className="space-y-4">
                            <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
                                <svg className="mx-auto mb-2 h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                                <p className="text-sm font-medium text-gray-600">{t('upload_hint')}</p>
                                <p className="mt-0.5 text-xs text-gray-400">{t('upload_formats')}</p>
                                <input type="file" accept=".pdf,.doc,.docx,.zip"
                                    onChange={e => uploadForm.setData('file', e.target.files[0])}
                                    className="mt-3 block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-indigo-700 hover:file:bg-indigo-100" />
                                {uploadForm.errors.file && <p className="mt-1 text-xs text-red-500">{uploadForm.errors.file}</p>}
                            </div>
                            {req.has_file && (
                                <p className="text-xs text-amber-600">⚠ {t('upload_replace_warning').replace('{name}', req.file_name)}</p>
                            )}
                            <button type="submit" disabled={uploadForm.processing || !uploadForm.data.file}
                                className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                                {uploadForm.processing ? t('submitting') : t('upload_btn')}
                            </button>
                            <p className="text-center text-xs text-gray-400">{t('upload_auto_note')}</p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Main page ───────────────────────────────────────────────────────── */
export default function StageFolders({ requests, counts }) {
    const { t } = useLanguage();
    const { flash } = usePage().props;
    const [filter, setFilter] = useState('all');
    const [selectedId, setSelectedId] = useState(null);

    const visible = filter === 'all' ? requests : requests.filter(r => r.status === filter);
    const drawerReq = selectedId ? (requests.find(r => r.id === selectedId) ?? null) : null;

    return (
        <AdminLayout header={
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold leading-tight text-gray-800">{t('stage_folders_title')}</h2>
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">{counts.pending} {t('pending_label')}</span>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{counts.processing} {t('processing_label')}</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{counts.ready} {t('ready_label')}</span>
                </div>
            </div>
        }>
            <Head title="Dossiers de Stage" />

            {drawerReq && <RequestDrawer req={drawerReq} onClose={() => setSelectedId(null)} />}

            <div className="py-10">
                <div className="mx-auto max-w-5xl space-y-5 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {flash.success}
                        </div>
                    )}

                    {/* Filter tabs */}
                    <div className="flex gap-2">
                        {[
                            ['all',        `${t('all')} (${requests.length})`],
                            ['pending',    `${t('status_pending')} (${counts.pending})`],
                            ['processing', `${t('status_processing')} (${counts.processing})`],
                            ['ready',      `${t('status_ready')} (${counts.ready})`],
                        ].map(([key, label]) => (
                            <button key={key} onClick={() => setFilter(key)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                    filter === key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 shadow-sm hover:bg-gray-50'
                                }`}>{label}</button>
                        ))}
                    </div>

                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        {visible.length === 0 ? (
                            <div className="py-16 text-center text-sm text-gray-400">{t('no_requests')}</div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('student')}</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('field_level')}</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('company')}</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('submitted_on')}</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">{t('status')}</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">{t('file')}</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {visible.map(req => (
                                        <tr key={req.id} className="cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => setSelectedId(req.id)}>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                                        {req.student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{req.student.name}</p>
                                                        <p className="text-xs text-gray-400">{req.student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-xs font-medium text-gray-700">{req.student.specialization || '—'}</p>
                                                <p className="text-xs text-gray-400">{req.student.semester || '—'}</p>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                {req.company_name || <span className="italic text-gray-300">—</span>}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-500">{req.created_at}</td>
                                            <td className="px-5 py-4 text-center"><StatusBadge status={req.status} /></td>
                                            <td className="px-5 py-4 text-center">
                                                {req.has_file
                                                    ? <span className="text-xs font-semibold text-emerald-600">✓</span>
                                                    : <span className="text-xs text-gray-300">—</span>
                                                }
                                            </td>
                                            <td className="px-5 py-4 text-right text-xs font-medium text-indigo-600">
                                                {t('manage')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
