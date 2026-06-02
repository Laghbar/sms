const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat' };

const TYPE_STYLES = {
    cours: 'bg-indigo-100 border-indigo-300 text-indigo-800',
    td:    'bg-amber-100 border-amber-300 text-amber-800',
    tp:    'bg-emerald-100 border-emerald-300 text-emerald-800',
};

const PARITY_LABELS = { all: '', odd: 'Week A', even: 'Week B' };

function fmt(time) {
    return time?.slice(0, 5) ?? '';
}

export default function ScheduleGrid({ schedules }) {
    const byDay = DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {});
    schedules.forEach(s => byDay[s.day]?.push(s));

    const activeDays = DAYS.filter(d => byDay[d].length > 0);

    if (activeDays.length === 0) {
        return (
            <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
                No sessions scheduled yet.
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeDays.map(day => (
                <div key={day} className="rounded-xl bg-white shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                            {DAY_LABELS[day]}
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {byDay[day].map(s => (
                            <div key={s.id} className={`flex items-start gap-3 border-l-4 px-4 py-3 ${TYPE_STYLES[s.type]}`}>
                                <div className="shrink-0 text-center">
                                    <p className="text-xs font-bold">{fmt(s.start_time)}</p>
                                    <p className="text-xs opacity-60">{fmt(s.end_time)}</p>
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">{s.module?.name}</p>
                                    <p className="text-xs opacity-70">{s.module?.code} · {s.room}</p>
                                    <div className="mt-1 flex gap-1">
                                        <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-medium uppercase">
                                            {s.type}
                                        </span>
                                        {s.week_parity !== 'all' && (
                                            <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-medium">
                                                {PARITY_LABELS[s.week_parity]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
