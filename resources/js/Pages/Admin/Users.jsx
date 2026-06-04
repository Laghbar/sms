import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';

const ROLE_LABELS = {
    teacher: { label: 'Teacher', classes: 'bg-blue-100 text-blue-700' },
    student: { label: 'Student', classes: 'bg-emerald-100 text-emerald-700' },
};

function RoleBadge({ role }) {
    const cfg = ROLE_LABELS[role] ?? { label: role, classes: 'bg-gray-100 text-gray-700' };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}>
            {cfg.label}
        </span>
    );
}

function SpecBadge({ specialization, semester }) {
    if (!specialization) return <span className="text-xs text-gray-300">—</span>;
    return (
        <div className="flex items-center gap-1.5">
            <span className="rounded bg-indigo-600 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                {specialization.code}
            </span>
            {semester && (
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                    {semester}
                </span>
            )}
        </div>
    );
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

function ActionRow({ user }) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting]           = useState(false);

    function destroy() {
        setDeleting(true);
        router.delete(route('admin.users.destroy', user.id), {
            preserveScroll: true,
            onFinish: () => { setDeleting(false); setConfirmDelete(false); },
        });
    }

    return (
        <div className="flex items-center justify-end gap-2">
            {!confirmDelete ? (
                <button
                    onClick={() => setConfirmDelete(true)}
                    className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                >
                    Delete
                </button>
            ) : (
                <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1">
                    <span className="text-[11px] text-red-700">Sure?</span>
                    <button
                        onClick={destroy}
                        disabled={deleting}
                        className="rounded bg-red-600 px-1.5 py-0.5 text-[11px] font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        {deleting ? '…' : 'Yes'}
                    </button>
                    <button
                        onClick={() => setConfirmDelete(false)}
                        className="text-[11px] text-gray-400 hover:text-gray-600"
                    >
                        No
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Users({ users, filters, specializations = [] }) {
    const { flash } = usePage().props;
    const [search, setSearch]   = useState(filters.search ?? '');
    const [role, setRole]       = useState(filters.role ?? '');
    const [specId, setSpecId]   = useState(filters.specialization_id ?? '');

    const applyFilters = useCallback((s, r, sp) => {
        router.get(
            route('admin.users'),
            {
                search:            s  || undefined,
                role:              r  || undefined,
                specialization_id: sp || undefined,
            },
            { preserveState: true, replace: true }
        );
    }, []);

    function handleSearch(e) { const v = e.target.value; setSearch(v); applyFilters(v, role, specId); }
    function handleRole(e)   { const v = e.target.value; setRole(v);   applyFilters(search, v, specId); }
    function handleSpec(e)   { const v = e.target.value; setSpecId(v); applyFilters(search, role, v); }

    function clearFilters() {
        setSearch(''); setRole(''); setSpecId('');
        applyFilters('', '', '');
    }

    const hasFilters = search || role || specId;

    // Flash from page props (read via usePage or passed via AdminLayout)
    return (
        <AdminLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Users</h2>}>
            <Head title="Users" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {flash.success}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                            {flash.error}
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative w-64">
                            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search name or email…"
                                value={search}
                                onChange={handleSearch}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            />
                        </div>

                        {/* Role filter */}
                        <select
                            value={role}
                            onChange={handleRole}
                            className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-indigo-400 focus:outline-none"
                        >
                            <option value="">All roles</option>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                        </select>

                        {/* Specialization filter */}
                        {specializations.length > 0 && (
                            <select
                                value={specId}
                                onChange={handleSpec}
                                className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-indigo-400 focus:outline-none"
                            >
                                <option value="">All specializations</option>
                                {specializations.map((s) => (
                                    <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                                ))}
                            </select>
                        )}

                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
                            >
                                Clear
                            </button>
                        )}

                        <p className="ml-auto text-sm text-gray-500 shrink-0">
                            {users.total} user{users.total !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">#</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Role</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Specialization</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Joined</th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user, index) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-3.5 text-sm text-gray-400">
                                                    {(users.current_page - 1) * users.per_page + index + 1}
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5 text-sm text-gray-600">{user.email}</td>

                                                <td className="px-5 py-3.5">
                                                    <RoleBadge role={user.role} />
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <SpecBadge
                                                        specialization={user.specialization}
                                                        semester={user.semester}
                                                    />
                                                </td>

                                                <td className="px-5 py-3.5 text-sm text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString('en-GB', {
                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                    })}
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <ActionRow user={user} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {users.last_page > 1 && (
                            <div className="border-t border-gray-100 px-6 py-4">
                                <Pagination links={users.links} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
