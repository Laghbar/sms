import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useCallback, useState } from 'react';

function Pagination({ links }) {
    return (
        <div className="flex flex-wrap justify-center gap-1">
            {links.map((link, i) =>
                link.url ? (
                    <Link
                        key={i}
                        href={link.url}
                        className={`rounded px-3 py-1 text-sm ${
                            link.active
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={i}
                        className="rounded border border-gray-200 px-3 py-1 text-sm text-gray-300"
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="mb-5 text-lg font-semibold text-gray-900">{title}</h3>
                {children}
            </div>
        </div>
    );
}

const EMPTY_FORM = { name: '', code: '', coefficient: 1, semester: 1, description: '' };

function ModuleFormModal({ module, onClose }) {
    const isEdit = !!module;
    const { data, setData, post, put, errors, processing, reset } = useForm(
        module
            ? {
                  name: module.name,
                  code: module.code,
                  coefficient: module.coefficient,
                  semester: module.semester,
                  description: module.description ?? '',
              }
            : EMPTY_FORM
    );

    function submit(e) {
        e.preventDefault();
        const opts = { onSuccess: () => { reset(); onClose(); } };
        isEdit
            ? put(route('admin.modules.update', module.id), opts)
            : post(route('admin.modules.store'), opts);
    }

    const field = 'rounded-lg border border-gray-300 w-full px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';
    const errCls = 'mt-1 text-xs text-red-500';

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className={field}
                    placeholder="e.g. Mathematics"
                />
                {errors.name && <p className={errCls}>{errors.name}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Code</label>
                <input
                    type="text"
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                    className={field}
                    placeholder="e.g. MATH101"
                />
                {errors.code && <p className={errCls}>{errors.code}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Semester</label>
                    <select
                        value={data.semester}
                        onChange={(e) => setData('semester', Number(e.target.value))}
                        className={field}
                    >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
                            <option key={s} value={s}>Semester {s}</option>
                        ))}
                    </select>
                    {errors.semester && <p className={errCls}>{errors.semester}</p>}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Coefficient</label>
                    <select
                        value={data.coefficient}
                        onChange={(e) => setData('coefficient', Number(e.target.value))}
                        className={field}
                    >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    {errors.coefficient && <p className={errCls}>{errors.coefficient}</p>}
                </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className={field}
                    rows={3}
                    placeholder="Brief module description…"
                />
                {errors.description && <p className={errCls}>{errors.description}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                    {processing ? 'Saving…' : isEdit ? 'Update Module' : 'Create Module'}
                </button>
            </div>
        </form>
    );
}

export default function Modules({ modules, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const applySearch = useCallback((val) => {
        router.get(route('admin.modules.index'), { search: val || undefined }, {
            preserveState: true,
            replace: true,
        });
    }, []);

    function handleSearch(e) {
        const val = e.target.value;
        setSearch(val);
        applySearch(val);
    }

    function confirmDelete(id) {
        router.delete(route('admin.modules.destroy', id), {
            onFinish: () => setDeletingId(null),
        });
    }

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Modules</h2>
                    <button
                        onClick={() => setCreating(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Module
                    </button>
                </div>
            }
        >
            <Head title="Modules" />

            {/* Create modal */}
            <Modal open={creating} onClose={() => setCreating(false)} title="Create Module">
                <ModuleFormModal module={null} onClose={() => setCreating(false)} />
            </Modal>

            {/* Edit modal */}
            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Module">
                {editing && <ModuleFormModal module={editing} onClose={() => setEditing(null)} />}
            </Modal>

            {/* Delete confirm modal */}
            <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Module">
                <p className="mb-6 text-sm text-gray-600">
                    Are you sure you want to delete this module? All associated schedules and results will also be removed.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setDeletingId(null)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => confirmDelete(deletingId)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </Modal>

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Search bar */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative max-w-sm flex-1">
                            <svg
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name or code…"
                                value={search}
                                onChange={handleSearch}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            />
                        </div>
                        <p className="shrink-0 text-sm text-gray-500">
                            {modules.total} module{modules.total !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Module</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Semester</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Coeff</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Teachers</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Students</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Schedules</th>
                                        <th className="px-6 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {modules.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">
                                                No modules found.
                                            </td>
                                        </tr>
                                    ) : (
                                        modules.data.map((mod) => (
                                            <tr key={mod.id} className="transition-colors hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{mod.name}</div>
                                                    {mod.description && (
                                                        <div className="mt-0.5 max-w-xs truncate text-xs text-gray-400">
                                                            {mod.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono font-medium text-gray-700">
                                                        {mod.code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">S{mod.semester}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{mod.coefficient}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{mod.teachers_count}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{mod.students_count}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{mod.schedules_count}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={route('admin.modules.students', mod.id)}
                                                            className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                                                        >
                                                            Students
                                                        </Link>
                                                        <button
                                                            onClick={() => setEditing(mod)}
                                                            className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingId(mod.id)}
                                                            className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                                                        >
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
