import TeacherLayout from '@/Layouts/TeacherLayout';
import ScheduleGrid from '@/Components/ScheduleGrid';
import { Head } from '@inertiajs/react';

export default function Schedule({ schedules }) {
    return (
        <TeacherLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">My Schedule</h2>}>
            <Head title="My Schedule" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
                    {/* Legend */}
                    <div className="flex flex-wrap gap-3">
                        {[
                            { type: 'cours', label: 'Cours',  color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
                            { type: 'td',    label: 'TD',     color: 'bg-amber-100 text-amber-700 border-amber-300' },
                            { type: 'tp',    label: 'TP',     color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
                        ].map(l => (
                            <span key={l.type} className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${l.color}`}>
                                {l.label}
                            </span>
                        ))}
                    </div>

                    <ScheduleGrid schedules={schedules} />
                </div>
            </div>
        </TeacherLayout>
    );
}
