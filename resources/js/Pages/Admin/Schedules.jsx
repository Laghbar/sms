import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useCallback, useState } from 'react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday' };
const TYPE_LABELS = { cours: 'Cours', td: 'TD', tp: 'TP' };
const TYPE_COLORS = {
    cours: 'bg-blue-100 text-blue-700',
    td:    'bg-orange-100 text-orange-700',
    tp:    'bg-green-100 text-green-700',
};
const PARITY_LABELS = { all: 'All weeks', odd: 'Odd weeks', even: 'Even weeks' };

function formatTime(t) {
    return t ? t.slice(0, 5) : '';
}

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

const EMPTY_FORM = {
    module_id:   '',
    day:         'monday',
    start_time:  '08:00',
    end_time:    '10:00',
    room:        '',
    type:        'cours',
    week_parity: 'all',
};

function ScheduleFormModal({ schedule, modules, onClose }) {
    const isEdit = !!schedule;
    const { data, setData, post, put, errors, processing, reset } = useForm(
        schedule
            ? {
                  module_id:   String(schedule.module_id),
                  day:         schedule.day,
                  start_time:  formatTime(schedule.start_time),
                  end_time:    formatTime(schedule.end_time),
                  room:        schedule.room,
                  type:        schedule.type,
                  week_parity: schedule.week_parity,
              }
            : EMPTY_FORM
    );

    function submit(e) {
        e.preventDefault();
        const opts = { onSuccess: () => { reset(); onClose(); } };
        isEdit
            ? put(route('admin.schedules.update', schedule.id), opts)
            : post(route('admin.schedules.store'), opts);
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

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Day</label>
                    <select
                        value={data.day}
                        onChange={(e) => setData('day', e.target.value)}
                        className={field}
                    >
                        {DAYS.map((d) => (
                            <option key={d} value={d}>{DAY_LABELS[d]}</option>
                        ))}
                    </select>
                    {errors.day && <p className={errCls}>{errors.day}</p>}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                    <select
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className={field}
                    >
                        <option value="cours">Cours</option>
                        <option value="td">TD</option>
                        <option value="tp">TP</option>
                    </select>
                    {errors.type && <p className={errCls}>{errors.type}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                        type="time"
                        value={data.start_time}
                        onChange={(e) => setData('start_time', e.target.value)}
                        className={field}
                    />
                    {errors.start_time && <p className={errCls}>{errors.start_time}</p>}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">End Time</label>
                    <input
                        type="time"
                        value={data.end_time}
                        onChange={(e) => setData('end_time', e.target.value)}
                        className={field}
                    />
                    {errors.end_time && <p className={errCls}>{errors.end_time}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Room</label>
                    <input
                        type="text"
                        value={data.room}
                        onChange={(e) => setData('room', e.target.value)}
                        className={field}
                        placeholder="e.g. A101"
                    />
                    {errors.room && <p className={errCls}>{errors.room}</p>}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Week Parity</label>
                    <select
                        value={data.week_parity}
                        onChange={(e) => setData('week_parity', e.target.value)}
                        className={field}
                    >
                        <option value="all">All weeks</option>
                        <option value="odd">Odd weeks</option>
                        <option value="even">Even weeks</option>
                    </select>
                    {errors.week_parity && <p className={errCls}>{errors.week_parity}</p>}
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
                    {processing ? 'Saving…' : isEdit ? 'Update Schedule' : 'Create Schedule'}
                </button>
            </div>
        </form>
    );
}

export default function Schedules({ schedules, modules, filters }) {
    const [moduleFilter, setModuleFilter] = useState(filters.module_id ?? '');
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const applyFilter = useCallback((val) => {
        router.get(route('admin.schedules.index'), { module_id: val || undefined }, {
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
        router.delete(route('admin.schedules.destroy', id), {
            onFinish: () => setDeletingId(null),
        });
    }

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Schedules</h2>
                    <button
                        onClick={() => setCreating(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Schedule
                    </button>
                </div>
            }
        >
            <Head title="Schedules" />

            {/* Create modal */}
            <Modal open={creating} onClose={() => setCreating(false)} title="Create Schedule">
                <ScheduleFormModal modules={modules} schedule={null} onClose={() => setCreating(false)} />
            </Modal>

            {/* Edit modal */}
            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Schedule">
                {editing && (
                    <ScheduleFormModal modules={modules} schedule={editing} onClose={() => setEditing(null)} />
                )}
            </Modal>

            {/* Delete confirm modal */}
            <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Schedule">
                <p className="mb-6 text-sm text-gray-600">
                    Are you sure you want to delete this schedule entry?
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

                    {/* Filter bar */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <select
                                value={moduleFilter}
                                onChange={handleModuleFilter}
                                className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            >
                                <option value="">All modules</option>
                                {modules.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} ({m.code})
                                    </option>
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
                        </div>
                        <p className="shrink-0 text-sm text-gray-500">
                            {schedules.total} entr{schedules.total !== 1 ? 'ies' : 'y'}
                        </p>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Module</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Day</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Room</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Parity</th>
                                        <th className="px-6 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {schedules.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                                                No schedules found.
                                            </td>
                                        </tr>
                                    ) : (
                                        schedules.data.map((s) => (
                                            <tr key={s.id} className="transition-colors hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{s.module.name}</div>
                                                    <div className="text-xs text-gray-400 font-mono">{s.module.code}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {DAY_LABELS[s.day]}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                                                    {formatTime(s.start_time)} – {formatTime(s.end_time)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{s.room}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[s.type]}`}>
                                                        {TYPE_LABELS[s.type]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {PARITY_LABELS[s.week_parity]}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditing(s)}
                                                            className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingId(s.id)}
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

                        {schedules.last_page > 1 && (
                            <div className="border-t border-gray-100 px-6 py-4">
                                <Pagination links={schedules.links} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
