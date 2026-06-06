import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function AcademicYears({ years }) {
    const { t } = useLanguage();
    const { flash } = usePage().props;
    const [confirm, setConfirm] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name:       '',
        start_date: '',
        end_date:   '',
    });

    const F = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400';

    function submit(e) {
        e.preventDefault();
        post(route('admin.academic-years.store'), { onSuccess: () => reset() });
    }

    function setCurrent(year) {
        router.patch(route('admin.academic-years.set-current', year.id), {}, { preserveScroll: true });
        setConfirm(null);
    }

    function destroy(year) {
        router.delete(route('admin.academic-years.destroy', year.id), { preserveScroll: true });
    }

    const current = years.find(y => y.is_current);

    return (
        <AdminLayout header={
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">{t('academic_years_title')}</h2>
                    {current && (
                        <p className="mt-0.5 text-sm text-indigo-600 font-medium">
                            {t('active_year')} : <span className="font-bold">{current.name}</span>
                        </p>
                    )}
                </div>
            </div>
        }>
            <Head title="Années Universitaires" />

            {/* Confirm set-current dialog */}
            {confirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-base font-semibold text-gray-900">{t('confirm_activate')}</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            {t('confirm_activate_desc')}
                            <strong className="text-indigo-600"> {confirm.name}</strong>.{' '}
                            {t('existing_data_note')}
                        </p>
                        <div className="mt-4 flex justify-end gap-3">
                            <button onClick={() => setConfirm(null)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                                {t('cancel')}
                            </button>
                            <button onClick={() => setCurrent(confirm)}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                                {t('confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-10">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Flash */}
                    {flash?.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {flash.success}
                        </div>
                    )}

                    {/* Existing years */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-sm font-semibold text-gray-900">{t('all_years')}</h3>
                        </div>
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('year_name')}</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('period')}</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">{t('students_count')}</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">{t('grades_count')}</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">{t('attendance_count')}</th>
                                    <th className="px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {years.map(year => (
                                    <tr key={year.id} className={year.is_current ? 'bg-indigo-50/60' : 'hover:bg-gray-50'}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-900">{year.name}</span>
                                                {year.is_current && (
                                                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-gray-500">
                                            {year.start_date} → {year.end_date}
                                        </td>
                                        <td className="px-5 py-4 text-center text-sm font-semibold text-indigo-600">{year.students}</td>
                                        <td className="px-5 py-4 text-center text-sm font-semibold text-emerald-600">{year.grades}</td>
                                        <td className="px-5 py-4 text-center text-sm font-semibold text-amber-600">{year.attendances}</td>
                                        <td className="px-5 py-4 text-right">
                                            {!year.is_current && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setConfirm(year)}
                                                        className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50">
                                                        {t('activate')}
                                                    </button>
                                                    {year.students === 0 && year.grades === 0 && (
                                                        <button onClick={() => destroy(year)}
                                                            className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50">
                                                            {t('delete')}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Create new year */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-sm font-semibold text-gray-900">{t('create_year')}</h3>
                            <p className="mt-0.5 text-xs text-gray-400">{t('create_year_hint')}</p>
                        </div>
                        <form onSubmit={submit} className="grid gap-4 px-6 py-5 sm:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">{t('year_name')} <span className="text-red-500">*</span></label>
                                <input type="text" value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="ex: 2026-2027"
                                    className={F} />
                                {errors.name && <p className="mt-0.5 text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">{t('start_date')} <span className="text-red-500">*</span></label>
                                <input type="date" value={data.start_date}
                                    onChange={e => setData('start_date', e.target.value)}
                                    className={F} />
                                {errors.start_date && <p className="mt-0.5 text-xs text-red-500">{errors.start_date}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">{t('end_date')} <span className="text-red-500">*</span></label>
                                <input type="date" value={data.end_date}
                                    onChange={e => setData('end_date', e.target.value)}
                                    className={F} />
                                {errors.end_date && <p className="mt-0.5 text-xs text-red-500">{errors.end_date}</p>}
                            </div>
                            <div className="sm:col-span-3 flex justify-end">
                                <button type="submit" disabled={processing}
                                    className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                                    {processing ? t('loading') : t('create_year')}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Info box */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-700">
                        <p className="font-semibold">{t('how_it_works')}</p>
                        <ul className="mt-2 space-y-1 list-disc list-inside text-blue-600 text-xs">
                            <li>{t('year_info_1')}</li>
                            <li>{t('year_info_2')}</li>
                            <li>{t('year_info_3')}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
