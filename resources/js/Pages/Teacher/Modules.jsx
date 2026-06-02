import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head } from '@inertiajs/react';

const TYPE_COLORS = {
    cours: 'bg-indigo-100 text-indigo-700',
    td:    'bg-amber-100 text-amber-700',
    tp:    'bg-emerald-100 text-emerald-700',
};

const DAY_ABBR = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat' };

export default function Modules({ modules }) {
    return (
        <TeacherLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">My Modules</h2>}>
            <Head title="My Modules" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {modules.length === 0 && (
                        <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
                            No modules assigned yet.
                        </div>
                    )}

                    {[1, 2].map(sem => {
                        const semModules = modules.filter(m => m.semester === sem);
                        if (!semModules.length) return null;
                        return (
                            <div key={sem}>
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-400">
                                    Semester {sem}
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {semModules.map(mod => (
                                        <div key={mod.id} className="rounded-xl bg-white shadow-sm overflow-hidden">
                                            {/* Header */}
                                            <div className="bg-indigo-600 px-5 py-4">
                                                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">{mod.code}</p>
                                                <p className="mt-0.5 text-base font-bold text-white truncate">{mod.name}</p>
                                            </div>

                                            {/* Meta */}
                                            <div className="flex gap-4 border-b border-gray-100 px-5 py-3 text-sm text-gray-600">
                                                <span>⚖️ Coefficient <strong>{mod.coefficient}</strong></span>
                                                <span>🎓 <strong>{mod.students_count}</strong> student{mod.students_count !== 1 ? 's' : ''}</span>
                                            </div>

                                            {/* Sessions */}
                                            {mod.schedules?.length > 0 && (
                                                <div className="px-5 py-3 space-y-1">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Sessions</p>
                                                    {mod.schedules.map(s => (
                                                        <div key={s.id} className="flex items-center gap-2 text-sm">
                                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[s.type]}`}>{s.type.toUpperCase()}</span>
                                                            <span className="text-gray-700">{DAY_ABBR[s.day]} {s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)}</span>
                                                            <span className="text-gray-400">· {s.room}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {mod.description && (
                                                <p className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">{mod.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </TeacherLayout>
    );
}
