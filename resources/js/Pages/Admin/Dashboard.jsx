import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

/* ── Stat card ───────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon, colorClass }) {
    return (
        <div className={`rounded-xl bg-white p-5 shadow-sm border-l-4 ${colorClass}`}>
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
                    <p className="mt-1 text-3xl font-extrabold text-gray-900">{value}</p>
                    {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
                </div>
                <span className="text-3xl">{icon}</span>
            </div>
        </div>
    );
}

/* ── Quick action link ───────────────────────────────────────────────── */
function QuickLink({ href, icon, title, desc }) {
    return (
        <Link href={href}
            className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition hover:border-indigo-400 hover:bg-indigo-50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl">
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
            </div>
        </Link>
    );
}

/* ── Select ──────────────────────────────────────────────────────────── */
const SEL = 'rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';

/* ── Page ────────────────────────────────────────────────────────────── */
export default function Dashboard({ stats, moduleSummary, specializations, filters }) {
    const [specId, setSpecId] = useState(filters.specialization_id ?? '');
    const [semId,  setSemId]  = useState(filters.semester_id       ?? '');

    const selectedSpec = specializations.find((s) => String(s.id) === String(specId));
    const semesterList = selectedSpec?.semesters ?? [];

    function handleSpecChange(val) {
        setSpecId(val);
        setSemId('');
        router.get(route('admin.dashboard'),
            { specialization_id: val || undefined },
            { preserveState: true, replace: true }
        );
    }

    function handleSemChange(val) {
        setSemId(val);
        router.get(route('admin.dashboard'),
            { specialization_id: specId || undefined, semester_id: val || undefined },
            { preserveState: true, replace: true }
        );
    }

    // Progress computed from filtered moduleSummary when available
    const visibleModules   = moduleSummary ?? [];
    const visibleTotal     = visibleModules.length;
    const visiblePublished = visibleModules.filter((m) => m.is_published).length;
    const publishProgress  = visibleTotal > 0
        ? Math.round((visiblePublished / visibleTotal) * 100)
        : 0;

    const bothSelected = specId && semId;

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Admin Dashboard</h2>}>
            <Head title="Admin Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* ── Global stats ── */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard label="Students"      value={stats.students}       icon="🎓" colorClass="border-emerald-500" />
                        <StatCard label="Teachers"      value={stats.teachers}       icon="👩‍🏫" colorClass="border-blue-500" />
                        <StatCard label="Modules"       value={stats.modules}        icon="📚" colorClass="border-indigo-500"
                            sub={`${stats.modules_published} published · ${stats.modules_pending} pending`} />
                        <StatCard label="Grades Entered" value={stats.grades_entered} icon="📝" colorClass="border-amber-500"
                            sub={`${stats.students_graded} student${stats.students_graded !== 1 ? 's' : ''} graded`} />
                    </div>

                    {/* ── Results publication status ── */}
                    <div className="rounded-xl bg-white p-6 shadow-sm space-y-5">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Results Publication Status</h3>
                            <Link href={route('admin.results.index')} className="text-xs font-medium text-indigo-600 hover:underline">
                                Manage →
                            </Link>
                        </div>

                        {/* Cascading filter */}
                        <div className="flex flex-wrap items-end gap-3">
                            {/* Specialization */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Specialization
                                </label>
                                <select value={specId} onChange={(e) => handleSpecChange(e.target.value)} className={SEL}>
                                    <option value="">— All specializations —</option>
                                    {specializations.map((s) => (
                                        <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Semester */}
                            <div>
                                <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${!specId ? 'text-gray-300' : 'text-gray-400'}`}>
                                    Semester
                                </label>
                                <select value={semId} onChange={(e) => handleSemChange(e.target.value)}
                                    className={SEL} disabled={!specId}>
                                    <option value="">— All semesters —</option>
                                    {semesterList.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {(specId || semId) && (
                                <button onClick={() => handleSpecChange('')}
                                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50">
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Empty state — no selection yet */}
                        {!bothSelected && (
                            <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
                                Select a specialization and semester to see the publication status.
                            </div>
                        )}

                        {/* Progress + table */}
                        {bothSelected && (
                            <>
                                {/* Progress bar */}
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
                                        <span>
                                            {visiblePublished} of {visibleTotal} module{visibleTotal !== 1 ? 's' : ''} published
                                            {selectedSpec && semId && (
                                                <span className="ml-2 text-gray-400">
                                                    — {selectedSpec.code} · {semesterList.find(s => String(s.id) === String(semId))?.name}
                                                </span>
                                            )}
                                        </span>
                                        <span className={`font-semibold ${publishProgress === 100 ? 'text-emerald-600' : 'text-indigo-700'}`}>
                                            {publishProgress}%
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                                        <div className={`h-2.5 rounded-full transition-all ${publishProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${publishProgress}%` }} />
                                    </div>
                                </div>

                                {/* Table */}
                                {visibleTotal === 0 ? (
                                    <p className="text-center text-sm text-gray-400 py-6">No modules in this semester.</p>
                                ) : (
                                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Module</th>
                                                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Teacher</th>
                                                    <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">Grades</th>
                                                    <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">Students</th>
                                                    <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 bg-white">
                                                {visibleModules.map((m) => (
                                                    <tr key={m.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                                                        <td className="px-4 py-3 text-gray-500">
                                                            {m.teacher_name === '—'
                                                                ? <span className="italic text-red-400 text-xs">Unassigned</span>
                                                                : m.teacher_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-gray-600">
                                                            <span className={m.grades_count === m.students_count && m.students_count > 0 ? 'text-emerald-600 font-semibold' : ''}>
                                                                {m.grades_count}
                                                            </span>
                                                            <span className="text-gray-400">/{m.students_count}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-gray-600">{m.students_count}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            {m.is_published ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                    Published
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-600">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── Quick actions ── */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h3 className="mb-4 font-semibold text-gray-900">Quick Actions</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <QuickLink href={route('admin.bulk-import.index')}  icon="📤" title="Bulk Import Users"     desc="Upload Excel to add students or teachers" />
                            <QuickLink href={route('admin.users')}              icon="👥" title="Manage Users"          desc="Search, filter, resend credentials" />
                            <QuickLink href={route('admin.modules.index')}      icon="📚" title="Manage Modules"        desc="Create, edit, assign teachers" />
                            <QuickLink href={route('admin.results.index')}      icon="📊" title="Results"               desc="Publish grades, view rankings" />
                            <QuickLink href={route('admin.schedules.index')}    icon="🗓️" title="Schedules"             desc="Manage class timetables" />
                            <QuickLink href={route('admin.exams.index')}        icon="📋" title="Exams"                 desc="Announce upcoming exams" />
                            <QuickLink href={route('admin.advancement.index')}  icon="🎓" title="Semester Advancement"  desc="Advance students to the next semester" />
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}
