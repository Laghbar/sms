import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';

function Pagination({ links }) {
    return (
        <div className="flex flex-wrap justify-center gap-1">
            {links.map((link, i) =>
                link.url ? (
                    <Link key={i} href={link.url}
                        className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span key={i} className="rounded border border-gray-200 px-3 py-1 text-sm text-gray-300"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            )}
        </div>
    );
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

const EMPTY = { name: '', code: '', coefficient: 1, semester: 1, description: '', teacher_id: '', specialization_id: '' };

function ModuleForm({ module, teachers, specializations, onClose }) {
    const isEdit = !!module;
    const { data, setData, post, put, errors, processing } = useForm(
        module
            ? {
                name: module.name, code: module.code,
                coefficient: module.coefficient, semester: module.semester,
                description: module.description ?? '',
                teacher_id: module.teacher_id ?? '',
                specialization_id: module.specialization_id ?? '',
              }
            : EMPTY
    );

    function submit(e) {
        e.preventDefault();
        const opts = { onSuccess: onClose };
        isEdit ? put(route('admin.modules.update', module.id), opts)
               : post(route('admin.modules.store'), opts);
    }

    const field = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';
    const err   = 'mt-1 text-xs text-red-500';

    return (
        <form onSubmit={submit} className="space-y-4">
            {/* Name */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}
                    className={field} placeholder="e.g. Algorithm" />
                {errors.name && <p className={err}>{errors.name}</p>}
            </div>

            {/* Code */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Code</label>
                <input type="text" value={data.code} onChange={(e) => setData('code', e.target.value.toUpperCase())}
                    className={field} placeholder="e.g. GI-ALG-S1" />
                {errors.code && <p className={err}>{errors.code}</p>}
            </div>

            {/* Semester + Coefficient */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Semester</label>
                    <select value={data.semester} onChange={(e) => setData('semester', Number(e.target.value))} className={field}>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
                            <option key={s} value={s}>Semester {s}</option>
                        ))}
                    </select>
                    {errors.semester && <p className={err}>{errors.semester}</p>}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Coefficient</label>
                    <select value={data.coefficient} onChange={(e) => setData('coefficient', Number(e.target.value))} className={field}>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    {errors.coefficient && <p className={err}>{errors.coefficient}</p>}
                </div>
            </div>

            {/* Assigned Teacher */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Assigned Teacher <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <select value={data.teacher_id} onChange={(e) => setData('teacher_id', e.target.value)} className={field}>
                    <option value="">— No teacher assigned —</option>
                    {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                {errors.teacher_id && <p className={err}>{errors.teacher_id}</p>}
            </div>

            {/* Specialization */}
            {specializations.length > 0 && (
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Specialization <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <select value={data.specialization_id} onChange={(e) => setData('specialization_id', e.target.value)} className={field}>
                        <option value="">— None —</option>
                        {specializations.map((s) => (
                            <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                        ))}
                    </select>
                    {errors.specialization_id && <p className={err}>{errors.specialization_id}</p>}
                </div>
            )}

            {/* Description */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)}
                    className={field} rows={3} placeholder="Brief description…" />
                {errors.description && <p className={err}>{errors.description}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" disabled={processing}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {processing ? 'Saving…' : isEdit ? 'Update Module' : 'Create Module'}
                </button>
            </div>
        </form>
    );
}

export default function Modules({ modules, teachers, specializations, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch]   = useState(filters.search ?? '');
    const [creating, setCreating] = useState(false);
    const [editing, setEditing]   = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const applySearch = useCallback((val) => {
        router.get(route('admin.modules.index'), { search: val || undefined }, { preserveState: true, replace: true });
    }, []);

    function handleSearch(e) { const v = e.target.value; setSearch(v); applySearch(v); }

    function confirmDelete(id) {
        router.delete(route('admin.modules.destroy', id), { onFinish: () => setDeletingId(null) });
    }

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Modules</h2>
                    <button onClick={() => setCreating(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Module
                    </button>
                </div>
            }
        >
            <Head title="Modules" />

            <Modal open={creating} onClose={() => setCreating(false)} title="Create Module">
                <ModuleForm module={null} teachers={teachers} specializations={specializations} onClose={() => setCreating(false)} />
            </Modal>

            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Module">
                {editing && <ModuleForm module={editing} teachers={teachers} specializations={specializations} onClose={() => setEditing(null)} />}
            </Modal>

            <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Module">
                <p className="mb-6 text-sm text-gray-600">
                    Are you sure? All schedules, grades and results for this module will also be removed.
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setDeletingId(null)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={() => confirmDelete(deletingId)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
                </div>
            </Modal>

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {flash.success}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                        <div className="relative max-w-sm flex-1">
                            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input type="text" placeholder="Search by name or code…" value={search} onChange={handleSearch}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                        </div>
                        <p className="shrink-0 text-sm text-gray-500">{modules.total} module{modules.total !== 1 ? 's' : ''}</p>
                    </div>

                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Module</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Code</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Teacher</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Specialization</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">S</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Coeff</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Students</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {modules.data.length === 0 ? (
                                        <tr><td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-400">No modules found.</td></tr>
                                    ) : (
                                        modules.data.map((mod) => (
                                            <tr key={mod.id} className="transition-colors hover:bg-gray-50">
                                                <td className="px-5 py-3.5">
                                                    <p className="text-sm font-medium text-gray-900">{mod.name}</p>
                                                    {mod.description && (
                                                        <p className="mt-0.5 max-w-[200px] truncate text-xs text-gray-400">{mod.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">{mod.code}</span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {mod.teacher_name ? (
                                                        <span className="text-sm text-gray-700">{mod.teacher_name}</span>
                                                    ) : (
                                                        <span className="text-xs italic text-gray-300">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {mod.specialization_code ? (
                                                        <span className="rounded bg-indigo-100 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700">
                                                            {mod.specialization_code}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-300">—</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-center text-sm text-gray-600">S{mod.semester}</td>
                                                <td className="px-5 py-3.5 text-center text-sm text-gray-600">{mod.coefficient}</td>
                                                <td className="px-5 py-3.5 text-center text-sm text-gray-600">{mod.students_count}</td>
                                                <td className="px-5 py-3.5 text-center">
                                                    {mod.is_published ? (
                                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Published</span>
                                                    ) : (
                                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-600">Draft</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={route('admin.modules.students', mod.id)}
                                                            className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50">
                                                            Students
                                                        </Link>
                                                        <button onClick={() => setEditing(mod)}
                                                            className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50">
                                                            Edit
                                                        </button>
                                                        <button onClick={() => setDeletingId(mod.id)}
                                                            className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {modules.last_page > 1 && (
                            <div className="border-t border-gray-100 px-6 py-4">
                                <Pagination links={modules.links} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
