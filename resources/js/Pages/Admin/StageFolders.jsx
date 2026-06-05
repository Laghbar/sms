import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const STATUS = {
    pending:    { label: 'En attente',  color: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-400' },
    processing: { label: 'En cours',    color: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500' },
    ready:      { label: 'Prêt',        color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
};

function StatusBadge({ status }) {
    const s = STATUS[status] ?? STATUS.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex gap-2 text-sm border-b border-gray-50 py-1.5">
            <span className="w-36 shrink-0 font-semibold text-gray-500">{label}</span>
            <span className="text-gray-800">{value || <span className="italic text-gray-300">—</span>}</span>
        </div>
    );
}

/* ── Side drawer ─────────────────────────────────────────────────────── */
function RequestDrawer({ req, onClose }) {
    const [tab, setTab] = useState('info');

    const statusForm = useForm({ status: req.status, admin_note: req.admin_note ?? '' });
    const uploadForm = useForm({ file: null });

    function saveStatus(e) {
        e.preventDefault();
        statusForm.patch(route('admin.stage-folders.status', req.id), { preserveScroll: true });
    }

    function uploadFile(e) {
        e.preventDefault();
        uploadForm.post(route('admin.stage-folders.upload', req.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    function deleteReq() {
        if (!window.confirm('Supprimer cette demande définitivement ?')) return;
        router.delete(route('admin.stage-folders.destroy', req.id), { onSuccess: onClose });
    }

    const F = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
            <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Demande #{req.id} · {req.created_at}</p>
                        <h3 className="mt-0.5 text-lg font-bold text-gray-900">{req.student.name}</h3>
                        <div className="mt-1"><StatusBadge status={req.status} /></div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    {[['info', 'Informations'], ['status', 'Statut'], ['upload', 'Uploader']].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition ${
                                tab === key
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}>{label}</button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                    {/* ── Info tab ── */}
                    {tab === 'info' && (
                        <>
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">Identité étudiant</p>
                                <div className="rounded-lg bg-indigo-50 px-4 py-2">
                                    <InfoRow label="Nom & Prénom"  value={req.student.name} />
                                    <InfoRow label="Email"         value={req.student.email} />
                                    <InfoRow label="Filière"       value={req.student.specialization} />
                                    <InfoRow label="Niveau"        value={req.student.semester} />
                                    <InfoRow label="Téléphone"     value={req.phone} />
                                </div>
                            </div>
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Détails du stage</p>
                                <div className="rounded-lg bg-gray-50 px-4 py-2">
                                    <InfoRow label="Entreprise"    value={req.company_name} />
                                    <InfoRow label="Adresse"       value={req.company_address} />
                                    <InfoRow label="Début"         value={req.internship_start} />
                                    <InfoRow label="Durée"         value={req.duration_weeks ? `${req.duration_weeks} semaines` : null} />
                                    {req.notes && <InfoRow label="Notes" value={req.notes} />}
                                </div>
                            </div>
                            {req.admin_note && (
                                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                                    <p className="text-xs font-semibold text-blue-500">Note admin</p>
                                    <p className="mt-1 text-sm text-blue-800">{req.admin_note}</p>
                                </div>
                            )}
                            {req.has_file && (
                                <a href={route('admin.stage-folders.download', req.id)}
                                    className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    {req.file_name}
                                </a>
                            )}
                            <button onClick={deleteReq}
                                className="w-full rounded-lg border border-red-200 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
                                Supprimer la demande
                            </button>
                        </>
                    )}

                    {/* ── Status tab ── */}
                    {tab === 'status' && (
                        <form onSubmit={saveStatus} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Statut</label>
                                <select value={statusForm.data.status}
                                    onChange={e => statusForm.setData('status', e.target.value)}
                                    className={F}>
                                    <option value="pending">En attente</option>
                                    <option value="processing">En cours de préparation</option>
                                    <option value="ready">Prêt</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Note pour l'étudiant <span className="font-normal text-gray-400">(optionnel)</span>
                                </label>
                                <textarea rows={4} value={statusForm.data.admin_note}
                                    onChange={e => statusForm.setData('admin_note', e.target.value)}
                                    placeholder="Message visible par l'étudiant…"
                                    className={F} />
                            </div>
                            <button type="submit" disabled={statusForm.processing}
                                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                                {statusForm.processing ? 'Enregistrement…' : 'Enregistrer'}
                            </button>
                        </form>
                    )}

                    {/* ── Upload tab ── */}
                    {tab === 'upload' && (
                        <form onSubmit={uploadFile} className="space-y-4">
                            <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
                                <svg className="mx-auto mb-2 h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                                <p className="text-sm font-medium text-gray-600">Dossier de stage généré</p>
                                <p className="mt-0.5 text-xs text-gray-400">PDF, DOC, DOCX ou ZIP — max 20 Mo</p>
                                <input type="file" accept=".pdf,.doc,.docx,.zip"
                                    onChange={e => uploadForm.setData('file', e.target.files[0])}
                                    className="mt-3 block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-indigo-700 hover:file:bg-indigo-100" />
                                {uploadForm.errors.file && <p className="mt-1 text-xs text-red-500">{uploadForm.errors.file}</p>}
                            </div>
                            {req.has_file && (
                                <p className="text-xs text-amber-600">⚠ Un fichier existe déjà ({req.file_name}). Il sera remplacé.</p>
                            )}
                            <button type="submit" disabled={uploadForm.processing || !uploadForm.data.file}
                                className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                                {uploadForm.processing ? 'Upload en cours…' : 'Uploader et notifier l\'étudiant'}
                            </button>
                            <p className="text-center text-xs text-gray-400">Le statut passera à "Prêt" et l'étudiant recevra une notification.</p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Main page ───────────────────────────────────────────────────────── */
export default function StageFolders({ requests, counts }) {
    const { flash } = usePage().props;
    const [filter, setFilter] = useState('all');
    const [selectedId, setSelectedId] = useState(null);

    const visible = filter === 'all' ? requests : requests.filter(r => r.status === filter);
    const drawerReq = selectedId ? (requests.find(r => r.id === selectedId) ?? null) : null;

    return (
        <AdminLayout header={
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold leading-tight text-gray-800">Dossiers de Stage</h2>
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">{counts.pending} en attente</span>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{counts.processing} en cours</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{counts.ready} prêts</span>
                </div>
            </div>
        }>
            <Head title="Dossiers de Stage" />

            {drawerReq && <RequestDrawer req={drawerReq} onClose={() => setSelectedId(null)} />}

            <div className="py-10">
                <div className="mx-auto max-w-5xl space-y-5 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {flash.success}
                        </div>
                    )}

                    {/* Filter tabs */}
                    <div className="flex gap-2">
                        {[['all', `Tous (${requests.length})`], ['pending', `En attente (${counts.pending})`], ['processing', `En cours (${counts.processing})`], ['ready', `Prêts (${counts.ready})`]].map(([key, label]) => (
                            <button key={key} onClick={() => setFilter(key)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                    filter === key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 shadow-sm hover:bg-gray-50'
                                }`}>{label}</button>
                        ))}
                    </div>

                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        {visible.length === 0 ? (
                            <div className="py-16 text-center text-sm text-gray-400">Aucune demande.</div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Étudiant</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Filière / Niveau</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Entreprise</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Demandé le</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Statut</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Fichier</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {visible.map(req => (
                                        <tr key={req.id} className="cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => setSelectedId(req.id)}>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                                        {req.student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{req.student.name}</p>
                                                        <p className="text-xs text-gray-400">{req.student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-xs font-medium text-gray-700">{req.student.specialization || '—'}</p>
                                                <p className="text-xs text-gray-400">{req.student.semester || '—'}</p>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                {req.company_name || <span className="italic text-gray-300">—</span>}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-500">{req.created_at}</td>
                                            <td className="px-5 py-4 text-center"><StatusBadge status={req.status} /></td>
                                            <td className="px-5 py-4 text-center">
                                                {req.has_file
                                                    ? <span className="text-xs font-semibold text-emerald-600">✓</span>
                                                    : <span className="text-xs text-gray-300">—</span>
                                                }
                                            </td>
                                            <td className="px-5 py-4 text-right text-xs font-medium text-indigo-600">
                                                Gérer →
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
