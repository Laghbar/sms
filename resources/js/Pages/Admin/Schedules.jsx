import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

const SPEC_COLORS = [
    { bg: 'bg-indigo-600', light: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
    { bg: 'bg-emerald-600', light: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
    { bg: 'bg-amber-500',   light: 'bg-amber-50  border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100  text-amber-700'  },
    { bg: 'bg-rose-600',    light: 'bg-rose-50   border-rose-200',   text: 'text-rose-700',   badge: 'bg-rose-100   text-rose-700'   },
];

function FileIcon({ ext }) {
    const isPdf  = ext === 'pdf';
    const isWord = ['doc','docx'].includes(ext);
    if (isPdf)  return <span className="text-2xl">📄</span>;
    if (isWord) return <span className="text-2xl">📝</span>;
    return <span className="text-2xl">📎</span>;
}

function getExt(filename) {
    return filename?.split('.').pop().toLowerCase() ?? '';
}

function SemesterCard({ semester, color }) {
    const fileRef  = useRef(null);
    const [confirm, setConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({ file: null });

    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData('file', file);
        // Auto-submit on file pick
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
            {/* Header */}
            <div className="flex items-center gap-2">
                <span className={`rounded-lg ${color.bg} px-3 py-1 text-sm font-bold text-white`}>
                    {semester.name}
                </span>
                {semester.has_timetable && (
                    <span className={`rounded-full ${color.badge} px-2 py-0.5 text-[10px] font-semibold`}>
                        File uploaded
                    </span>
                )}
            </div>

            {/* File info or empty state */}
            {semester.has_timetable ? (
                <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm border border-gray-100">
                    <FileIcon ext={ext} />
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800">{semester.timetable_name}</p>
                        <p className="text-xs text-gray-400 uppercase">{ext} file</p>
                    </div>
                    <a
                        href={semester.timetable_url}
                        target="_blank"
                        rel="noreferrer"
                        className={`shrink-0 rounded-lg border ${color.light} px-2.5 py-1 text-xs font-medium ${color.text} hover:opacity-80`}
                    >
                        View
                    </a>
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-center">
                    <p className="text-xs text-gray-400">No timetable uploaded yet</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Upload / Replace button */}
                <label className={`flex-1 cursor-pointer rounded-lg border ${color.light} px-3 py-2 text-center text-xs font-semibold ${color.text} hover:opacity-80 transition`}>
                    {processing ? 'Uploading…' : semester.has_timetable ? 'Replace File' : 'Upload Timetable'}
                    <input
                        ref={fileRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFile}
                        disabled={processing}
                    />
                </label>

                {/* Delete */}
                {semester.has_timetable && !confirm && (
                    <button
                        onClick={() => setConfirm(true)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                        Remove
                    </button>
                )}
                {semester.has_timetable && confirm && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5">
                        <span className="text-[11px] text-red-700">Sure?</span>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="rounded bg-red-600 px-1.5 py-0.5 text-[11px] font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
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

function SpecCard({ spec, color }) {
    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {/* Spec header */}
            <div className={`${color.bg} px-6 py-4`}>
                <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-white/20 px-3 py-1 font-mono text-sm font-bold text-white">
                        {spec.code}
                    </span>
                    <h3 className="text-base font-semibold text-white">{spec.name}</h3>
                    <span className="ms-auto text-xs text-white/70">
                        {spec.semesters.length} semester{spec.semesters.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Semester cards grid */}
            <div className={`grid gap-4 p-5 ${spec.semesters.length >= 2 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                {spec.semesters.map(sem => (
                    <SemesterCard key={sem.id} semester={sem} color={color} />
                ))}
                {spec.semesters.length === 0 && (
                    <p className="col-span-2 text-center text-sm text-gray-400 py-4">No semesters configured.</p>
                )}
            </div>
        </div>
    );
}

export default function Schedules({ specializations }) {
    const { flash } = usePage().props;

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Timetable Management</h2>}>
            <Head title="Timetables" />

            <div className="py-10">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {flash.success}
                        </div>
                    )}

                    {/* Info banner */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-700">
                        <strong>How it works:</strong> Upload a Word (.docx) or PDF file for each semester.
                        Students will see a download button on their Schedule page to get their timetable.
                        Accepted formats: <span className="font-mono font-bold">.pdf .doc .docx</span>
                    </div>

                    {specializations.length === 0 ? (
                        <div className="rounded-xl bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
                            No specializations found.
                        </div>
                    ) : (
                        specializations.map((spec, i) => (
                            <SpecCard
                                key={spec.id}
                                spec={spec}
                                color={SPEC_COLORS[i % SPEC_COLORS.length]}
                            />
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
