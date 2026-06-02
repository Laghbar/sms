import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

const STATUS_STYLES = {
    upcoming: 'bg-blue-100 text-blue-700',
    ongoing:  'bg-green-100 text-green-700',
    past:     'bg-gray-100 text-gray-500',
};

function fmt(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function toInput(iso) {
    return iso ? iso.slice(0, 16) : '';
}

function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
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

function EventForm({ event, onClose }) {
    const isEdit = !!event;
    const fileRef = useRef();
    const [preview, setPreview] = useState(event?.image_url ?? null);

    const { data, setData, post, put, errors, processing, reset } = useForm({
        title:            event?.title ?? '',
        description:      event?.description ?? '',
        location:         event?.location ?? '',
        starts_at:        toInput(event?.starts_at),
        ends_at:          toInput(event?.ends_at),
        max_participants: event?.max_participants ?? '',
        image:            null,
        notify_students:  false,
    });

    function handleImage(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData('image', file);
        setPreview(URL.createObjectURL(file));
    }

    function submit(e) {
        e.preventDefault();
        const opts = { forceFormData: true, onSuccess: () => { reset(); onClose(); } };
        isEdit ? put(route('admin.events.update', event.id), opts)
               : post(route('admin.events.store'), opts);
    }

    const field = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';
    const err   = (k) => errors[k] && <p className="mt-1 text-xs text-red-500">{errors[k]}</p>;

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className={field} placeholder="Event title" />
                {err('title')}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={4} className={field} placeholder="Describe the event…" />
                {err('description')}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                <input type="text" value={data.location} onChange={(e) => setData('location', e.target.value)} className={field} placeholder="e.g. Main Auditorium" />
                {err('location')}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Starts at</label>
                    <input type="datetime-local" value={data.starts_at} onChange={(e) => setData('starts_at', e.target.value)} className={field} />
                    {err('starts_at')}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Ends at <span className="font-normal text-gray-400">(optional)</span></label>
                    <input type="datetime-local" value={data.ends_at} onChange={(e) => setData('ends_at', e.target.value)} className={field} />
                    {err('ends_at')}
                </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Max participants <span className="font-normal text-gray-400">(optional — leave blank for unlimited)</span></label>
                <input type="number" min={1} value={data.max_participants} onChange={(e) => setData('max_participants', e.target.value)} className={field} placeholder="Unlimited" />
                {err('max_participants')}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Event image <span className="font-normal text-gray-400">(optional)</span></label>
                {preview && (
                    <div className="mb-2">
                        <img src={preview} alt="Preview" className="h-32 w-full rounded-lg object-cover" />
                    </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                <button type="button" onClick={() => fileRef.current.click()} className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600">
                    {preview ? 'Change image' : 'Upload image'}
                </button>
                {err('image')}
            </div>

            {!isEdit && (
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                    <input type="checkbox" checked={data.notify_students} onChange={(e) => setData('notify_students', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                    <div>
                        <p className="text-sm font-medium text-gray-700">Notify all students by email</p>
                        <p className="text-xs text-gray-400">Send an announcement email to every student</p>
                    </div>
                </label>
            )}

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {processing ? 'Saving…' : isEdit ? 'Update Event' : 'Create Event'}
                </button>
            </div>
        </form>
    );
}

export default function Events({ events }) {
    const [creating, setCreating]   = useState(false);
    const [editing, setEditing]     = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [notifyingId, setNotifyingId] = useState(null);

    function confirmDelete(id) {
        router.delete(route('admin.events.destroy', id), { onFinish: () => setDeletingId(null) });
    }

    function confirmNotify(id) {
        router.post(route('admin.events.notify', id), {}, { onFinish: () => setNotifyingId(null) });
    }

    return (
        <AdminLayout header={
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold leading-tight text-gray-800">Events</h2>
                <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Event
                </button>
            </div>
        }>
            <Head title="Events" />

            <Modal open={creating} onClose={() => setCreating(false)} title="Create Event">
                <EventForm event={null} onClose={() => setCreating(false)} />
            </Modal>
            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Event">
                {editing && <EventForm event={editing} onClose={() => setEditing(null)} />}
            </Modal>
            <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Event">
                <p className="mb-6 text-sm text-gray-600">This will permanently delete the event and all registrations.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setDeletingId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={() => confirmDelete(deletingId)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
                </div>
            </Modal>
            <Modal open={!!notifyingId} onClose={() => setNotifyingId(null)} title="Notify Students">
                <p className="mb-6 text-sm text-gray-600">Send an email notification about this event to all students?</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setNotifyingId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={() => confirmNotify(notifyingId)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Send Emails</button>
                </div>
            </Modal>

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    {events.length === 0 ? (
                        <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">No events yet.</div>
                    ) : (
                        events.map((ev) => (
                            <div key={ev.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                                <div className="flex items-start gap-5 p-5">
                                    {ev.image_url ? (
                                        <img src={ev.image_url} alt={ev.title} className="h-24 w-36 shrink-0 rounded-lg object-cover" />
                                    ) : (
                                        <div className="flex h-24 w-36 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-4xl">📅</div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold text-gray-900">{ev.title}</p>
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[ev.status]}`}>
                                                {ev.status}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{ev.description}</p>
                                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                                            <span>📍 {ev.location}</span>
                                            <span>📅 {fmt(ev.starts_at)}</span>
                                            <span>👥 {ev.registered_users_count}{ev.max_participants ? ` / ${ev.max_participants}` : ''} registered</span>
                                            <span>By {ev.organizer?.name}</span>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                        <div className="flex gap-1">
                                            <button onClick={() => setEditing(ev)} className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50">Edit</button>
                                            <button onClick={() => setDeletingId(ev.id)} className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50">Delete</button>
                                        </div>
                                        <button onClick={() => setNotifyingId(ev.id)} className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50">
                                            📧 Notify Students
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
