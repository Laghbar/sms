import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

const STATUS_STYLES = {
    upcoming: 'bg-blue-100 text-blue-700',
    ongoing:  'bg-green-100 text-green-700',
    past:     'bg-gray-100 text-gray-500',
};

function fmt(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function toInput(iso) { return iso ? iso.slice(0, 16) : ''; }

function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

function EventForm({ event, onClose, routeStore, routeUpdate, t }) {
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
        isEdit ? put(routeUpdate, opts) : post(routeStore, opts);
    }

    const field = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';
    const err   = (k) => errors[k] && <p className="mt-1 text-xs text-red-500">{errors[k]}</p>;

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('title_label')}</label>
                <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className={field} />
                {err('title')}
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('description_label')}</label>
                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={4} className={field} />
                {err('description')}
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('location_label')}</label>
                <input type="text" value={data.location} onChange={(e) => setData('location', e.target.value)} className={field} />
                {err('location')}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('starts_at_label')}</label>
                    <input type="datetime-local" value={data.starts_at} onChange={(e) => setData('starts_at', e.target.value)} className={field} />
                    {err('starts_at')}
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('ends_at_label')} <span className="font-normal text-gray-400">(optional)</span></label>
                    <input type="datetime-local" value={data.ends_at} onChange={(e) => setData('ends_at', e.target.value)} className={field} />
                    {err('ends_at')}
                </div>
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('max_participants_label')} <span className="font-normal text-gray-400">(optional)</span></label>
                <input type="number" min={1} value={data.max_participants} onChange={(e) => setData('max_participants', e.target.value)} className={field} placeholder={t('unlimited_ph')} />
                {err('max_participants')}
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('image_label')} <span className="font-normal text-gray-400">(optional)</span></label>
                {preview && <img src={preview} alt="Preview" className="mb-2 h-28 w-full rounded-lg object-cover" />}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                <button type="button" onClick={() => fileRef.current.click()} className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600">
                    {preview ? t('change_image') : t('upload_image')}
                </button>
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">{t('cancel')}</button>
                <button type="submit" disabled={processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {processing ? t('saving_label') : isEdit ? t('update_event_btn') : t('create_event_btn')}
                </button>
            </div>
        </form>
    );
}

function EventCard({ ev, actions, t }) {
    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            {ev.image_url && <img src={ev.image_url} alt={ev.title} className="h-36 w-full object-cover" />}
            {!ev.image_url && <div className="flex h-20 w-full items-center justify-center bg-indigo-50 text-4xl">📅</div>}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 leading-tight">{ev.title}</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[ev.status]}`}>{ev.status}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{ev.description}</p>
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                    <p>📍 {ev.location}</p>
                    <p>📅 {fmt(ev.starts_at)}</p>
                    <p>👥 {ev.registered_users_count}{ev.max_participants ? ` / ${ev.max_participants}` : ''} {t('registered_count_label')}</p>
                </div>
                {actions && <div className="mt-3 flex gap-2">{actions}</div>}
            </div>
        </div>
    );
}

export default function Events({ myEvents, allEvents }) {
    const { t } = useLanguage();
    const [tab, setTab]           = useState('all');
    const [creating, setCreating] = useState(false);
    const [editing, setEditing]   = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    function confirmDelete(id) {
        router.delete(route('teacher.events.destroy', id), { onFinish: () => setDeletingId(null) });
    }

    function toggle(ev) {
        if (ev.is_registered) {
            router.delete(route('teacher.events.unregister', ev.id));
        } else {
            router.post(route('teacher.events.register', ev.id));
        }
    }

    return (
        <TeacherLayout header={
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold leading-tight text-gray-800">{t('nav_events')}</h2>
                <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    {t('create_event')}
                </button>
            </div>
        }>
            <Head title={t('nav_events')} />

            <Modal open={creating} onClose={() => setCreating(false)} title={t('create_event')}>
                <EventForm event={null} onClose={() => setCreating(false)} routeStore={route('teacher.events.store')} t={t} />
            </Modal>
            <Modal open={!!editing} onClose={() => setEditing(null)} title={t('edit_event_title')}>
                {editing && <EventForm event={editing} onClose={() => setEditing(null)} routeStore={route('teacher.events.store')} routeUpdate={route('teacher.events.update', editing.id)} t={t} />}
            </Modal>
            <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title={t('delete_event_title')}>
                <p className="mb-6 text-sm text-gray-600">{t('delete_event_confirm')}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setDeletingId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">{t('cancel')}</button>
                    <button onClick={() => confirmDelete(deletingId)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">{t('delete')}</button>
                </div>
            </Modal>

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Tabs */}
                    <div className="mb-6 inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
                        {[
                            { v: 'all',  l: t('all_events_tab') },
                            { v: 'mine', l: `${t('nav_events')} (${myEvents.length})` },
                        ].map(tab_ => (
                            <button key={tab_.v} onClick={() => setTab(tab_.v)}
                                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${tab === tab_.v ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                                {tab_.l}
                            </button>
                        ))}
                    </div>

                    {tab === 'all' && (
                        allEvents.length === 0 ? (
                            <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">{t('no_upcoming_events')}</div>
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {allEvents.map((ev) => (
                                    <EventCard key={ev.id} ev={ev} t={t} actions={
                                        ev.status !== 'past' && (
                                            <button
                                                onClick={() => toggle(ev)}
                                                className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${ev.is_registered ? 'border border-gray-200 text-gray-600 hover:bg-gray-50' : ev.is_full ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                                disabled={!ev.is_registered && ev.is_full}
                                            >
                                                {ev.is_registered ? t('cancel_participation') : ev.is_full ? t('event_full') : t('participate')}
                                            </button>
                                        )
                                    } />
                                ))}
                            </div>
                        )
                    )}

                    {tab === 'mine' && (
                        myEvents.length === 0 ? (
                            <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
                                <p>{t('no_events_mine')}</p>
                                <button onClick={() => setCreating(true)} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">{t('create_first_event')}</button>
                            </div>
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {myEvents.map((ev) => (
                                    <EventCard key={ev.id} ev={ev} t={t} actions={
                                        <>
                                            <button onClick={() => setEditing(ev)} className="flex-1 rounded-lg border border-indigo-200 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50">{t('edit')}</button>
                                            <button onClick={() => setDeletingId(ev.id)} className="flex-1 rounded-lg border border-red-200 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">{t('delete')}</button>
                                        </>
                                    } />
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
}
