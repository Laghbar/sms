import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useState } from 'react';

function RoleCard({ role, label, description, icon, color, selected, onSelect }) {
    return (
        <button
            type="button"
            onClick={() => onSelect(role)}
            className={`flex w-full items-start gap-4 rounded-xl border-2 p-5 text-left transition ${
                selected
                    ? `border-${color}-500 bg-${color}-50`
                    : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
        >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${selected ? `bg-${color}-100` : 'bg-gray-100'}`}>
                {icon}
            </div>
            <div>
                <p className={`font-semibold ${selected ? `text-${color}-700` : 'text-gray-800'}`}>{label}</p>
                <p className="mt-0.5 text-sm text-gray-500">{description}</p>
            </div>
            {selected && (
                <div className={`ml-auto shrink-0 text-${color}-500`}>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
        </button>
    );
}

export default function BulkImport({ specializations = [], modules = [] }) {
    const { flash } = usePage().props;
    const { t } = useLanguage();
    const [selectedRole, setSelectedRole] = useState(null);
    const { data, setData, post, processing, errors, reset, progress } = useForm({
        role: '',
        file: null,
    });

    function handleRoleSelect(role) {
        setSelectedRole(role);
        setData('role', role);
    }

    function handleFileChange(e) {
        setData('file', e.target.files[0]);
    }

    function handleSubmit(e) {
        e.preventDefault();
        post(route('admin.bulk-import.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset('file');
                setSelectedRole(null);
                document.getElementById('file-input').value = '';
            },
        });
    }

    const isStudent = selectedRole === 'student';

    const isTeacher = selectedRole === 'teacher';

    const exampleHeaders = isStudent
        ? ['name', 'email', 'password', 'specialization', 'semester']
        : isTeacher
        ? ['name', 'email', 'password', 'modules']
        : ['name', 'email', 'password'];

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{t('bulk_import_title')}</h2>}>
            <Head title="Bulk Import" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {flash.success}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Step 1: Select Role */}
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h3 className="mb-1 text-base font-semibold text-gray-900">{t('step1_select_type')}</h3>
                            <p className="mb-4 text-sm text-gray-500">{t('step1_type_desc')}</p>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <RoleCard
                                    role="teacher" label={t('teachers_label')}
                                    description={t('import_teachers_desc')}
                                    icon="👩‍🏫" color="blue"
                                    selected={selectedRole === 'teacher'}
                                    onSelect={handleRoleSelect}
                                />
                                <RoleCard
                                    role="student" label={t('students_count')}
                                    description={t('import_students_desc')}
                                    icon="🎓" color="green"
                                    selected={selectedRole === 'student'}
                                    onSelect={handleRoleSelect}
                                />
                            </div>

                            {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
                        </div>

                        {/* Step 2: Upload File */}
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h3 className="mb-1 text-base font-semibold text-gray-900">{t('step2_upload_file')}</h3>
                            <p className="mb-4 text-sm text-gray-500">{t('step2_upload_desc')}</p>

                            {/* Expected columns hint */}
                            <div className="mb-4 rounded-lg bg-gray-50 p-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {t('expected_columns')}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {exampleHeaders.map((h) => (
                                        <span
                                            key={h}
                                            className={`rounded border px-2 py-1 font-mono text-xs ${
                                                h === 'specialization'
                                                    ? 'border-indigo-300 bg-indigo-100 text-indigo-700 font-semibold'
                                                    : 'border-gray-200 bg-white text-gray-700'
                                            }`}
                                        >
                                            {h}
                                        </span>
                                    ))}
                                </div>

                                <p className="mt-2 text-xs text-gray-400">
                                    <em>password</em> is optional — a random one is generated if omitted.
                                    {isStudent && (<><br /><em>semester</em> is optional — defaults to <strong>S2</strong> or <strong>S4</strong> (end of year) if omitted.</>)}
                                    {isTeacher && (<><br /><em>modules</em> is optional — comma-separated module codes, e.g. <strong>GI-ALG-S1, GI-MATH-S1</strong>.</>)}
                                </p>

                                {/* Specialization codes — only for students */}
                                {isStudent && specializations.length > 0 && (
                                    <div className="mt-3 border-t border-gray-200 pt-3">
                                        <p className="mb-1.5 text-xs font-semibold text-gray-500">
                                            Available <span className="font-mono">specialization</span> codes:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {specializations.map((s) => (
                                                <div key={s.id} className="flex items-center gap-1.5">
                                                    <span className="rounded bg-indigo-600 px-1.5 py-0.5 font-mono text-xs font-bold text-white">
                                                        {s.code}
                                                    </span>
                                                    <span className="text-xs text-gray-600">{s.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="mt-1.5 text-xs text-gray-400">
                                            Leave blank to import without academic assignment.
                                        </p>
                                    </div>
                                )}

                                {/* Module codes — only for teachers */}
                                {isTeacher && modules.length > 0 && (
                                    <div className="mt-3 border-t border-gray-200 pt-3">
                                        <p className="mb-1.5 text-xs font-semibold text-gray-500">
                                            Available <span className="font-mono">modules</span> codes:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {modules.map((m) => (
                                                <div key={m.id} className="flex items-center gap-1.5">
                                                    <span className="rounded bg-blue-600 px-1.5 py-0.5 font-mono text-xs font-bold text-white">
                                                        {m.code}
                                                    </span>
                                                    <span className="text-xs text-gray-600">{m.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="mt-1.5 text-xs text-gray-400">
                                            Separate multiple codes with a comma. Leave blank to import without module assignment.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* File drop zone */}
                            <label
                                htmlFor="file-input"
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition ${
                                    data.file
                                        ? 'border-indigo-400 bg-indigo-50'
                                        : 'border-gray-300 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                                }`}
                            >
                                <svg className="mb-3 h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                {data.file ? (
                                    <p className="text-sm font-medium text-indigo-700">{data.file.name}</p>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-gray-700">{t('click_upload_drag')}</p>
                                        <p className="text-xs text-gray-400">XLSX, XLS, CSV</p>
                                    </>
                                )}
                                <input
                                    id="file-input"
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileChange}
                                />
                            </label>

                            {progress && (
                                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className="h-2 rounded-full bg-indigo-500 transition-all"
                                        style={{ width: `${progress.percentage}%` }}
                                    />
                                </div>
                            )}

                            {errors.file && <p className="mt-2 text-sm text-red-600">{errors.file}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing || !selectedRole || !data.file}
                            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? t('importing_label') : t('import_users_btn')}
                        </button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
