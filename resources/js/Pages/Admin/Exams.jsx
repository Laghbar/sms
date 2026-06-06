import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useState } from 'react';

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtSize(bytes) {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function isPast(dateStr) {
    return new Date(dateStr) < new Date().setHours(0, 0, 0, 0);
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

// ─── Timetable upload form ────────────────────────────────────────────────────

function TimetableUploadForm({ onClose, specializations, t }) {
    const { data, setData, post, errors, processing, reset } = useForm({
        title:             '',
        specialization_id: '',
        file:              null,
    });

    function submit(e) {
        e.preventDefault();
        post(route('admin.exams.timetables.store'), {
            forceFormData: true,
            onSuccess: () => { reset(); onClose(); },
        });
    }

    const field = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('title_label')}</label>
                <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className={field}
                    placeholder="e.g. Exam Timetable — Week of 09 June 2026"
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t('specialization')}
                    <span className="ml-1 font-normal text-gray-400">{t('optional')}</span>
                </label>
                <select
                    value={data.specialization_id}
                    onChange={(e) => setData('specialization_id', e.target.value)}
                    className={field}
                >
                    <option value="">{t('all_specializations')}</option>
                    {specializations.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                {errors.specialization_id && <p className="mt-1 text-xs text-red-500">{errors.specialization_id}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('file_field_label')}</label>
                <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => setData('file', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="mt-1 text-xs text-gray-400">PDF, image, or Word document — max 20 MB</p>
                {errors.file && <p className="mt-1 text-xs text-red-500">{errors.file}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">{t('cancel')}</button>
                <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {processing ? t('uploading_label') : t('upload_timetable_btn')}
                </button>
            </div>
        </form>
    );
}

// ─── Exam form ────────────────────────────────────────────────────────────────

function ExamForm({ exam, modules, onClose, t }) {
    const isEdit = !!exam;
    const { data, setData, post, put, errors, processing, reset } = useForm({
        module_id:   exam?.module_id   ? String(exam.module_id) : '',
        title:       exam?.title       ?? '',
        description: exam?.description ?? '',
        exam_date:   exam?.exam_date   ?? '',
        start_time:  exam?.start_time  ? exam.start_time.slice(0, 5) : '',
        end_time:    exam?.end_time    ? exam.end_time.slice(0, 5)   : '',
        location:    exam?.location    ?? '',
    });

    function submit(e) {
        e.preventDefault();
        const opts = { onSuccess: () => { reset(); onClose(); } };
        isEdit ? put(route('admin.exams.update', exam.id), opts)
               : post(route('admin.exams.store'), opts);
    }

    const field = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';
    const err   = (k) => errors[k] && <p className="mt-1 text-xs text-red-500">{errors[k]}</p>;

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('col_module')}</label>
                <select value={data.module_id} onChange={(e) => setData('module_id', e.target.value)} className={field}>
                    <option value="">{t('select_module_ph')}</option>
                    {modules.map((m) => (
                        <option key={m.id} value={m.id}>S{m.semester} — {m.name} ({m.code})</option>
                    ))}
                </select>
                {err('module_id')}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('exam_title_label')}</label>
                <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className={field} placeholder="e.g. Final Exam — Session 1" />
                {err('title')}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('description_label')} <span className="font-normal text-gray-400">{t('optional')}</span></label>
                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} className={field} placeholder="Instructions, allowed materials, format…" />
                {err('description')}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('start_date')}</label>
                <input type="date" value={data.exam_date} onChange={(e) => setData('exam_date', e.target.value)} className={field} />
                {err('exam_date')}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('start_time_label')} <span className="font-normal text-gray-400">{t('optional')}</span></label>
                    <input type="time" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} className={field} />
                    {err('start_time')}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('end_time_label')} <span className="font-normal text-gray-400">{t('optional')}</span></label>
                    <input type="time" value={data.end_time} onChange={(e) => setData('end_time', e.target.value)} className={field} />
                    {err('end_time')}
                </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('location_label')} <span className="font-normal text-gray-400">{t('optional')}</span></label>
                <input type="text" value={data.location} onChange={(e) => setData('location', e.target.value)} className={field} placeholder="e.g. Amphitheatre A" />
                {err('location')}
            </div>

            {!isEdit && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-700">
                    {t('exam_notify_hint')}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">{t('cancel')}</button>
                <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {processing ? t('saving_label') : isEdit ? t('update_exam_btn') : t('announce_exam')}
                </button>
            </div>
        </form>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Exams({ exams, modules, timetables, specializations }) {
    const { flash } = usePage().props;
    const { t } = useLanguage();

    const [creating, setCreating]           = useState(false);
    const [editing, setEditing]             = useState(null);
    const [deletingId, setDeletingId]       = useState(null);
    const [uploadingTimetable, setUploadingTimetable] = useState(false);
    const [deletingTimetableId, setDeletingTimetableId] = useState(null);

    function confirmDelete(id) {
        router.delete(route('admin.exams.destroy', id), { onFinish: () => setDeletingId(null) });
    }

    function confirmDeleteTimetable(id) {
        router.delete(route('admin.exams.timetables.destroy', id), {
            onFinish: () => setDeletingTimetableId(null),
        });
    }

    const upcoming = exams.filter((e) => !isPast(e.exam_date));
    const past     = exams.filter((e) =>  isPast(e.exam_date));

    return (
        <AdminLayout header={
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold leading-tight text-gray-800">{t('exams_title')}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setUploadingTimetable(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {t('upload_timetable_exam')}
                    </button>
                    <button
                        onClick={() => setCreating(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('announce_exam')}
                    </button>
                </div>
            </div>
        }>
            <Head title={t('exams_title')} />

            {/* Modals */}
            <Modal open={uploadingTimetable} onClose={() => setUploadingTimetable(false)} title={t('upload_exam_timetable')}>
                <TimetableUploadForm onClose={() => setUploadingTimetable(false)} specializations={specializations} t={t} />
            </Modal>

            <Modal open={!!deletingTimetableId} onClose={() => setDeletingTimetableId(null)} title={t('delete_timetable_title')}>
                <p className="mb-6 text-sm text-gray-600">{t('delete_timetable_confirm')}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setDeletingTimetableId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">{t('cancel')}</button>
                    <button onClick={() => confirmDeleteTimetable(deletingTimetableId)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">{t('delete')}</button>
                </div>
            </Modal>

            <Modal open={creating} onClose={() => setCreating(false)} title={t('announce_new_exam')}>
                <ExamForm exam={null} modules={modules} onClose={() => setCreating(false)} t={t} />
            </Modal>
            <Modal open={!!editing} onClose={() => setEditing(null)} title={t('edit_exam')}>
                {editing && <ExamForm exam={editing} modules={modules} onClose={() => setEditing(null)} t={t} />}
            </Modal>
            <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title={t('delete_exam_title')}>
                <p className="mb-6 text-sm text-gray-600">{t('delete_exam_confirm')}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setDeletingId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">{t('cancel')}</button>
                    <button onClick={() => confirmDelete(deletingId)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">{t('delete')}</button>
                </div>
            </Modal>

            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {flash.success}
                        </div>
                    )}

                    {/* ── Timetable files ──────────────────────────────────────── */}
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-700">
                                {t('exam_timetable_files')}
                                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                    {timetables.length}
                                </span>
                            </h3>
                            <button
                                onClick={() => setUploadingTimetable(true)}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                            >
                                {t('upload_new_label')}
                            </button>
                        </div>

                        {timetables.length === 0 ? (
                            <div
                                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-white py-10 text-center transition hover:border-indigo-300 hover:bg-indigo-50/30"
                                onClick={() => setUploadingTimetable(true)}
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                                    <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{t('upload_exam_timetable')}</p>
                                    <p className="text-xs text-gray-400">PDF, image, or Word — {t('desc_schedules')}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('title_label')}</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('specialization')}</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('file_field_label')}</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('uploaded_col')}</th>
                                            <th className="px-5 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {timetables.map((t_item) => (
                                            <tr key={t_item.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
                                                            <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{t_item.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {t_item.specialization ? (
                                                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                                                            {t_item.specialization}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">{t('all')}</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="max-w-[160px] truncate text-sm text-gray-600">{t_item.file_name}</p>
                                                    <p className="text-xs text-gray-400">{fmtSize(t_item.file_size)}</p>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-500">{fmtDate(t_item.created_at)}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <a
                                                            href={t_item.download_url}
                                                            className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                                                        >
                                                            {t('download')}
                                                        </a>
                                                        <button
                                                            onClick={() => setDeletingTimetableId(t_item.id)}
                                                            className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                                                        >
                                                            {t('delete')}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* ── Individual exams ─────────────────────────────────────── */}
                    {exams.length === 0 && (
                        <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
                            {t('no_exams_yet')}
                        </div>
                    )}

                    {upcoming.length > 0 && (
                        <section>
                            <h3 className="mb-3 text-sm font-semibold text-gray-600">{t('upcoming_exams')}</h3>
                            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('col_module')}</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('title_label')}</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('start_date')}</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('starts_at_label')}</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('location_label')}</th>
                                            <th className="px-5 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {upcoming.map((ex) => (
                                            <tr key={ex.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-medium text-gray-900">{ex.module?.name}</p>
                                                    <p className="text-xs font-mono text-gray-400">{ex.module?.code}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="text-sm text-gray-800">{ex.title}</p>
                                                    {ex.description && <p className="mt-0.5 max-w-xs truncate text-xs text-gray-400">{ex.description}</p>}
                                                </td>
                                                <td className="px-5 py-4 text-sm font-medium text-gray-800">{fmtDate(ex.exam_date)}</td>
                                                <td className="px-5 py-4 font-mono text-sm text-gray-600">
                                                    {ex.start_time ? ex.start_time.slice(0, 5) : '—'}
                                                    {ex.end_time ? ` – ${ex.end_time.slice(0, 5)}` : ''}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{ex.location ?? '—'}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => setEditing(ex)} className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50">{t('edit')}</button>
                                                        <button onClick={() => setDeletingId(ex.id)} className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50">{t('delete')}</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {past.length > 0 && (
                        <section>
                            <h3 className="mb-3 text-sm font-semibold text-gray-400">{t('past_exams')}</h3>
                            <div className="overflow-hidden rounded-xl bg-white opacity-60 shadow-sm">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{t('col_module')}</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{t('title_label')}</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{t('start_date')}</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{t('location_label')}</th>
                                            <th className="px-5 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {past.map((ex) => (
                                            <tr key={ex.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-4">
                                                    <p className="text-sm text-gray-500">{ex.module?.name}</p>
                                                    <p className="text-xs font-mono text-gray-400">{ex.module?.code}</p>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-500 line-through">{ex.title}</td>
                                                <td className="px-5 py-4 text-sm text-gray-400">{fmtDate(ex.exam_date)}</td>
                                                <td className="px-5 py-4 text-sm text-gray-400">{ex.location ?? '—'}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <button onClick={() => setDeletingId(ex.id)} className="rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-50">{t('delete')}</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
