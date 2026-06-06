import StudentLayout from '@/Layouts/StudentLayout';
import { Head } from '@inertiajs/react';
import { useLanguage } from '@/i18n/LanguageContext';

function gradeColor(g) {
    if (g === null) return 'text-gray-400';
    if (g >= 16) return 'text-emerald-700 font-bold';
    if (g >= 14) return 'text-emerald-600 font-semibold';
    if (g >= 10) return 'text-gray-800';
    return 'text-red-600 font-semibold';
}

export default function Transcript({ student, year, modules, average, attendance }) {
    const { t } = useLanguage();

    function mention(avg) {
        if (avg === null) return { label: '—', color: 'text-gray-400' };
        if (avg >= 18)   return { label: t('mention_excellent'),  color: 'text-emerald-700' };
        if (avg >= 16)   return { label: t('mention_tres_bien'),  color: 'text-emerald-600' };
        if (avg >= 14)   return { label: t('mention_bien'),       color: 'text-blue-600' };
        if (avg >= 12)   return { label: t('mention_assez_bien'), color: 'text-indigo-600' };
        if (avg >= 10)   return { label: t('mention_passable'),   color: 'text-amber-600' };
        return             { label: t('mention_insuffisant'),      color: 'text-red-600' };
    }

    const m = mention(average);
    const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const publishedModules = modules.filter(r => r.published);
    const allReady = modules.length > 0 && modules.every(r => r.grade !== null);

    return (
        <StudentLayout header={
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold leading-tight text-gray-800">{t('transcript_title')}</h2>
                <button
                    onClick={() => allReady && window.print()}
                    disabled={!allReady}
                    title={!allReady ? t('grades_not_ready') : ''}
                    className={`no-print inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                        allReady
                            ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                            : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.75 19.5m10.56-5.671L17.25 19.5M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18" />
                    </svg>
                    {t('all_grades_ready')}
                </button>
            </div>
        }>
            <Head title="Mon Relevé de Notes" />

            {/* Print styles */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    nav, header { display: none !important; }
                    body { background: white !important; }
                    .print-container {
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                    }
                    .page-break { page-break-before: always; }
                }
            `}</style>

            <div className="py-10">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8 print-container">

                    {/* ── Document header ── */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        {/* Top bar */}
                        <div className="bg-indigo-700 px-6 py-5 text-center text-white">
                            <p className="text-xs font-semibold uppercase tracking-widest opacity-75">
                                École Supérieure de Technologie
                            </p>
                            <h1 className="mt-1 text-xl font-bold tracking-wide">Relevé de Notes</h1>
                            <p className="mt-0.5 text-sm opacity-75">Année universitaire {year}</p>
                        </div>

                        {/* Student info grid */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 px-6 py-5">
                            {[
                                { label: t('name_surname'),   value: student.name },
                                { label: t('email'),           value: student.email },
                                { label: t('field_of_study'),  value: student.specialization ?? '—' },
                                { label: t('level'),           value: student.semester ?? '—' },
                                { label: t('edition_date'),    value: today },
                            ].map(row => (
                                <div key={row.label} className="flex gap-2 text-sm border-b border-gray-50 py-1">
                                    <span className="w-36 shrink-0 font-semibold text-gray-500">{row.label}</span>
                                    <span className="text-gray-800">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Grades table ── */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-900">{t('grades_by_module')}</h2>
                            <span className="text-xs text-gray-400">{publishedModules.length} module(s) publiés</span>
                        </div>

                        <table className="min-w-full">
                            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <tr>
                                    <th className="px-5 py-3 text-left">Module</th>
                                    <th className="px-5 py-3 text-left">{t('teacher')}</th>
                                    <th className="px-5 py-3 text-center">{t('coefficient')}</th>
                                    <th className="px-5 py-3 text-center">{t('grade')} /20</th>
                                    <th className="px-5 py-3 text-center">{t('mention')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {modules.map(mod => (
                                    <tr key={mod.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3">
                                            <p className="text-sm font-medium text-gray-900">{mod.name}</p>
                                            <p className="text-xs text-gray-400 font-mono">{mod.code}</p>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-gray-500">{mod.teacher}</td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                                                {mod.coefficient}
                                            </span>
                                        </td>
                                        <td className={`px-5 py-3 text-center text-sm ${gradeColor(mod.grade)}`}>
                                            {mod.grade !== null
                                                ? mod.grade.toFixed(2)
                                                : <span className="text-xs italic text-gray-400">
                                                    {mod.published ? 'Not graded' : t('pending_grade')}
                                                  </span>
                                            }
                                        </td>
                                        <td className={`px-5 py-3 text-center text-xs font-semibold ${mention(mod.grade).color}`}>
                                            {mention(mod.grade).label}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                            {/* Average footer */}
                            <tfoot className="bg-indigo-50">
                                <tr>
                                    <td colSpan={2} className="px-5 py-3 text-sm font-semibold text-indigo-800">
                                        {t('weighted_average')}
                                    </td>
                                    <td className="px-5 py-3 text-center text-xs text-indigo-500">
                                        {modules.filter(mod => mod.grade !== null).reduce((s, mod) => s + mod.coefficient, 0)} coeff.
                                    </td>
                                    <td className="px-5 py-3 text-center text-lg font-bold text-indigo-700">
                                        {average !== null ? average.toFixed(2) : '—'}
                                    </td>
                                    <td className={`px-5 py-3 text-center text-sm font-bold ${m.color}`}>
                                        {m.label}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* ── Attendance summary ── */}
                    {attendance.total > 0 && (
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-3">
                                <h2 className="text-sm font-semibold text-gray-900">{t('attendance_summary')}</h2>
                            </div>
                            <div className="grid grid-cols-5 divide-x divide-gray-100 text-center">
                                {[
                                    { label: t('total_sessions'),  value: attendance.total,   color: 'text-gray-700' },
                                    { label: t('present'),         value: attendance.present,  color: 'text-emerald-600' },
                                    { label: t('absent'),          value: attendance.absent,   color: 'text-red-600' },
                                    { label: t('late'),            value: attendance.late,     color: 'text-amber-600' },
                                    { label: t('attendance_rate_col'),
                                      value: attendance.rate !== null ? `${attendance.rate}%` : '—',
                                      color: attendance.rate === null ? 'text-gray-400'
                                           : attendance.rate >= 80 ? 'text-emerald-600'
                                           : attendance.rate >= 60 ? 'text-amber-500'
                                           : 'text-red-600' },
                                ].map(s => (
                                    <div key={s.label} className="px-3 py-4">
                                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Signature zone (print only) ── */}
                    <div className="hidden print:block mt-12">
                        <div className="flex justify-between text-sm text-gray-600 px-2">
                            <div className="text-center">
                                <div className="h-16 border-b border-gray-400 w-40" />
                                <p className="mt-1 text-xs">{t('signature_student')}</p>
                            </div>
                            <div className="text-center">
                                <div className="h-16 border-b border-gray-400 w-40" />
                                <p className="mt-1 text-xs">{t('signature_admin')}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Info note ── */}
                    <p className="no-print text-center text-xs text-gray-400">
                        Cliquez sur « Imprimer / Enregistrer PDF » pour télécharger ce document. Seules les notes publiées par les enseignants apparaissent.
                    </p>

                </div>
            </div>
        </StudentLayout>
    );
}
