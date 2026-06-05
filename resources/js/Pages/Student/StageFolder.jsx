import StudentLayout from '@/Layouts/StudentLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';

const STATUS = {
    pending:    { label: 'En attente',   color: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-400',    step: 0 },
    processing: { label: 'En cours',     color: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500',     step: 1 },
    ready:      { label: 'Prêt',         color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', step: 2 },
};

function Timeline({ status }) {
    const steps = [
        { key: 'pending',    label: 'Demande envoyée' },
        { key: 'processing', label: 'En préparation' },
        { key: 'ready',      label: 'Prêt à télécharger' },
    ];
    const current = STATUS[status]?.step ?? 0;

    return (
        <div className="flex items-start gap-0">
            {steps.map((s, i) => (
                <div key={s.key} className="flex flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                        {i > 0 && <div className={`h-0.5 flex-1 ${i <= current ? 'bg-indigo-500' : 'bg-gray-200'}`} />}
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                            i < current  ? 'bg-indigo-600 text-white' :
                            i === current ? `${STATUS[status].dot} text-white` :
                                           'bg-gray-200 text-gray-400'
                        }`}>
                            {i < current ? '✓' : i + 1}
                        </div>
                        {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${i < current ? 'bg-indigo-500' : 'bg-gray-200'}`} />}
                    </div>
                    <p className={`mt-1.5 text-center text-[11px] font-medium ${i === current ? 'text-indigo-600' : i < current ? 'text-gray-600' : 'text-gray-400'}`}>
                        {s.label}
                    </p>
                </div>
            ))}
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex gap-2 text-sm">
            <span className="w-40 shrink-0 font-semibold text-gray-700">{label} :</span>
            <span className="text-gray-600">{value || '—'}</span>
        </div>
    );
}

export default function StageFolder({ student_info, folderRequest }) {
    const { flash } = usePage().props;
    const F = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';

    const { data, setData, post, processing, errors, reset } = useForm({
        phone:            '',
        company_name:     '',
        company_address:  '',
        internship_start: '',
        duration_weeks:   '',
        notes:            '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('student.stage-folder.store'), { onSuccess: () => reset() });
    }

    function cancel() {
        if (!window.confirm('Annuler votre demande ?')) return;
        router.delete(route('student.stage-folder.cancel', folderRequest.id));
    }

    return (
        <StudentLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dossier de Stage</h2>}>
            <Head title="Dossier de Stage" />

            <div className="py-10">
                <div className="mx-auto max-w-2xl space-y-5 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {flash.success}
                        </div>
                    )}

                    {/* Student identity card — always visible */}
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4 space-y-1.5">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-400">Vos informations</p>
                        <InfoRow label="Nom & Prénom"   value={student_info.name} />
                        <InfoRow label="Email"          value={student_info.email} />
                        <InfoRow label="Filière"        value={student_info.specialization} />
                        <InfoRow label="Niveau"         value={student_info.semester} />
                    </div>

                    {folderRequest ? (
                        /* ── Existing request view ── */
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            <div className="bg-indigo-600 px-6 py-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">Demande #{folderRequest.id}</p>
                                <p className="mt-0.5 text-base font-bold text-white">Dossier de Stage Technique</p>
                            </div>

                            <div className="space-y-5 px-6 py-5">
                                <Timeline status={folderRequest.status} />

                                {/* Submitted details */}
                                <div className="space-y-1.5 rounded-lg bg-gray-50 px-4 py-3">
                                    <InfoRow label="Téléphone"   value={folderRequest.phone} />
                                    <InfoRow label="Entreprise"  value={folderRequest.company_name} />
                                    <InfoRow label="Adresse"     value={folderRequest.company_address} />
                                    <InfoRow label="Début stage" value={folderRequest.internship_start} />
                                    <InfoRow label="Durée"       value={folderRequest.duration_weeks ? `${folderRequest.duration_weeks} semaines` : null} />
                                    {folderRequest.notes && <InfoRow label="Notes" value={folderRequest.notes} />}
                                </div>

                                {/* Admin note */}
                                {folderRequest.admin_note && (
                                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Note de l'admin</p>
                                        <p className="mt-1 text-sm text-blue-800">{folderRequest.admin_note}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-1">
                                    {folderRequest.status === 'ready' && folderRequest.has_file && (
                                        <a href={route('student.stage-folder.download', folderRequest.id)}
                                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Télécharger mon dossier
                                        </a>
                                    )}
                                    {folderRequest.status === 'pending' && (
                                        <button onClick={cancel}
                                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
                                            Annuler la demande
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── Request form ── */
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-4">
                                <h3 className="text-base font-semibold text-gray-900">Demander un dossier de stage</h3>
                                <p className="mt-0.5 text-xs text-gray-400">Remplissez vos informations. L'admin préparera votre dossier et vous serez notifié.</p>
                            </div>

                            <form onSubmit={submit} className="space-y-4 px-6 py-5">
                                {/* Phone — required */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Téléphone <span className="text-red-500">*</span>
                                    </label>
                                    <input type="tel" value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        placeholder="ex: 06 12 34 56 78"
                                        className={F} />
                                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                                </div>

                                {/* Company */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Entreprise <span className="text-gray-400 font-normal">(optionnel)</span>
                                        </label>
                                        <input type="text" value={data.company_name}
                                            onChange={e => setData('company_name', e.target.value)}
                                            placeholder="ex: Sonatrach"
                                            className={F} />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Adresse entreprise <span className="text-gray-400 font-normal">(optionnel)</span>
                                        </label>
                                        <input type="text" value={data.company_address}
                                            onChange={e => setData('company_address', e.target.value)}
                                            placeholder="ex: Casablanca"
                                            className={F} />
                                    </div>
                                </div>

                                {/* Internship details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Date de début <span className="text-gray-400 font-normal">(optionnel)</span>
                                        </label>
                                        <input type="date" value={data.internship_start}
                                            onChange={e => setData('internship_start', e.target.value)}
                                            className={F} />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Durée (semaines) <span className="text-gray-400 font-normal">(optionnel)</span>
                                        </label>
                                        <input type="number" min="1" max="52" value={data.duration_weeks}
                                            onChange={e => setData('duration_weeks', e.target.value)}
                                            placeholder="ex: 8"
                                            className={F} />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Remarques <span className="text-gray-400 font-normal">(optionnel)</span>
                                    </label>
                                    <textarea rows={3} value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        placeholder="Informations supplémentaires pour l'admin…"
                                        className={F} />
                                </div>

                                <div className="flex justify-end pt-1">
                                    <button type="submit" disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                                        {processing ? 'Envoi…' : 'Envoyer la demande'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
