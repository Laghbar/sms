import StudentLayout from '@/Layouts/StudentLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function GradePill({ grade, isPublished }) {
    if (!isPublished) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                Not Available
            </span>
        );
    }
    if (grade === null || grade === undefined) {
        return <span className="text-xs text-gray-300">—</span>;
    }
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${
            grade >= 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
        }`}>
            {Number(grade).toFixed(2)} <span className="ms-1 text-xs font-normal opacity-60">/ 20</span>
        </span>
    );
}

function StatusBadge({ isPublished }) {
    if (isPublished) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Published
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            Pending
        </span>
    );
}

function RankCell({ moduleRank, isPublished }) {
    if (!isPublished) {
        return <span className="text-xs text-gray-300">Pending</span>;
    }
    if (!moduleRank || moduleRank.rank === null) {
        return <span className="text-xs text-gray-300">—</span>;
    }
    return (
        <span className="font-semibold text-indigo-700">
            #{moduleRank.rank}
            <span className="ms-1 text-xs font-normal text-gray-400">of {moduleRank.total}</span>
        </span>
    );
}

export default function Results({ modules, final_average, my_rank, total_students, top10, pending_count }) {
    const { auth: { user } } = usePage().props;
    const [tab, setTab] = useState('results');

    const passing    = final_average !== null && final_average >= 10;
    const allDone    = pending_count === 0;
    const someGraded = modules.some((m) => m.is_published && m.grade !== null);

    return (
        <StudentLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">My Results</h2>}>
            <Head title="My Results" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {modules.length === 0 ? (
                        <div className="rounded-xl bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
                            <p className="text-3xl mb-3">📋</p>
                            You are not enrolled in any modules yet.
                        </div>
                    ) : (
                        <>
                            {/* ── Pending notice ── */}
                            {pending_count > 0 && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                                    <strong>{pending_count} module{pending_count !== 1 ? 's' : ''}</strong> still pending — your teacher hasn't published those results yet.
                                </div>
                            )}

                            {/* ── Summary banner ── */}
                            {(final_average !== null || my_rank !== null) && (
                                <div className={`rounded-xl p-6 shadow-sm ${
                                    allDone
                                        ? passing ? 'border border-emerald-200 bg-emerald-50' : 'border border-red-200 bg-red-50'
                                        : 'border border-indigo-100 bg-indigo-50'
                                }`}>
                                    <div className="flex flex-wrap items-center justify-between gap-6">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                {allDone ? 'Final Average' : 'Partial Average (published modules only)'}
                                            </p>
                                            {final_average !== null ? (
                                                <>
                                                    <p className={`mt-1 text-5xl font-extrabold ${
                                                        allDone
                                                            ? passing ? 'text-emerald-700' : 'text-red-600'
                                                            : 'text-indigo-700'
                                                    }`}>
                                                        {final_average.toFixed(2)}
                                                        <span className="ms-2 text-lg font-normal text-gray-400">/ 20</span>
                                                    </p>
                                                    {allDone && (
                                                        <p className={`mt-1 text-sm font-semibold ${passing ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            {passing ? '✓ Passing' : '✗ Failing'}
                                                        </p>
                                                    )}
                                                    {!allDone && (
                                                        <p className="mt-1 text-xs text-indigo-500">
                                                            {pending_count} module{pending_count !== 1 ? 's' : ''} not yet included
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="mt-2 text-sm text-gray-400">No grades published yet.</p>
                                            )}
                                        </div>

                                        {my_rank !== null && (
                                            <div className="text-center">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    {allDone ? 'Final Class Ranking' : 'Current Ranking'}
                                                </p>
                                                <p className="mt-1 text-5xl font-extrabold text-indigo-700">
                                                    #{my_rank}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-400">
                                                    out of {total_students} students
                                                </p>
                                                {!allDone && (
                                                    <p className="mt-0.5 text-xs text-indigo-400">Provisional</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Tabs ── */}
                            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
                                {[
                                    { v: 'results',  l: 'My Results'   },
                                    { v: 'ranking',  l: `Class Top 10` },
                                ].map((t) => (
                                    <button
                                        key={t.v}
                                        onClick={() => setTab(t.v)}
                                        className={`rounded-md px-5 py-1.5 text-sm font-medium transition-colors ${
                                            tab === t.v ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {t.l}
                                    </button>
                                ))}
                            </div>

                            {/* ── RESULTS TAB ── */}
                            {tab === 'results' && (
                                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-100">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Module</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Teacher</th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Grade</th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Module Ranking</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {modules.map((mod) => (
                                                    <tr key={mod.id} className={`transition-colors ${mod.is_published ? 'hover:bg-gray-50' : 'bg-gray-50/50'}`}>
                                                        <td className="px-5 py-4">
                                                            <p className="text-sm font-semibold text-gray-900">{mod.name}</p>
                                                            <p className="text-xs text-gray-400">
                                                                {mod.code} · Coeff. {mod.coefficient}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <p className="text-sm text-gray-700">{mod.teacher_name}</p>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <GradePill grade={mod.grade} isPublished={mod.is_published} />
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <StatusBadge isPublished={mod.is_published} />
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <RankCell moduleRank={mod.module_rank} isPublished={mod.is_published} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Summary footer */}
                                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <p className="text-xs text-gray-400">
                                                {modules.filter((m) => m.is_published).length} of {modules.length} modules published
                                            </p>
                                            {final_average !== null && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">
                                                        {allDone ? 'Final average:' : 'Partial average:'}
                                                    </span>
                                                    <span className={`text-sm font-bold ${passing ? 'text-emerald-700' : 'text-red-600'}`}>
                                                        {final_average.toFixed(2)} / 20
                                                    </span>
                                                    {my_rank && (
                                                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                                                            Rank #{my_rank}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── RANKING TAB ── */}
                            {tab === 'ranking' && (
                                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                                    <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                                        <p className="font-semibold text-gray-900">Class Ranking — Top 10</p>
                                        <p className="mt-0.5 text-xs text-gray-400">
                                            Weighted average across all published modules
                                            {!allDone && ' (provisional — some modules pending)'}
                                        </p>
                                    </div>

                                    {top10.length === 0 ? (
                                        <div className="px-6 py-10 text-center text-sm text-gray-400">
                                            No results published yet for ranking.
                                        </div>
                                    ) : (
                                        <ul className="divide-y divide-gray-50">
                                            {top10.map((s, i) => {
                                                const isMe  = s.id === user.id;
                                                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                                                return (
                                                    <li
                                                        key={s.id}
                                                        className={`flex items-center gap-4 px-6 py-4 ${
                                                            isMe ? 'bg-indigo-50 border-l-4 border-indigo-400' : 'hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="w-8 shrink-0 text-center">
                                                            {medal
                                                                ? <span className="text-xl">{medal}</span>
                                                                : <span className="text-sm font-bold text-gray-400">{i + 1}</span>
                                                            }
                                                        </div>
                                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                                            isMe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {s.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-semibold ${isMe ? 'text-indigo-700' : 'text-gray-900'}`}>
                                                                {s.name}
                                                                {isMe && <span className="ms-1 text-xs font-normal text-indigo-400">(you)</span>}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-lg font-extrabold ${
                                                                s.average >= 16 ? 'text-emerald-600'
                                                                : s.average >= 10 ? 'text-indigo-700'
                                                                : 'text-red-500'
                                                            }`}>
                                                                {s.average.toFixed(2)}
                                                            </p>
                                                            <p className="text-xs text-gray-400">/ 20</p>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}

                                    {/* Show current student outside top 10 */}
                                    {my_rank !== null && my_rank > 10 && (
                                        <div className="border-t-2 border-dashed border-indigo-200 bg-indigo-50 px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 shrink-0 text-center text-sm font-bold text-indigo-600">{my_rank}</div>
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-indigo-700">
                                                        {user.name} <span className="text-xs font-normal text-indigo-400">(you)</span>
                                                    </p>
                                                    <p className="text-xs text-indigo-400">{ordinal(my_rank)} out of {total_students}</p>
                                                </div>
                                                {final_average !== null && (
                                                    <div className="text-right">
                                                        <p className="text-lg font-extrabold text-indigo-700">{final_average.toFixed(2)}</p>
                                                        <p className="text-xs text-gray-400">/ 20</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-100 px-6 py-3 text-center text-xs text-gray-400">
                                        {total_students} student{total_students !== 1 ? 's' : ''} with published results
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
