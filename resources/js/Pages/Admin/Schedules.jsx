import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

/* ── Colour palette (cycles for each spec card) ──────────────────────── */
const SPEC_COLORS = [
    { bg: 'bg-indigo-600', light: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
    { bg: 'bg-emerald-600', light: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
    { bg: 'bg-amber-500',   light: 'bg-amber-50  border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100  text-amber-700'  },
    { bg: 'bg-rose-600',    light: 'bg-rose-50   border-rose-200',   text: 'text-rose-700',   badge: 'bg-rose-100   text-rose-700'   },
    { bg: 'bg-sky-600',     light: 'bg-sky-50    border-sky-200',    text: 'text-sky-700',    badge: 'bg-sky-100    text-sky-700'    },
    { bg: 'bg-violet-600',  light: 'bg-violet-50 border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700' },
];

/* ── Helpers ─────────────────────────────────────────────────────────── */
function FileIcon({ ext }) {
    if (ext === 'pdf')              return <span className="text-2xl">📄</span>;
    if (['doc','docx'].includes(ext)) return <span className="text-2xl">📝</span>;
    return <span className="text-2xl">📎</span>;
}
function getExt(filename) {
    return filename?.split('.').pop().toLowerCase() ?? '';
}

/* ── Create Specialization modal ─────────────────────────────────────── */
function CreateSpecModal({ onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name:        '',
        code:        '',
        description: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('admin.specializations.store'), {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    const field = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="mb-1 text-base font-semibold text-gray-900">New Specialization</h3>
                <p className="mb-5 text-xs text-gray-400">
                    Semesters S1 – S4 will be created automatically. You can then upload a timetable for each one.
                </p>

                <form onSubmit={submit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Génie Informatique"
                            className={field}
                            autoFocus
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* Code */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Code</label>
                        <input
                            type="text"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                            placeholder="e.g. GI"
                            maxLength={20}
                            className={field + ' font-mono uppercase'}
                        />
                        {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Description <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Short description of the specialization…"
                            rows={3}
                            className={field + ' resize-none'}
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                            {processing ? 'Creating…' : 'Create Specialization'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Semester timetable card ─────────────────────────────────────────── */
function SemesterCard({ semester, color }) {
    const fileRef = useRef(null);
    const [confirm, setConfirm]   = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { data, errors, reset } = useForm({ file: null });

    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        router.post(
            route('admin.schedules.upload', semester.id),
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => { reset('file'); if (fileRef.current) fileRef.current.value = ''; },
            }
        );
    }

    function handleDelete() {
        setDeleting(true);
        router.delete(route('admin.schedules.delete-timetable', semester.id), {
            preserveScroll: true,
            onFinish: () => { setDeleting(false); setConfirm(false); },
        });
    }

    const ext = getExt(semester.timetable_name);

    return (
        <div className={`rounded-xl border ${color.light} p-4 flex flex-col gap-3`}>
            <div className="flex items-center gap-2">
                <span className={`rounded-lg ${color.bg} px-3 py-1 text-sm font-bold text-white`}>
                    {semester.name}
                </span>
                {semester.has_timetable && (
                    <span className={`rounded-full ${color.badge} px-2 py-0.5 text-[10px] font-semibold`}>
                        Uploaded
                    </span>
                )}
            </div>

            {semester.has_timetable ? (
                <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm border border-gray-100">
                    <FileIcon ext={ext} />
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800">{semester.timetable_name}</p>
                        <p className="text-xs text-gray-400 uppercase">{ext} file</p>
                    </div>
                    <a href={semester.timetable_url} target="_blank" rel="noreferrer"
                        className={`shrink-0 rounded-lg border ${color.light} px-2.5 py-1 text-xs font-medium ${color.text} hover:opacity-80`}>
                        View
                    </a>
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-center">
                    <p className="text-xs text-gray-400">No timetable uploaded yet</p>
                </div>
            )}

            <div className="flex items-center gap-2">
                <label className={`flex-1 cursor-pointer rounded-lg border ${color.light} px-3 py-2 text-center text-xs font-semibold ${color.text} hover:opacity-80 transition`}>
                    {semester.has_timetable ? 'Replace File' : 'Upload Timetable'}
                    <input ref={fileRef} type="file" className="hidden"
                        accept=".pdf,.doc,.docx" onChange={handleFile} />
                </label>

                {semester.has_timetable && !confirm && (
                    <button onClick={() => setConfirm(true)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100">
                        Remove
                    </button>
                )}
                {semester.has_timetable && confirm && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5">
                        <span className="text-[11px] text-red-700">Sure?</span>
                        <button onClick={handleDelete} disabled={deleting}
                            className="rounded bg-red-600 px-1.5 py-0.5 text-[11px] font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                            {deleting ? '…' : 'Yes'}
                        </button>
                        <button onClick={() => setConfirm(false)} className="text-[11px] text-gray-400 hover:text-gray-600">No</button>
                    </div>
                )}
            </div>

            {errors.file && <p className="text-xs text-red-500">{errors.file}</p>}
        </div>
    );
}

/* ── Specialization card ─────────────────────────────────────────────── */
function SpecCard({ spec, color }) {
    const [confirmDel, setConfirmDel] = useState(false);
    const [deleting, setDeleting]     = useState(false);

    function handleDelete() {
        setDeleting(true);
        router.delete(route('admin.specializations.destroy', spec.id), {
            preserveScroll: true,
            onFinish: () => { setDeleting(false); setConfirmDel(false); },
        });
    }

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {/* Header */}
            <div className={`${color.bg} px-6 py-4`}>
                <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-white/20 px-3 py-1 font-mono text-sm font-bold text-white">
                        {spec.code}
                    </span>
                    <h3 className="text-base font-semibold text-white">{spec.name}</h3>
                    <span className="ms-auto text-xs text-white/70">
                        {spec.semesters.length} semester{spec.semesters.length !== 1 ? 's' : ''}
                    </span>

                    {/* Delete specialization */}
                    {!confirmDel ? (
                        <button
                            onClick={() => setConfirmDel(true)}
                            title="Delete specialization"
                            className="ml-2 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80 hover:bg-white/25 transition"
                        >
                            Delete
                        </button>
                    ) : (
                        <div className="ml-2 flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1">
                            <span className="text-[11px] text-white">Delete?</span>
                            <button onClick={handleDelete} disabled={deleting}
                                className="rounded bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                                {deleting ? '…' : 'Yes'}
                            </button>
                            <button onClick={() => setConfirmDel(false)} className="text-[11px] text-white/70 hover:text-white">No</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Semester cards */}
            <div className={`grid gap-4 p-5 ${spec.semesters.length >= 2 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                {spec.semesters.length === 0 ? (
                    <p className="col-span-2 py-4 text-center text-sm text-gray-400">No semesters configured.</p>
                ) : (
                    spec.semesters.map((sem) => (
                        <SemesterCard key={sem.id} semester={sem} color={color} />
                    ))
                )}
            </div>
        </div>
    );
}

/* ── Page ────────────────────────────────────────────────────────────── */
export default function Schedules({ specializations }) {
    const { flash }       = usePage().props;
    const [creating, setCreating] = useState(false);

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Timetable Management</h2>}>
            <Head title="Timetables" />

            {creating && <CreateSpecModal onClose={() => setCreating(false)} />}

            <div className="py-10">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Flash */}
                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {flash.success}
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="flex items-center justify-between">
                        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-3 text-sm text-blue-700 flex-1 mr-4">
                            <strong>How it works:</strong> Upload a PDF or Word file per semester.
                            Students see a download button on their Schedule page.
                            Accepted: <span className="font-mono font-bold">.pdf .doc .docx</span>
                        </div>
                        <button
                            onClick={() => setCreating(true)}
                            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            New Specialization
                        </button>
                    </div>

                    {/* Spec cards */}
                    {specializations.length === 0 ? (
                        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                            <p className="text-gray-400 text-sm">No specializations yet.</p>
                            <button onClick={() => setCreating(true)}
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                Create your first specialization
                            </button>
                        </div>
                    ) : (
                        specializations.map((spec, i) => (
                            <SpecCard key={spec.id} spec={spec} color={SPEC_COLORS[i % SPEC_COLORS.length]} />
                        ))
                    )}

                </div>
            </div>
        </AdminLayout>
    );
}
