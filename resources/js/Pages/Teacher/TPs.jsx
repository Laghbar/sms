import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useCallback, useState } from 'react';

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysLabel(dateStr, isPast) {
    if (isPast) {
        const diff = Math.ceil((new Date().setHours(0,0,0,0) - new Date(dateStr)) / 86400000);
        return { text: diff === 0 ? 'Due today' : `${diff}d overdue`, cls: 'text-red-500 font-medium' };
    }
    const diff = Math.ceil((new Date(dateStr) - new Date().setHours(0,0,0,0)) / 86400000);
    if (diff === 0) return { text: 'Due today', cls: 'text-amber-600 font-medium' };
    return { text: `${diff}d left`, cls: 'text-gray-500' };
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

const EMPTY_FORM = { module_id: '', title: '', description: '', due_date: '', max_grade: 20 };

function TpFormModal({ tp, modules, onClose }) {
    const isEdit = !!tp;
    const { data, setData, post, put, errors, processing, reset } = useForm(
        tp
            ? {
                  module_id:   String(tp.module.id),
                  title:       tp.title,
                  description: tp.description ?? '',
                  due_date:    tp.due_date,
                  max_grade:   tp.max_grade,
              }
            : EMPTY_FORM
    );

    function submit(e) {
        e.preventDefault();
        const opts = { onSuccess: () => { reset(); onClose(); } };
        isEdit
            ? put(route('teacher.tps.update', tp.id), opts)
            : post(route('teacher.tps.store'), opts);
    }

    const field = 'rounded-lg border border-gray-300 w-full px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';
    const errCls = 'mt-1 text-xs text-red-500';

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Module</label>
                <select
                    value={data.module_id}
                    onChange={(e) => setData('module_id', e.target.value)}
                    className={field}
                >
                    <option value="">Select a module…</option>
                    {modules.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name} ({m.code})
                        </option>
                    ))}
                </select>
                {errors.module_id && <p className={errCls}>{errors.module_id}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className={field}
                    placeholder="e.g. TP1 – Introduction to Arrays"
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
                    rows={3}
                    placeholder="Instructions, objectives, resources…"
                />
                {errors.description && <p className={errCls}>{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                        type="date"
                        value={data.due_date}
                        onChange={(e) => setData('due_date', e.target.value)}
                        className={field}
                    />
                    {errors.due_date && <p className={errCls}>{errors.due_date}</p>}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Max Grade</label>
                    <input
                        type="number"
                        value={data.max_grade}
                        onChange={(e) => setData('max_grade', Number(e.target.value))}
                        className={field}
                        min={1}
                        max={100}
                        step={0.5}
                    />
                    {errors.max_grade && <p className={errCls}>{errors.max_grade}</p>}
                </div>
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
                    {processing ? 'Saving…' : isEdit ? 'Update TP' : 'Assign TP'}
                </button>
            </div>
        </form>
    );
}

export default function TPs({ tps, modules, filters }) {
    const [moduleFilter, setModuleFilter] = useState(filters.module_id ?? '');
    const [creating, setCreating]         = useState(false);
    const [editing, setEditing]           = useState(null);
    const [deletingId, setDeletingId]     = useState(null);

    const applyFilter = useCallback((val) => {
        router.get(route('teacher.tps.index'), { module_id: val || undefined }, {
            preserveState: true,
            replace: true,
        });
    }, []);

    function handleModuleFilter(e) {
        const val = e.target.value;
        setModuleFilter(val);
        applyFilter(val);
    }

    function confirmDelete(id) {
        router.delete(route('teacher.tps.destroy', id), {
            onFinish: () => setDeletingId(null),
        });
    }

    const upcoming = tps.filter((t) => !t.is_past);
    const past     = tps.filter((t) => t.is_past);

    return (
        <TeacherLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Practical Work (TPs)</h2>
                    <button
                        onClick={() => setCreating(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Assign TP
                    </button>
                </div>
            }
        >
            <Head title="TPs" />

            <Modal open={creating} onClose={() => setCreating(false)} title="Assign New TP">
                <TpFormModal modules={modules} tp={null} onClose={() => setCreating(false)} />
            </Modal>

            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit TP">
                {editing && <TpFormModal modules={modules} tp={editing} onClose={() => setEditing(null)} />}
            </Modal>

            <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Delete TP">
                <p className="mb-6 text-sm text-gray-600">
                    This will remove the TP for all enrolled students. Are you sure?
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
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* Filter bar */}
                    <div className="flex items-center gap-3">
                        <select
                            value={moduleFilter}
                            onChange={handleModuleFilter}
                            className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        >
                            <option value="">All modules</option>
                            {modules.map((m) => (
                                <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                            ))}
                        </select>
                        {moduleFilter && (
                            <button
                                onClick={() => { setModuleFilter(''); applyFilter(''); }}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
                            >
                                Clear
                            </button>
                        )}
                        <span className="text-sm text-gray-400 ms-auto">
                            {tps.length} TP{tps.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {tps.length === 0 && (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <p className="text-sm text-gray-400">No TPs assigned yet.</p>
                            <button
                                onClick={() => setCreating(true)}
                                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Assign your first TP
                            </button>
                        </div>
                    )}

                    {/* Upcoming / Active TPs */}
                    {upcoming.length > 0 && (
                        <section>
                            <h3 className="mb-3 text-sm font-semibold text-gray-600">Active & Upcoming</h3>
                            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Module</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Due Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Max Grade</th>
                                            <th className="px-6 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {upcoming.map((tp) => {
                                            const dl = daysLabel(tp.due_date, tp.is_past);
                                            return (
                                                <tr key={tp.id} className="transition-colors hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-medium text-gray-900">{tp.title}</p>
                                                        {tp.description && (
                                                            <p className="mt-0.5 max-w-xs truncate text-xs text-gray-400">{tp.description}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-gray-700">{tp.module.name}</p>
                                                        <p className="text-xs font-mono text-gray-400">{tp.module.code}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-gray-700">{formatDate(tp.due_date)}</p>
                                                        <p className={`text-xs ${dl.cls}`}>{dl.text}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{tp.max_grade}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => setEditing(tp)}
                                                                className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => setDeletingId(tp.id)}
                                                                className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                                                            >
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
                    )}

                    {/* Past TPs */}
                    {past.length > 0 && (
                        <section>
                            <h3 className="mb-3 text-sm font-semibold text-gray-500">Past TPs</h3>
                            <div className="overflow-hidden rounded-xl bg-white shadow-sm opacity-75">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Module</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Due Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Max Grade</th>
                                            <th className="px-6 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {past.map((tp) => (
                                            <tr key={tp.id} className="transition-colors hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-gray-500 line-through">{tp.title}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-500">{tp.module.name}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-400">{formatDate(tp.due_date)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-400">{tp.max_grade}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditing(tp)}
                                                            className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingId(tp.id)}
                                                            className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
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
        </TeacherLayout>
    );
}
