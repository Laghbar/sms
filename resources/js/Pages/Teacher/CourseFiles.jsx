import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

function formatSize(bytes) {
    if (bytes < 1024)        return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isDeadlinePassed(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));
}

function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="mb-5 text-lg font-semibold text-gray-900">{title}</h3>
                {children}
            </div>
        </div>
    );
}

function UploadModal({ modules, onClose, t }) {
    const { data, setData, post, errors, processing, reset } = useForm({
        module_id:   '',
        type:        '',
        title:       '',
        description: '',
        due_date:    '',
        file:        null,
    });

    function submit(e) {
        e.preventDefault();
        post(route('teacher.course-files.store'), {
            forceFormData: true,
            onSuccess: () => { reset(); onClose(); },
        });
    }

    const field  = 'rounded-lg border border-gray-300 w-full px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';
    const errCls = 'mt-1 text-xs text-red-500';

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('col_module')}</label>
                    <select value={data.module_id} onChange={(e) => setData('module_id', e.target.value)} className={field}>
                        <option value="">{t('select_ph')}</option>
                        {modules.map((m) => (
                            <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                        ))}
                    </select>
                    {errors.module_id && <p className={errCls}>{errors.module_id}</p>}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('type_label')}</label>
                    <select value={data.type} onChange={(e) => setData('type', e.target.value)} className={field}>
                        <option value="">{t('select_ph')}</option>
                        <option value="cours">Cours</option>
                        <option value="td">TD</option>
                        <option value="tp">TP</option>
                    </select>
                    {errors.type && <p className={errCls}>{errors.type}</p>}
                </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('title_label')}</label>
                <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className={field}
                    placeholder="e.g. Chapitre 1 – Introduction"
                />
                {errors.title && <p className={errCls}>{errors.title}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t('description_label')} <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className={field}
                    rows={2}
                    placeholder="Brief description…"
                />
                {errors.description && <p className={errCls}>{errors.description}</p>}
            </div>

            {/* Due date — only shown for TP type */}
            {data.type === 'tp' && (
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t('submission_deadline')}
                        <span className="ml-1 font-normal text-gray-400">{t('deadline_students_hint')}</span>
                    </label>
                    <input
                        type="date"
                        value={data.due_date}
                        onChange={(e) => setData('due_date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={field}
                    />
                    {errors.due_date && <p className={errCls}>{errors.due_date}</p>}
                </div>
            )}

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('file_field_label')}</label>
                <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) => setData('file', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="mt-1 text-xs text-gray-400">{t('file_formats_course')}</p>
                {errors.file && <p className={errCls}>{errors.file}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                    {t('cancel')}
                </button>
                <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {processing ? t('uploading_label') : t('upload_file_btn')}
                </button>
            </div>
        </form>
    );
}

export default function CourseFiles({ files, modules, filters }) {
    const { t } = useLanguage();
    const { flash } = usePage().props;
    const [uploading, setUploading]   = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [moduleFilter, setModuleFilter] = useState(filters.module_id ?? '');
    const [typeFilter, setTypeFilter]     = useState(filters.type ?? '');

    const applyFilters = useCallback((module_id, type) => {
        router.get(route('teacher.course-files.index'), {
            module_id: module_id || undefined,
            type:      type      || undefined,
        }, { preserveState: true, replace: true });
    }, []);

    function handleModuleFilter(e) { const v = e.target.value; setModuleFilter(v); applyFilters(v, typeFilter); }
    function handleTypeFilter(e)   { const v = e.target.value; setTypeFilter(v);   applyFilters(moduleFilter, v); }

    function confirmDelete(id) {
        router.delete(route('teacher.course-files.destroy', id), { onFinish: () => setDeletingId(null) });
    }

    const grouped = { cours: [], td: [], tp: [] };
    files.forEach((f) => grouped[f.type]?.push(f));

    const SECTIONS = [
        { key: 'cours', label: 'Cours' },
        { key: 'td',    label: 'TD – Travaux Dirigés' },
        { key: 'tp',    label: 'TP – Travaux Pratiques' },
    ];

    return (
        <TeacherLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">{t('nav_course_files_teacher')}</h2>
                    <button
                        onClick={() => setUploading(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {t('upload')}
                    </button>
                </div>
            }
        >
            <Head title={t('nav_course_files_teacher')} />

            <Modal open={uploading} onClose={() => setUploading(false)} title={t('upload_course_file')}>
                <UploadModal modules={modules} onClose={() => setUploading(false)} t={t} />
            </Modal>

            <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title={t('delete_file_title')}>
                <p className="mb-6 text-sm text-gray-600">
                    {t('delete_file_confirm')}
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setDeletingId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                        {t('cancel')}
                    </button>
                    <button onClick={() => confirmDelete(deletingId)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                        {t('delete')}
                    </button>
                </div>
            </Modal>

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {flash.success}
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <select value={moduleFilter} onChange={handleModuleFilter} className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400">
                            <option value="">{t('all_modules_filter')}</option>
                            {modules.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
                        </select>
                        <select value={typeFilter} onChange={handleTypeFilter} className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400">
                            <option value="">{t('all_types_filter')}</option>
                            <option value="cours">Cours</option>
                            <option value="td">TD</option>
                            <option value="tp">TP</option>
                        </select>
                        {(moduleFilter || typeFilter) && (
                            <button onClick={() => { setModuleFilter(''); setTypeFilter(''); applyFilters('', ''); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50">
                                {t('clear')}
                            </button>
                        )}
                        <span className="ms-auto text-sm text-gray-400">{files.length} file{files.length !== 1 ? 's' : ''}</span>
                    </div>

                    {files.length === 0 && (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <p className="text-sm text-gray-400">{t('no_files_yet')}</p>
                            <button onClick={() => setUploading(true)} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                {t('upload_first_file')}
                            </button>
                        </div>
                    )}

                    {SECTIONS.map(({ key, label }) => {
                        const items = grouped[key];
                        if (!items?.length) return null;

                        const isTp = key === 'tp';

                        return (
                            <section key={key}>
                                <h3 className="mb-3 text-sm font-semibold text-gray-600">{label}</h3>
                                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('title_label')}</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('col_module')}</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('file_field_label')}</th>
                                                {isTp && <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('deadline_label')}</th>}
                                                {isTp && <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('submissions_col')}</th>}
                                                {!isTp && <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('uploaded_col')}</th>}
                                                <th className="px-6 py-3" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {items.map((f) => {
                                                const past = isDeadlinePassed(f.due_date);
                                                return (
                                                    <tr key={f.id} className="transition-colors hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-medium text-gray-900">{f.title}</p>
                                                            {f.description && <p className="mt-0.5 max-w-xs truncate text-xs text-gray-400">{f.description}</p>}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-700">{f.module.name}</p>
                                                            <p className="font-mono text-xs text-gray-400">{f.module.code}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="max-w-[160px] truncate text-sm text-gray-600">{f.file_name}</p>
                                                            <p className="text-xs text-gray-400">{formatSize(f.file_size)}</p>
                                                        </td>
                                                        {isTp && (
                                                            <td className="px-6 py-4">
                                                                {f.due_date ? (
                                                                    <>
                                                                        <p className="text-sm text-gray-700">{formatDate(f.due_date)}</p>
                                                                        <p className={`text-xs font-medium ${past ? 'text-red-500' : 'text-green-600'}`}>
                                                                            {past ? t('closed_label') : t('open_label')}
                                                                        </p>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400">—</span>
                                                                )}
                                                            </td>
                                                        )}
                                                        {isTp && (
                                                            <td className="px-6 py-4">
                                                                <a
                                                                    href={f.submissions_url}
                                                                    className="text-sm font-medium text-indigo-600 hover:underline"
                                                                >
                                                                    {f.submissions_count} {t('submitted_col')}
                                                                </a>
                                                            </td>
                                                        )}
                                                        {!isTp && (
                                                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(f.created_at)}</td>
                                                        )}
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Link
                                                                    href={f.discussion_url}
                                                                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100"
                                                                    title="View discussion"
                                                                >
                                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                                    </svg>
                                                                    {f.comments_count}
                                                                </Link>
                                                                <a href={f.download_url} className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50">
                                                                    {t('download')}
                                                                </a>
                                                                <button onClick={() => setDeletingId(f.id)} className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50">
                                                                    {t('delete')}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </TeacherLayout>
    );
}
