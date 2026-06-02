import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';

function StatCard({ label, value, icon, color, sub }) {
    return (
        <div className={`rounded-xl bg-white p-6 shadow-sm border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{value ?? '—'}</p>
                    {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </div>
    );
}

export default function Dashboard({ stats }) {
    return (
        <StudentLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Student Dashboard</h2>}>
            <Head title="Student Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <StatCard label="Enrolled Modules" value={stats.modules}    icon="📚" color="border-indigo-500" />
                        <StatCard label="Overall Average"  value={stats.average !== null ? `${stats.average}/20` : null} icon="📊" color="border-green-500" sub="across all modules" />
                        <StatCard label="Pending TPs"      value={stats.pending_tps} icon="🧪" color="border-amber-500" sub="due from today" />
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Quick Access</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {[
                                { href: route('student.results'),  icon: '📋', title: 'My Results',  desc: 'Grades by module and exam type' },
                                { href: route('student.schedule'), icon: '🗓️', title: 'Schedule',    desc: 'Your weekly timetable' },
                                { href: route('student.tps'),      icon: '🧪', title: 'TPs',         desc: 'Practical work assignments' },
                            ].map(item => (
                                <Link key={item.href} href={item.href}
                                    className="flex items-center gap-4 rounded-lg border border-gray-200 p-5 transition hover:border-indigo-400 hover:bg-indigo-50">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl">{item.icon}</div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.title}</p>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
