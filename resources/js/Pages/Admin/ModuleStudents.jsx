import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

function Avatar({ name }) {
    return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

export default function ModuleStudents({ module, enrolled, available }) {
    const [searchEnrolled,  setSearchEnrolled]  = useState('');
    const [searchAvailable, setSearchAvailable] = useState('');

    const filteredEnrolled = enrolled.filter(
        (s) =>
            s.name.toLowerCase().includes(searchEnrolled.toLowerCase()) ||
            s.email.toLowerCase().includes(searchEnrolled.toLowerCase())
    );

    const filteredAvailable = available.filter(
        (s) =>
            s.name.toLowerCase().includes(searchAvailable.toLowerCase()) ||
            s.email.toLowerCase().includes(searchAvailable.toLowerCase())
    );

    function enroll(studentId) {
        router.post(route('admin.modules.students.enroll', module.id), { student_id: studentId });
    }

    function unenroll(studentId) {
        router.delete(route('admin.modules.students.unenroll', [module.id, studentId]));
    }

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('admin.modules.index')}
                        className="text-sm text-gray-400 hover:text-gray-600"
                    >
                        Modules
                    </Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-sm font-medium text-gray-700">{module.name}</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-sm font-semibold text-gray-900">Student Enrollment</span>
                </div>
            }
        >
            <Head title={`Enroll Students — ${module.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Module info banner */}
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-6 py-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div>
                                <p className="text-lg font-bold text-indigo-900">{module.name}</p>
                                <p className="text-sm text-indigo-600">
                                    <span className="font-mono">{module.code}</span>
                                    &nbsp;·&nbsp;Semestre {module.semester}
                                    &nbsp;·&nbsp;Coeff. {module.coefficient}
                                </p>
                            </div>
                            <div className="ms-auto flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-sm">
                                <span className="text-2xl font-bold text-indigo-700">{enrolled.length}</span>
                                <span className="text-sm text-gray-500">étudiant{enrolled.length !== 1 ? 's' : ''} inscrit{enrolled.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">

                        {/* ── Enrolled students ── */}
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-5 py-4">
                                <h3 className="font-semibold text-gray-900">Inscrits</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Ces étudiants voient l'emploi du temps de ce module.
                                </p>
                            </div>

                            <div className="p-4 border-b border-gray-100">
                                <input
                                    type="text"
                                    placeholder="Rechercher…"
                                    value={searchEnrolled}
                                    onChange={(e) => setSearchEnrolled(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                />
                            </div>

                            <ul className="max-h-96 divide-y divide-gray-50 overflow-y-auto">
                                {filteredEnrolled.length === 0 ? (
                                    <li className="px-5 py-8 text-center text-sm text-gray-400">
                                        {enrolled.length === 0
                                            ? 'Aucun étudiant inscrit.'
                                            : 'Aucun résultat.'}
                                    </li>
                                ) : (
                                    filteredEnrolled.map((s) => (
                                        <li key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                                            <Avatar name={s.name} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">{s.name}</p>
                                                <p className="truncate text-xs text-gray-400">{s.email}</p>
                                            </div>
                                            <button
                                                onClick={() => unenroll(s.id)}
                                                className="shrink-0 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors"
                                            >
                                                Retirer
                                            </button>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                        {/* ── Available students ── */}
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-5 py-4">
                                <h3 className="font-semibold text-gray-900">Ajouter des étudiants</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {available.length} étudiant{available.length !== 1 ? 's' : ''} disponible{available.length !== 1 ? 's' : ''}.
                                </p>
                            </div>

                            <div className="p-4 border-b border-gray-100">
                                <input
                                    type="text"
                                    placeholder="Rechercher…"
                                    value={searchAvailable}
                                    onChange={(e) => setSearchAvailable(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                />
                            </div>

                            <ul className="max-h-96 divide-y divide-gray-50 overflow-y-auto">
                                {filteredAvailable.length === 0 ? (
                                    <li className="px-5 py-8 text-center text-sm text-gray-400">
                                        {available.length === 0
                                            ? 'Tous les étudiants sont déjà inscrits.'
                                            : 'Aucun résultat.'}
                                    </li>
                                ) : (
                                    filteredAvailable.map((s) => (
                                        <li key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                                            <Avatar name={s.name} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">{s.name}</p>
                                                <p className="truncate text-xs text-gray-400">{s.email}</p>
                                            </div>
                                            <button
                                                onClick={() => enroll(s.id)}
                                                className="shrink-0 rounded-lg border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                                            >
                                                Inscrire
                                            </button>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
