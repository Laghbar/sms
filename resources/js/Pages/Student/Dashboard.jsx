import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Dashboard({ profile, modules, pending_tps }) {
    const { t } = useLanguage();
    const publishedCount = modules.filter(m => m.published).length;

    function daysLeft(dateStr) {
        const diff = Math.ceil((new Date(dateStr) - new Date().setHours(0, 0, 0, 0)) / 86400000);
        if (diff === 0) return t('today');
        if (diff === 1) return t('tomorrow');
        return t('in_days', { n: diff });
    }

    return (
        <StudentLayout header={
            <div>
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {t('hello')}, {profile.name.split(' ')[0]} 👋
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">{t('welcome')}</p>
            </div>
        }>
            <Head title="Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Identity card */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="bg-indigo-700 px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-white">{profile.name}</p>
                                    <p className="text-sm text-indigo-200">{profile.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-4">
                            {[
                                { label: t('specialization'), value: profile.filiere_code ?? '—', full: profile.specialization },
                                { label: t('level'),          value: profile.semester ?? '—' },
                                { label: t('modules_count'),  value: modules.length, sub: t('this_semester') },
                                { label: t('grades_published'),
                                  value: `${publishedCount}/${modules.length}`,
                                  sub: publishedCount === modules.length && modules.length > 0
                                        ? t('all_ready') : t('in_progress') },
                            ].map(item => (
                                <div key={item.label} className="bg-white px-5 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{item.label}</p>
                                    <p className="mt-1 text-xl font-bold text-gray-900" title={item.full}>{item.value}</p>
                                    {item.sub && <p className="text-xs text-gray-400">{item.sub}</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Modules table */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">
                                {t('my_modules')} — {profile.semester ?? ''}
                            </h3>
                            <Link href={route('student.results')} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                                {t('nav_results')} →
                            </Link>
                        </div>

                        {modules.length === 0 ? (
                            <p className="px-6 py-8 text-center text-sm text-gray-400">{t('no_modules')}</p>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-50">
                                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    <tr>
                                        <th className="px-5 py-3 text-left">{t('col_module')}</th>
                                        <th className="px-5 py-3 text-left">{t('teacher')}</th>
                                        <th className="px-5 py-3 text-center">{t('coefficient')}</th>
                                        <th className="px-5 py-3 text-center">{t('grade')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {modules.map(mod => (
                                        <tr key={mod.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-3">
                                                <p className="text-sm font-medium text-gray-900">{mod.name}</p>
                                                <p className="text-xs font-mono text-gray-400">{mod.code}</p>
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-500">{mod.teacher}</td>
                                            <td className="px-5 py-3 text-center">
                                                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                                                    {mod.coefficient}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                {mod.published
                                                    ? <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{t('published')}</span>
                                                    : <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-600">{t('pending_grade')}</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pending TPs */}
                    {pending_tps.length > 0 && (
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            <div className="border-b border-amber-100 bg-amber-50 px-6 py-4 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-amber-800">
                                    ⏰ {t('tps_due')} ({pending_tps.length})
                                </h3>
                                <Link href={route('student.course-files.index')} className="text-xs font-medium text-amber-700 hover:text-amber-900">
                                    {t('nav_course_files')} →
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {pending_tps.map(tp => (
                                    <div key={tp.id} className="flex items-center justify-between px-6 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{tp.title}</p>
                                            <p className="text-xs text-gray-400">{tp.module_name}</p>
                                        </div>
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            daysLeft(tp.due_date) === t('today')
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {daysLeft(tp.due_date)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick access */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[
                            { href: route('student.results'),           icon: '📊', label: t('nav_results'),       desc: t('desc_results') },
                            { href: route('student.attendance.index'),  icon: '📋', label: t('nav_attendance'),    desc: t('desc_attendance') },
                            { href: route('student.transcript'),        icon: '📄', label: t('nav_transcript'),    desc: t('desc_transcript') },
                            { href: route('student.stage-folder.index'),icon: '🗂️', label: t('nav_stage_folder'), desc: t('desc_stage_folder') },
                        ].map(item => (
                            <Link key={item.href} href={item.href}
                                className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center transition hover:border-indigo-300 hover:bg-indigo-50 shadow-sm">
                                <span className="text-3xl">{item.icon}</span>
                                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                                <p className="text-xs text-gray-400">{item.desc}</p>
                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </StudentLayout>
    );
}
