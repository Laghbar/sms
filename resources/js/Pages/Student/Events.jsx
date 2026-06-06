import StudentLayout from '@/Layouts/StudentLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

const STATUS_STYLES = {
    upcoming: 'bg-blue-100 text-blue-700',
    ongoing:  'bg-green-100 text-green-700',
    past:     'bg-gray-100 text-gray-500',
};

function fmt(iso, opts) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', opts ?? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ── Calendar helpers ── */
function buildCalendar(year, month) {
    const first = new Date(year, month, 1).getDay(); // 0=Sun
    const days  = new Date(year, month + 1, 0).getDate();
    const start = (first + 6) % 7; // shift to Mon=0
    return { days, start };
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_HDR = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function CalendarView({ events, t }) {
    const today = new Date();
    const [year, setYear]   = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    const { days, start } = buildCalendar(year, month);

    const eventsByDay = {};
    events.forEach((e) => {
        const d = new Date(e.starts_at);
        if (d.getFullYear() === year && d.getMonth() === month) {
            const day = d.getDate();
            if (!eventsByDay[day]) eventsByDay[day] = [];
            eventsByDay[day].push(e);
        }
    });

    function prev() { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); }
    function next() { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); }

    const cells = [];
    for (let i = 0; i < start; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);

    const [selected, setSelected] = useState(null);
    const selectedEvents = selected ? (eventsByDay[selected] ?? []) : [];

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                {/* Month nav */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <button onClick={prev} className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <p className="font-semibold text-gray-900">{MONTHS[month]} {year}</p>
                    <button onClick={next} className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* Header */}
                <div className="grid grid-cols-7 border-b border-gray-100">
                    {DAYS_HDR.map(d => (
                        <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">{d}</div>
                    ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7">
                    {cells.map((day, i) => {
                        if (!day) return <div key={`e${i}`} className="h-16 border-b border-r border-gray-50 last:border-r-0" />;
                        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                        const hasEvents = !!eventsByDay[day];
                        const isSelected = selected === day;
                        return (
                            <div
                                key={day}
                                onClick={() => setSelected(isSelected ? null : day)}
                                className={`h-16 cursor-pointer border-b border-r border-gray-50 p-1 last:border-r-0 hover:bg-gray-50 ${isSelected ? 'bg-indigo-50' : ''}`}
                            >
                                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${isToday ? 'bg-indigo-600 font-bold text-white' : 'text-gray-700'}`}>
                                    {day}
                                </span>
                                {hasEvents && (
                                    <div className="mt-1 flex flex-wrap gap-0.5">
                                        {eventsByDay[day].slice(0, 3).map((e) => (
                                            <span key={e.id} className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Events for selected day */}
            {selected && (
                <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="mb-3 text-sm font-semibold text-gray-700">{MONTHS[month]} {selected}</p>
                    {selectedEvents.length === 0 ? (
                        <p className="text-sm text-gray-400">{t('no_day_events')}</p>
                    ) : (
                        <div className="space-y-3">
                            {selectedEvents.map((e) => (
                                <div key={e.id} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm">📅</div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{e.title}</p>
                                        <p className="text-xs text-gray-500">📍 {e.location} · {fmt(e.starts_at, { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function EventCard({ ev, t }) {
    function toggle() {
        if (ev.is_registered) {
            router.delete(route('student.events.unregister', ev.id));
        } else {
            router.post(route('student.events.register', ev.id));
        }
    }

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            {ev.image_url
                ? <img src={ev.image_url} alt={ev.title} className="h-40 w-full object-cover" />
                : <div className="flex h-28 w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 text-5xl">📅</div>
            }
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold leading-tight text-gray-900">{ev.title}</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[ev.status]}`}>{ev.status}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{ev.description}</p>
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                    <p>📍 {ev.location}</p>
                    <p>📅 {fmt(ev.starts_at)}</p>
                    <p>👥 {ev.registered_users_count}{ev.max_participants ? ` / ${ev.max_participants}` : ''} {t('registered_count_label')}</p>
                </div>
                {ev.status !== 'past' && (
                    <button
                        onClick={toggle}
                        className={`mt-3 w-full rounded-lg py-2 text-sm font-medium transition-colors ${
                            ev.is_registered
                                ? 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                : ev.is_full
                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                        disabled={!ev.is_registered && ev.is_full}
                    >
                        {ev.is_registered ? t('cancel_participation') : ev.is_full ? t('event_full_label') : t('register_label')}
                    </button>
                )}
                {ev.is_registered && ev.status === 'past' && (
                    <p className="mt-3 text-center text-xs font-medium text-green-600">{t('attended_label')}</p>
                )}
            </div>
        </div>
    );
}

export default function Events({ events }) {
    const { t } = useLanguage();
    const [view, setView] = useState('list');

    const upcoming  = events.filter(e => e.status !== 'past');
    const past      = events.filter(e => e.status === 'past');
    const registered = events.filter(e => e.is_registered);

    return (
        <StudentLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{t('nav_events')}</h2>}>
            <Head title={t('nav_events')} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Stats strip */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: t('upcoming_stat'), value: upcoming.length, color: 'text-blue-600' },
                            { label: t('registered_stat'), value: registered.length, color: 'text-indigo-600' },
                            { label: t('past_stat'), value: past.length, color: 'text-gray-500' },
                        ].map(s => (
                            <div key={s.label} className="rounded-xl bg-white p-4 text-center shadow-sm">
                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-gray-500">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center justify-between">
                        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
                            {[{ v: 'list', l: t('list_view') }, { v: 'calendar', l: t('calendar_view') }].map(tb => (
                                <button key={tb.v} onClick={() => setView(tb.v)}
                                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${view === tb.v ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                                    {tb.v === 'list' ? '☰' : '📅'} {tb.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Calendar view */}
                    {view === 'calendar' && <CalendarView events={events} t={t} />}

                    {/* List view */}
                    {view === 'list' && (
                        <div className="space-y-8">
                            {events.length === 0 && (
                                <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">{t('no_events_yet')}</div>
                            )}

                            {upcoming.length > 0 && (
                                <section>
                                    <h3 className="mb-3 text-sm font-semibold text-gray-600">{t('upcoming_events_title')}</h3>
                                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                        {upcoming.map(ev => <EventCard key={ev.id} ev={ev} t={t} />)}
                                    </div>
                                </section>
                            )}

                            {past.length > 0 && (
                                <section>
                                    <h3 className="mb-3 text-sm font-semibold text-gray-400">{t('past_events_title')}</h3>
                                    <div className="grid gap-5 opacity-60 sm:grid-cols-2 lg:grid-cols-3">
                                        {past.map(ev => <EventCard key={ev.id} ev={ev} t={t} />)}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
