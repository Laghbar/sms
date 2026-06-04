import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

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

function ExamForm({ exam, modules, onClose }) {
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Module</label>
                <select value={data.module_id} onChange={(e) => setData('module_id', e.target.value)} className={field}>
                    <option value="">Select a module…</option>
                    {modules.map((m) => (
                        <option key={m.id} value={m.id}>S{m.semester} — {m.name} ({m.code})</option>
                    ))}
                </select>
                {err('module_id')}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Exam title</label>
                <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className={field} placeholder="e.g. Final Exam — Session 1" />
                {err('title')}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description <span className="font-normal text-gray-400">(optional)</span></label>
                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} className={field} placeholder="Instructions, allowed materials, format…" />
                {err('description')}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                <input type="date" value={data.exam_date} onChange={(e) => setData('exam_date', e.target.value)} className={field} />
                {err('exam_date')}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Start time <span className="font-normal text-gray-400">(optional)</span></label>
                    <input type="time" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} className={field} />
                    {err('start_time')}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">End time <span className="font-normal text-gray-400">(optional)</span></label>
                    <input type="time" value={data.end_time} onChange={(e) => setData('end_time', e.target.value)} className={field} />
                    {err('end_time')}
                </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Location <span className="font-normal text-gray-400">(optional)</span></label>
                <input type="text" value={data.location} onChange={(e) => setData('location', e.target.value)} className={field} placeholder="e.g. Amphitheatre A" />
                {err('location')}
            </div>

            {!isEdit && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-700">
                    📣 All students enrolled in the selected module will receive an in-app notification automatically.
                </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {processing ? 'Saving…' : isEdit ? 'Update Exam' : 'Announce Exam'}
                </button>
            </div>
        </form>
    );
}

function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function isPast(dateStr) {
    return new Date(dateStr) < new Date().setHours(0, 0, 0, 0);
}

export default function Exams({ exams, modules }) {
    const [creating, setCreating]     = useState(false);
    const [editing, setEditing]       = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    function confirmDelete(id) {
        router.delete(route('admin.exams.destroy', id), { onFinish: () => setDeletingId(null) });
    }

    const upcoming = exams.filter((e) => !isPast(e.exam_date));
    const past     = exams.filter((e) =>  isPast(e.exam_date));

    return (
        <AdminLayout header={
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold leading-tight text-gray-800">Exams</h2>
                <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Announce Exam
                </button>
            </div>
        }>
            <Head title="Exams" />

            <Modal open={creating} onClose={() => setCreating(false)} title="Announce New Exam">
                <ExamForm exam={null} modules={modules} onClose={() => setCreating(false)} />
            </Modal>
            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Exam">
                {editing && <ExamForm exam={editing} modules={modules} onClose={() => setEditing(null)} />}
            </Modal>
            <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Exam">
                <p className="mb-6 text-sm text-gray-600">This exam announcement will be permanently removed.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setDeletingId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={() => confirmDelete(deletingId)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
                </div>
            </Modal>

            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {exams.length === 0 && (
                        <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">No exams announced yet.</div>
                    )}

                    {upcoming.length > 0 && (
                        <section>
                            <h3 className="mb-3 text-sm font-semibold text-gray-600">Upcoming Exams</h3>
                            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Module</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Title</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Time</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Location</th>
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
                                                <td className="px-5 py-4 text-sm text-gray-600 font-mono">
                                                    {ex.start_time ? ex.start_time.slice(0,5) : '—'}
                                                    {ex.end_time ? ` – ${ex.end_time.slice(0,5)}` : ''}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{ex.location ?? '—'}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => setEditing(ex)} className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50">Edit</button>
                                                        <button onClick={() => setDeletingId(ex.id)} className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50">Delete</button>
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
                            <h3 className="mb-3 text-sm font-semibold text-gray-400">Past Exams</h3>
                            <div className="overflow-hidden rounded-xl bg-white opacity-60 shadow-sm">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Module</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Title</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Date</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Location</th>
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
                                                    <button onClick={() => setDeletingId(ex.id)} className="rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-50">Delete</button>
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
