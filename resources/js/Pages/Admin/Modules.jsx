import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

/* ── Shared field style ──────────────────────────────────────────────── */
const F = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';

const DAY_OPTS = ['monday','tuesday','wednesday','thursday','friday','saturday'];
const TYPE_COLORS = {
    cours: 'bg-indigo-100 text-indigo-700',
    td:    'bg-amber-100 text-amber-700',
    tp:    'bg-emerald-100 text-emerald-700',
};
const DAY_ABBR = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat' };

/* ── Module form (create / edit) ─────────────────────────────────────── */
function ModuleForm({ module, teachers, specializations, prefillSpecId, prefillSemId, onClose }) {
    const isEdit = !!module;

    const { data, setData, post, put, errors, processing } = useForm({
        name:              module?.name            ?? '',
        code:              module?.code            ?? '',
        coefficient:       module?.coefficient     ?? 1,
        specialization_id: module?.specialization_id ?? prefillSpecId ?? '',
        semester_id:       module?.semester_id     ?? prefillSemId   ?? '',
        teacher_id:        module?.teacher_id      ?? '',
        description:       module?.description     ?? '',
    });

    const selectedSpec  = specializations.find((s) => String(s.id) === String(data.specialization_id));
    const semesterList  = selectedSpec?.semesters ?? [];

    function handleSpecChange(val) {
        setData((prev) => ({ ...prev, specialization_id: val, semester_id: '' }));
    }

    function submit(e) {
        e.preventDefault();
        const opts = { onSuccess: onClose };
        isEdit ? put(route('admin.modules.update', module.id), opts)
               : post(route('admin.modules.store'), opts);
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Module Name</label>
                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g. Algorithmique Avancée" className={F} autoFocus />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Code</label>
                <input type="text" value={data.code} onChange={(e) => setData('code', e.target.value.toUpperCase())}
                    placeholder="e.g. GI-ALGO2-S3" className={F + ' font-mono'} />
                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Specialization</label>
                <select value={data.specialization_id} onChange={(e) => handleSpecChange(e.target.value)} className={F}>
                    <option value="">— Select specialization —</option>
                    {specializations.map((s) => (
                        <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                    ))}
                </select>
                {errors.specialization_id && <p className="mt-1 text-xs text-red-500">{errors.specialization_id}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Semester</label>
                <select value={data.semester_id} onChange={(e) => setData('semester_id', e.target.value)}
                    className={F} disabled={!data.specialization_id}>
                    <option value="">— Select semester —</option>
                    {semesterList.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                {errors.semester_id && <p className="mt-1 text-xs text-red-500">{errors.semester_id}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Coefficient</label>
                <select value={data.coefficient} onChange={(e) => setData('coefficient', Number(e.target.value))} className={F}>
                    {[1,2,3,4,5,6].map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                {errors.coefficient && <p className="mt-1 text-xs text-red-500">{errors.coefficient}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Teacher <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <select value={data.teacher_id} onChange={(e) => setData('teacher_id', e.target.value)} className={F}>
                    <option value="">— No teacher assigned —</option>
                    {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                {errors.teacher_id && <p className="mt-1 text-xs text-red-500">{errors.teacher_id}</p>}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)}
                    className={F} rows={3} placeholder="Brief description…" />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                    Cancel
                </button>
                <button type="submit" disabled={processing}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {processing ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Module'}
                </button>
            </div>
        </form>
    );
}

/* ── Sessions modal content ──────────────────────────────────────────── */
function SessionsPanel({ module, onClose }) {
    const { data, setData, post, reset, errors, processing } = useForm({
        day:         'monday',
        type:        'cours',
        start_time:  '',
        end_time:    '',
        room:        '',
        week_parity: 'all',
    });
    const [deletingId, setDeletingId] = useState(null);

    function addSession(e) {
        e.preventDefault();
        post(route('admin.modules.schedules.store', module.id), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    function removeSession(scheduleId) {
        setDeletingId(scheduleId);
        router.delete(route('admin.modules.schedules.destroy', [module.id, scheduleId]), {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    }

    return (
        <div>
            {/* Existing sessions list */}
            {module.schedules?.length > 0 ? (
                <div className="mb-5 space-y-2">
                    {module.schedules.map(s => (
                        <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_COLORS[s.type]}`}>
                                    {s.type.toUpperCase()}
                                </span>
                                <span className="font-medium text-gray-700">{DAY_ABBR[s.day]}</span>
                                <span className="text-gray-500">
                                    {s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)}
                                </span>
                                <span className="text-gray-400">· {s.room}</span>
                                {s.week_parity !== 'all' && (
                                    <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-500">
                                        {s.week_parity} weeks
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => removeSession(s.id)}
                                disabled={deletingId === s.id}
                                className="ml-3 shrink-0 text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
                            >
                                {deletingId === s.id ? '…' : 'Remove'}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mb-5 text-sm text-gray-400 italic">No sessions assigned yet.</p>
            )}

            {/* Add session form */}
            <form onSubmit={addSession} className="space-y-3 border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Add Session</p>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Day</label>
                        <select value={data.day} onChange={e => setData('day', e.target.value)} className={F}>
                            {DAY_OPTS.map(d => (
                                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
                        <select value={data.type} onChange={e => setData('type', e.target.value)} className={F}>
                            <option value="cours">Cours</option>
                            <option value="td">TD</option>
                            <option value="tp">TP</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Start time</label>
                        <input type="time" value={data.start_time} onChange={e => setData('start_time', e.target.value)} className={F} />
                        {errors.start_time && <p className="mt-0.5 text-xs text-red-500">{errors.start_time}</p>}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">End time</label>
                        <input type="time" value={data.end_time} onChange={e => setData('end_time', e.target.value)} className={F} />
                        {errors.end_time && <p className="mt-0.5 text-xs text-red-500">{errors.end_time}</p>}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Room</label>
                        <input type="text" value={data.room} onChange={e => setData('room', e.target.value)}
                            placeholder="e.g. B-205" className={F} />
                        {errors.room && <p className="mt-0.5 text-xs text-red-500">{errors.room}</p>}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Week</label>
                        <select value={data.week_parity} onChange={e => setData('week_parity', e.target.value)} className={F}>
                            <option value="all">Every week</option>
                            <option value="odd">Odd weeks</option>
                            <option value="even">Even weeks</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-1">
                    <button type="button" onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                        Close
                    </button>
                    <button type="submit" disabled={processing}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                        {processing ? 'Adding…' : 'Add Session'}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ── Modal wrapper ───────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}>
                <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {children}
                </div>
            </div>
        </div>
    );
}

/* ── Delete confirm ──────────────────────────────────────────────────── */
function DeleteConfirm({ modId, onCancel }) {
    const [busy, setBusy] = useState(false);
    function confirm() {
        setBusy(true);
        router.delete(route('admin.modules.destroy', modId), {
            preserveScroll: true,
            onFinish: () => setBusy(false),
        });
    }
    return (
        <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5">
            <span className="text-[11px] text-red-700">Delete?</span>
            <button onClick={confirm} disabled={busy}
                className="rounded bg-red-600 px-1.5 py-0.5 text-[11px] font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {busy ? '…' : 'Yes'}
            </button>
            <button onClick={onCancel} className="text-[11px] text-gray-400 hover:text-gray-600">No</button>
        </div>
    );
}

/* ── Page ────────────────────────────────────────────────────────────── */
export default function Modules({ modules, teachers, specializations, filters }) {
    const { flash } = usePage().props;

    const [specId, setSpecId]     = useState(filters.specialization_id ?? '');
    const [semId,  setSemId]      = useState(filters.semester_id       ?? '');
    const [creating, setCreating] = useState(false);
    const [editing,  setEditing]  = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [schedulingModuleId, setSchedulingModuleId] = useState(null);

    // Always read from latest props so the sessions list refreshes after add/remove
    const schedulingModule = modules?.find(m => m.id === schedulingModuleId) ?? null;

    const selectedSpec  = specializations.find((s) => String(s.id) === String(specId));
    const semesterList  = selectedSpec?.semesters ?? [];

    function handleSpecChange(val) {
        setSpecId(val);
        setSemId('');
        router.get(route('admin.modules.index'),
            { specialization_id: val || undefined },
            { preserveState: true, replace: true }
        );
    }

    function handleSemChange(val) {
        setSemId(val);
        router.get(route('admin.modules.index'),
            { specialization_id: specId || undefined, semester_id: val || undefined },
            { preserveState: true, replace: true }
        );
    }

    const step = !specId ? 'pick-spec' : !semId ? 'pick-sem' : 'show';

    return (
        <AdminLayout header={
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold leading-tight text-gray-800">Modules</h2>
                {step === 'show' && modules != null && (
                    <button onClick={() => setCreating(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        New Module
                    </button>
                )}
            </div>
        }>
            <Head title="Modules" />

            {/* Create modal */}
            <Modal open={creating} onClose={() => setCreating(false)} title="Create Module">
                <ModuleForm
                    module={null}
                    teachers={teachers}
                    specializations={specializations}
                    prefillSpecId={specId}
                    prefillSemId={semId}
                    onClose={() => setCreating(false)}
                />
            </Modal>

            {/* Edit modal */}
            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Module">
                {editing && (
                    <ModuleForm
                        module={editing}
                        teachers={teachers}
                        specializations={specializations}
                        onClose={() => setEditing(null)}
                    />
                )}
            </Modal>

            {/* Sessions modal */}
            <Modal
                open={!!schedulingModule}
                onClose={() => setSchedulingModuleId(null)}
                title={schedulingModule ? `Sessions — ${schedulingModule.name}` : ''}
            >
                {schedulingModule && (
                    <SessionsPanel
                        module={schedulingModule}
                        onClose={() => setSchedulingModuleId(null)}
                    />
                )}
            </Modal>

            <div className="py-10">
                <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Flash */}
                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {flash.success}
                        </div>
                    )}

                    {/* ── Cascading selectors ── */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="mb-4 text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Select a specialization and semester to view modules
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-48">
                                <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">1</span>
                                    Specialization
                                </label>
                                <select value={specId} onChange={(e) => handleSpecChange(e.target.value)} className={F}>
                                    <option value="">— Choose specialization —</option>
                                    {specializations.map((s) => (
                                        <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1 min-w-48">
                                <label className={`mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${!specId ? 'text-gray-300' : 'text-gray-400'}`}>
                                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${!specId ? 'bg-gray-300' : 'bg-indigo-600'}`}>2</span>
                                    Semester
                                </label>
                                <select value={semId} onChange={(e) => handleSemChange(e.target.value)}
                                    className={F} disabled={!specId}>
                                    <option value="">— Choose semester —</option>
                                    {semesterList.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1 min-w-48 flex flex-col justify-end">
                                <label className={`mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${step !== 'show' ? 'text-gray-300' : 'text-gray-400'}`}>
                                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${step !== 'show' ? 'bg-gray-300' : 'bg-emerald-500'}`}>3</span>
                                    Modules
                                </label>
                                <div className={`rounded-lg border px-3 py-2 text-sm ${step !== 'show' ? 'border-gray-200 text-gray-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold'}`}>
                                    {step !== 'show'
                                        ? 'Waiting for selection…'
                                        : `${modules?.length ?? 0} module${(modules?.length ?? 0) !== 1 ? 's' : ''} found`}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Empty states ── */}
                    {step === 'pick-spec' && (
                        <div className="rounded-xl bg-white py-16 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
                                <svg className="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
                                </svg>
                            </div>
                            <p className="text-gray-500 font-medium">Select a specialization to get started</p>
                            <p className="mt-1 text-sm text-gray-400">Choose from the dropdown above</p>
                        </div>
                    )}

                    {step === 'pick-sem' && (
                        <div className="rounded-xl bg-white py-16 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
                                <svg className="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                            </div>
                            <p className="text-gray-500 font-medium">
                                <span className="font-bold text-indigo-600">{selectedSpec?.code}</span> selected — now choose a semester
                            </p>
                            <p className="mt-1 text-sm text-gray-400">{semesterList.length} semester{semesterList.length !== 1 ? 's' : ''} available</p>
                        </div>
                    )}

                    {/* ── Modules table ── */}
                    {step === 'show' && modules != null && (
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            {modules.length === 0 ? (
                                <div className="py-16 text-center">
                                    <p className="text-gray-400 text-sm">No modules in this semester yet.</p>
                                    <button onClick={() => setCreating(true)}
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                        Create the first module
                                    </button>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Module</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Code</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Teacher</th>
                                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Coeff</th>
                                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Students</th>
                                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Sessions</th>
                                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                            <th className="px-5 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {modules.map((mod) => (
                                            <tr key={mod.id} className="transition-colors hover:bg-gray-50">
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-semibold text-gray-900">{mod.name}</p>
                                                    {mod.description && (
                                                        <p className="mt-0.5 max-w-xs truncate text-xs text-gray-400">{mod.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">
                                                        {mod.code}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {mod.teacher_name
                                                        ? <span className="text-sm text-gray-700">{mod.teacher_name}</span>
                                                        : <span className="text-xs italic text-red-400">Unassigned</span>
                                                    }
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                                                        {mod.coefficient}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center text-sm text-gray-600">{mod.students_count}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <button
                                                        onClick={() => setSchedulingModuleId(mod.id)}
                                                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition hover:opacity-80
                                                            bg-violet-100 text-violet-700 hover:bg-violet-200"
                                                    >
                                                        🗓 {mod.schedules?.length ?? 0}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    {mod.is_published
                                                        ? <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Published</span>
                                                        : <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-600">Draft</span>
                                                    }
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={route('admin.modules.students', mod.id)}
                                                            className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50">
                                                            Students
                                                        </Link>
                                                        <button onClick={() => setEditing(mod)}
                                                            className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50">
                                                            Edit
                                                        </button>
                                                        {deletingId === mod.id
                                                            ? <DeleteConfirm modId={mod.id} onCancel={() => setDeletingId(null)} />
                                                            : <button onClick={() => setDeletingId(mod.id)}
                                                                className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50">
                                                                Delete
                                                              </button>
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </AdminLayout>
    );
}
