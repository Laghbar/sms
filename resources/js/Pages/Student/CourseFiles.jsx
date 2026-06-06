import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

const TYPE_COLORS = {
    cours: 'bg-blue-100 text-blue-700',
    td:    'bg-purple-100 text-purple-700',
    tp:    'bg-amber-100 text-amber-700',
};

function formatSize(bytes) {
    if (bytes < 1024)        return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(str) {
    return new Date(str).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function daysLeft(dateStr) {
    const diff = Math.ceil((new Date(dateStr) - new Date().setHours(0, 0, 0, 0)) / 86400000);
    if (diff < 0)  return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return 'Due today';
    return `${diff}d left`;
}

function TpSubmissionPanel({ file }) {
    const { t } = useLanguage();
    const { data, setData, post, errors, processing, reset } = useForm({ file: null });
    const fileRef = useRef(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    function submitWork(e) {
        e.preventDefault();
        post(file.submit_url, {
            forceFormData: true,
            onSuccess: () => { reset(); if (fileRef.current) fileRef.current.value = ''; },
        });
    }

    function deleteSubmission() {
        router.delete(file.delete_submission_url, {
            onFinish: () => setConfirmDelete(false),
        });
    }

    // Deadline has passed
    if (!file.is_open) {
        return (
            <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                <div className="flex items-center gap-2">
                    {file.submission ? (
                        <>
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {t('submitted_col')}
                            </span>
                            <span className="text-xs text-gray-400">
                                {file.submission.file_name} · {formatDateTime(file.submission.submitted_at)}
                            </span>
                        </>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {t('closed_label')}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    // Deadline is still open
    return (
        <div className="border-t border-amber-100 bg-amber-50 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-amber-700">{t('submissions_col')}</p>
                <span className="text-xs text-amber-600 font-medium">
                    {t('deadline_label')}: {formatDate(file.due_date)} — {daysLeft(file.due_date)}
                </span>
            </div>

            {/* Already submitted */}
            {file.submission && (
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-3 py-2">
                    <div>
                        <p className="text-sm font-medium text-gray-800">{file.submission.file_name}</p>
                        <p className="text-xs text-gray-400">
                            {formatSize(file.submission.file_size)} · {t('submitted_col')} {formatDateTime(file.submission.submitted_at)}
                        </p>
                    </div>
                    {!confirmDelete ? (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="ml-3 shrink-0 text-xs text-red-500 hover:text-red-700"
                        >
                            {t('delete')}
                        </button>
                    ) : (
                        <div className="ml-3 flex items-center gap-2">
                            <span className="text-xs text-gray-500">Sure?</span>
                            <button onClick={deleteSubmission} className="text-xs font-medium text-red-600 hover:text-red-800">{t('confirm')}</button>
                            <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-500 hover:text-gray-700">{t('cancel')}</button>
                        </div>
                    )}
                </div>
            )}

            {/* Upload / re-submit form */}
            <form onSubmit={submitWork} className="flex items-start gap-2">
                <div className="flex-1">
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.zip,.rar,.ppt,.pptx"
                        onChange={(e) => setData('file', e.target.files[0])}
                        className="block w-full text-xs text-gray-500 file:mr-2 file:rounded-lg file:border-0 file:bg-amber-100 file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-amber-700 hover:file:bg-amber-200"
                    />
                    {errors.file && <p className="mt-1 text-xs text-red-500">{errors.file}</p>}
                </div>
                <button
                    type="submit"
                    disabled={processing || !data.file}
                    className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                >
                    {processing ? t('uploading_label') : file.submission ? t('upload') : t('submit_request')}
                </button>
            </form>
        </div>
    );
}

export default function CourseFiles({ files, modules, filters }) {
    const { t } = useLanguage();
    const { flash } = usePage().props;
    const [moduleFilter, setModuleFilter] = useState(filters.module_id ?? '');
    const [typeFilter, setTypeFilter]     = useState(filters.type ?? '');

    const applyFilters = useCallback((module_id, type) => {
        router.get(route('student.course-files.index'), {
            module_id: module_id || undefined,
            type:      type      || undefined,
        }, { preserveState: true, replace: true });
    }, []);

    function handleModuleFilter(e) { const v = e.target.value; setModuleFilter(v); applyFilters(v, typeFilter); }
    function handleTypeFilter(e)   { const v = e.target.value; setTypeFilter(v);   applyFilters(moduleFilter, v); }

    const grouped = { cours: [], td: [], tp: [] };
    files.forEach((f) => grouped[f.type]?.push(f));

    return (
        <StudentLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{t('nav_course_files')}</h2>}>
            <Head title={t('nav_course_files')} />

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
                        </div>
                    )}

                    {[
                        { key: 'cours', label: 'Cours' },
                        { key: 'td',    label: 'TD – Travaux Dirigés' },
                        { key: 'tp',    label: 'TP – Travaux Pratiques' },
                    ].map(({ key, label }) => {
                        const items = grouped[key];
                        if (!items?.length) return null;
                        return (
                            <section key={key}>
                                <h3 className="mb-3 text-sm font-semibold text-gray-600">{label}</h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {items.map((f) => (
                                        <div key={f.id} className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm">
                                            {/* Card body */}
                                            <div className="flex items-start gap-3 p-5">
                                                <span className={`mt-0.5 shrink-0 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wide ${TYPE_COLORS[f.type]}`}>
                                                    {f.type.toUpperCase()}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-900 leading-tight">{f.title}</p>
                                                    <p className="mt-0.5 text-xs font-medium text-indigo-600">
                                                        {f.module.name} <span className="text-gray-400">({f.module.code})</span>
                                                    </p>
                                                    {f.description && (
                                                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{f.description}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Download + discussion footer */}
                                            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3">
                                                <div className="text-xs text-gray-400">
                                                    <p className="truncate max-w-[110px]">{f.file_name}</p>
                                                    <p>{formatSize(f.file_size)}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={f.discussion_url}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                        {f.comments_count}
                                                    </Link>
                                                    <a
                                                        href={f.download_url}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        {t('download')}
                                                    </a>
                                                </div>
                                            </div>

                                            {/* TP submission panel */}
                                            {f.type === 'tp' && f.due_date && (
                                                <TpSubmissionPanel file={f} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </StudentLayout>
    );
}
