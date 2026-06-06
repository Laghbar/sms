import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link } from '@inertiajs/react';
import { useLanguage } from '@/i18n/LanguageContext';

function StatCard({ label, value, icon, color }) {
    return (
        <div className={`rounded-xl bg-white p-6 shadow-sm border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{value ?? '—'}</p>
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </div>
    );
}

export default function Dashboard({ stats }) {
    const { t } = useLanguage();

    return (
        <TeacherLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{t('teacher_dashboard')}</h2>}>
            <Head title={t('teacher_dashboard')} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <StatCard label={t('modules_taught')}       value={stats.modules}  icon="📚" color="border-indigo-500" />
                        <StatCard label={t('total_students_label')} value={stats.students} icon="🎓" color="border-green-500" />
                        <StatCard label={t('active_tps')}           value={stats.tps}      icon="🧪" color="border-amber-500" />
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">{t('quick_access')}</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {[
                                { href: route('teacher.modules'),  icon: '📖', title: t('nav_my_modules'), desc: t('my_modules_desc') },
                                { href: route('teacher.schedule'), icon: '🗓️', title: t('nav_schedule'),   desc: t('my_schedule_desc') },
                            ].map(item => (
                                <Link key={item.href} href={item.href}
                                    className="flex items-center gap-4 rounded-lg border border-gray-200 p-5 transition hover:border-indigo-400 hover:bg-indigo-50">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl">{item.icon}</div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.title}</p>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}
