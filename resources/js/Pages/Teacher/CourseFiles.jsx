import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';

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

function UploadModal({ modules, onClose }) {
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
                    <label className="mb-1 block text-sm font-medium text-gray-700">Module</label>
                    <select value={data.module_id} onChange={(e) => setData('module_id', e.target.value)} className={field}>
                        <option value="">Select…</option>
                        {modules.map((m) => (
                            <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                        ))}
                    </select>
                    {errors.module_id && <p className={errCls}>{errors.module_id}</p>}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                    <select value={data.type} onChange={(e) => setData('type', e.target.value)} className={field}>
                        <option value="">Select…</option>
                        <option value="cours">Cours</option>
                        <option value="td">TD</option>
                        <option value="tp">TP</option>
                    </select>
                    {errors.type && <p className={errCls}>{errors.type}</p>}
                </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
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
                    Description <span className="font-normal text-gray-400">(optional)</span>
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
                        Submission Deadline
                        <span className="ml-1 font-normal text-gray-400">(students cannot submit after this date)</span>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">File</label>
                <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) => setData('file', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="mt-1 text-xs text-gray-400">PDF, DOC, DOCX, PPT, PPTX — max 50 MB</p>
                {errors.file && <p className={errCls}>{errors.file}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {processing ? 'Uploading…' : 'Upload File'}
                </button>
            </div>
        </form>
    );
}

export default function CourseFiles({ files, modules, filters }) {
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
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Course Files</h2>
                    <button
                        onClick={() => setUploading(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload File
                    </button>
                </div>
            }
        >
            <Head title="Course Files" />

            <Modal open={uploading} onClose={() => setUploading(false)} title="Upload Course File">
                <UploadModal modules={modules} onClose={() => setUploading(false)} />
            </Modal>

            <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Delete File">
                <p className="mb-6 text-sm text-gray-600">
                    This will permanently delete the file and all student submissions. Are you sure?
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setDeletingId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={() => confirmDelete(deletingId)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                        Delete
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
                            <option value="">All modules</option>
                            {modules.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
                        </select>
                        <select value={typeFilter} onChange={handleTypeFilter} className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400">
                            <option value="">All types</option>
                            <option value="cours">Cours</option>
                            <option value="td">TD</option>
                            <option value="tp">TP</option>
                        </select>
                        {(moduleFilter || typeFilter) && (
                            <button onClick={() => { setModuleFilter(''); setTypeFilter(''); applyFilters('', ''); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50">
                                Clear
                            </button>
                        )}
                        <span className="ms-auto text-sm text-gray-400">{files.length} file{files.length !== 1 ? 's' : ''}</span>
                    </div>

                    {files.length === 0 && (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <p className="text-sm text-gray-400">No files uploaded yet.</p>
                            <button onClick={() => setUploading(true)} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                Upload your first file
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
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Title</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Module</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">File</th>
                                                {isTp && <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Deadline</th>}
                                                {isTp && <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Submissions</th>}
                                                {!isTp && <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Uploaded</th>}
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
                                                                            {past ? 'Closed' : 'Open'}
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
                                                                    {f.submissions_count} submitted
                                                                </a>
                                                            </td>
                                                        )}
                                                        {!isTp && (
                                                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(f.created_at)}</td>
                                                        )}
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <a href={f.download_url} className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50">
                                                                    Download
                                                                </a>
                                                                <button onClick={() => setDeletingId(f.id)} className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50">
                                                                    Delete
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
