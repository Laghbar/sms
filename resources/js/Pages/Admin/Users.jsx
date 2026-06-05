import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

/* ── Badges ─────────────────────────────────────────────────────────── */
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
    if (!specialization) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-400">
                Not assigned
            </span>
        );
    }
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

function TeacherModules({ modules }) {
    if (!modules || modules.length === 0) {
        return <span className="text-xs text-gray-300">No module</span>;
    }
    return (
        <div className="flex flex-wrap gap-1">
            {modules.map((m) => (
                <span key={m.id}
                    className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-blue-700"
                    title={m.name}>
                    {m.code}
                </span>
            ))}
        </div>
    );
}

/* ── Pagination ──────────────────────────────────────────────────────── */
function Pagination({ links }) {
    return (
        <div className="flex flex-wrap justify-center gap-1">
            {links.map((link, i) =>
                link.url ? (
                    <Link key={i} href={link.url}
                        className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span key={i} className="rounded border border-gray-200 px-3 py-1 text-sm text-gray-300"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            )}
        </div>
    );
}

/* ── Edit modal ──────────────────────────────────────────────────────── */
function EditModal({ user, specializations, semesters, modules, onClose }) {
    const { data, setData, patch, processing, errors } = useForm({
        name:              user.name,
        specialization_id: user.specialization?.id ?? '',
        semester_id:       user.semester_id ?? '',
        module_ids:        user.teaching_modules?.map((m) => m.id) ?? [],
    });

    function toggleModule(id) {
        setData('module_ids', data.module_ids.includes(id)
            ? data.module_ids.filter((x) => x !== id)
            : [...data.module_ids, id]
        );
    }

    // Filter semesters by selected specialization
    const filteredSemesters = data.specialization_id
        ? semesters.filter((s) => String(s.specialization_id) === String(data.specialization_id))
        : semesters;

    // Reset semester when specialization changes
    function handleSpecChange(val) {
        setData((prev) => ({ ...prev, specialization_id: val, semester_id: '' }));
    }

    function submit(e) {
        e.preventDefault();
        patch(route('admin.users.update', user.id), { onSuccess: onClose });
    }

    const field = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className={`w-full ${user.role === 'teacher' ? 'max-w-lg' : 'max-w-md'} rounded-xl bg-white p-6 shadow-xl`} onClick={(e) => e.stopPropagation()}>
                <h3 className="mb-1 text-base font-semibold text-gray-900">Edit User</h3>
                <p className="mb-5 text-xs text-gray-400">{user.email}</p>

                <form onSubmit={submit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={field} />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* Specialization — students only */}
                    {user.role === 'student' && (
                        <>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Specialization
                                </label>
                                <select value={data.specialization_id}
                                    onChange={(e) => handleSpecChange(e.target.value)}
                                    className={field}>
                                    <option value="">— Not assigned —</option>
                                    {specializations.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.code} — {s.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.specialization_id && <p className="mt-1 text-xs text-red-500">{errors.specialization_id}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Semester
                                </label>
                                <select value={data.semester_id}
                                    onChange={(e) => setData('semester_id', e.target.value)}
                                    className={field}
                                    disabled={!data.specialization_id}>
                                    <option value="">— Select semester —</option>
                                    {filteredSemesters.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                {errors.semester_id && <p className="mt-1 text-xs text-red-500">{errors.semester_id}</p>}
                                {data.specialization_id && data.semester_id && (
                                    <p className="mt-1 text-xs text-indigo-500">
                                        Student will be auto-enrolled in all modules for this semester.
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Modules — teachers only */}
                    {user.role === 'teacher' && modules.length > 0 && (
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Modules taught
                                <span className="ml-1 text-xs font-normal text-gray-400">
                                    ({data.module_ids.length} selected)
                                </span>
                            </label>
                            <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                                {modules.map((m) => {
                                    const checked = data.module_ids.includes(m.id);
                                    return (
                                        <label key={m.id}
                                            className={`flex cursor-pointer items-center gap-3 px-3 py-2 transition hover:bg-gray-50 ${checked ? 'bg-blue-50' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleModule(m.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-blue-700">
                                                {m.code}
                                            </span>
                                            <span className="text-sm text-gray-700">{m.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.module_ids && <p className="mt-1 text-xs text-red-500">{errors.module_ids}</p>}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                            {processing ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Delete action ───────────────────────────────────────────────────── */
function DeleteAction({ user }) {
    const [confirm, setConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    function destroy() {
        setDeleting(true);
        router.delete(route('admin.users.destroy', user.id), {
            preserveScroll: true,
            onFinish: () => { setDeleting(false); setConfirm(false); },
        });
    }

    if (!confirm) {
        return (
            <button onClick={() => setConfirm(true)}
                className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50">
                Delete
            </button>
        );
    }

    return (
        <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2 py-1">
            <span className="text-[11px] text-red-700">Sure?</span>
            <button onClick={destroy} disabled={deleting}
                className="rounded bg-red-600 px-1.5 py-0.5 text-[11px] font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {deleting ? '…' : 'Yes'}
            </button>
            <button onClick={() => setConfirm(false)} className="text-[11px] text-gray-400 hover:text-gray-600">
                No
            </button>
        </div>
    );
}

/* ── Main page ───────────────────────────────────────────────────────── */
export default function Users({ users, filters, specializations = [], semesters = [], modules = [] }) {
    const { flash } = usePage().props;
    const [search, setSearch]   = useState(filters.search ?? '');
    const [role, setRole]       = useState(filters.role ?? '');
    const [specId, setSpecId]   = useState(filters.specialization_id ?? '');
    const [semId, setSemId]     = useState(filters.semester_id ?? '');
    const [editing, setEditing] = useState(null);

    const apply = useCallback((s, r, sp, sm) => {
        router.get(route('admin.users'), {
            search:            s  || undefined,
            role:              r  || undefined,
            specialization_id: sp || undefined,
            semester_id:       sm || undefined,
        }, { preserveState: true, replace: true });
    }, []);

    function handleSearch(e) { const v = e.target.value; setSearch(v); apply(v, role, specId, semId); }
    function handleRole(e)   { const v = e.target.value; setRole(v);   apply(search, v, specId, semId); }
    function handleSpec(e)   {
        const v = e.target.value;
        setSpecId(v);
        setSemId('');
        apply(search, role, v, '');
    }
    function handleSem(e)    { const v = e.target.value; setSemId(v);  apply(search, role, specId, v); }

    function clearFilters() {
        setSearch(''); setRole(''); setSpecId(''); setSemId('');
        apply('', '', '', '');
    }

    // Semesters visible in the filter (filtered by selected specialization)
    const visibleSemesters = specId
        ? semesters.filter((s) => String(s.specialization_id) === String(specId))
        : semesters;

    const hasFilters = search || role || specId || semId;

    // Count students without specialization
    const unassigned = users.data.filter((u) => u.role === 'student' && !u.specialization).length;

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Users</h2>}>
            <Head title="Users" />

            {editing && (
                <EditModal
                    user={editing}
                    specializations={specializations}
                    semesters={semesters}
                    modules={modules}
                    onClose={() => setEditing(null)}
                />
            )}

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">

                    {/* Flash */}
                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {flash.success}
                        </div>
                    )}

                    {/* Warning: unassigned students on this page */}
                    {unassigned > 0 && (
                        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            <svg className="h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            <span>
                                <strong>{unassigned}</strong> student{unassigned > 1 ? 's' : ''} on this page {unassigned > 1 ? 'have' : 'has'} no specialization assigned. Click <strong>Edit</strong> to assign one.
                            </span>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search */}
                        <div className="relative w-56">
                            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input type="text" placeholder="Search name or email…" value={search}
                                onChange={handleSearch}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                        </div>

                        {/* Role */}
                        <select value={role} onChange={handleRole}
                            className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-indigo-400 focus:outline-none">
                            <option value="">All roles</option>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                        </select>

                        {/* Specialization */}
                        {specializations.length > 0 && (
                            <select value={specId} onChange={handleSpec}
                                className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-indigo-400 focus:outline-none">
                                <option value="">All specializations</option>
                                {specializations.map((s) => (
                                    <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                                ))}
                            </select>
                        )}

                        {/* Semester — only shown when a specialization is selected (or always if multiple semesters) */}
                        {visibleSemesters.length > 0 && (
                            <select value={semId} onChange={handleSem}
                                className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-indigo-400 focus:outline-none">
                                <option value="">All semesters</option>
                                {visibleSemesters.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        )}

                        {/* Not assigned filter */}
                        <button
                            onClick={() => { setSpecId(''); setSemId(''); setRole('student'); apply(search, 'student', '', ''); }}
                            className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                role === 'student' && !specId
                                    ? 'border-amber-300 bg-amber-100 text-amber-700'
                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            Not assigned
                        </button>

                        {hasFilters && (
                            <button onClick={clearFilters}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50">
                                Clear
                            </button>
                        )}

                        <p className="ml-auto shrink-0 text-sm text-gray-500">
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
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Specialization / Modules</th>
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
                                            <tr key={user.id}
                                                className={`transition-colors hover:bg-gray-50 ${
                                                    user.role === 'student' && !user.specialization ? 'bg-amber-50/40' : ''
                                                }`}>
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
                                                <td className="px-5 py-3.5"><RoleBadge role={user.role} /></td>
                                                <td className="px-5 py-3.5">
                                                    {user.role === 'teacher'
                                                        ? <TeacherModules modules={user.teaching_modules} />
                                                        : <SpecBadge specialization={user.specialization} semester={user.semester} />
                                                    }
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString('en-GB', {
                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditing(user)}
                                                            className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                                                        >
                                                            Edit
                                                        </button>
                                                        <DeleteAction user={user} />
                                                    </div>
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
