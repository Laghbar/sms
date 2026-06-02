import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
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
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${
                    selected ? `bg-${color}-100` : 'bg-gray-100'
                }`}
            >
                {icon}
            </div>
            <div>
                <p className={`font-semibold ${selected ? `text-${color}-700` : 'text-gray-800'}`}>
                    {label}
                </p>
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

export default function BulkImport() {
    const { flash } = usePage().props;
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

    const exampleHeaders = ['name', 'email', 'password'];

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Bulk Import Users
                </h2>
            }
        >
            <Head title="Bulk Import" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Success message */}
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
                            <h3 className="mb-1 text-base font-semibold text-gray-900">
                                Step 1 — Select user type
                            </h3>
                            <p className="mb-4 text-sm text-gray-500">
                                Choose the role for the users you are importing.
                            </p>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <RoleCard
                                    role="teacher"
                                    label="Teachers"
                                    description="Import teaching staff accounts"
                                    icon="👩‍🏫"
                                    color="blue"
                                    selected={selectedRole === 'teacher'}
                                    onSelect={handleRoleSelect}
                                />
                                <RoleCard
                                    role="student"
                                    label="Students"
                                    description="Import student accounts"
                                    icon="🎓"
                                    color="green"
                                    selected={selectedRole === 'student'}
                                    onSelect={handleRoleSelect}
                                />
                            </div>

                            {errors.role && (
                                <p className="mt-2 text-sm text-red-600">{errors.role}</p>
                            )}
                        </div>

                        {/* Step 2: Upload File */}
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h3 className="mb-1 text-base font-semibold text-gray-900">
                                Step 2 — Upload Excel file
                            </h3>
                            <p className="mb-4 text-sm text-gray-500">
                                Accepted formats: <span className="font-medium">.xlsx, .xls, .csv</span>. Max size: 10 MB.
                            </p>

                            {/* Expected format hint */}
                            <div className="mb-4 rounded-lg bg-gray-50 p-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Expected columns (first row = header)
                                </p>
                                <div className="flex gap-2">
                                    {exampleHeaders.map((h) => (
                                        <span
                                            key={h}
                                            className="rounded bg-white px-2 py-1 text-xs font-mono border border-gray-200 text-gray-700"
                                        >
                                            {h}
                                        </span>
                                    ))}
                                </div>
                                <p className="mt-2 text-xs text-gray-400">
                                    <em>password</em> is optional — a random one is generated if omitted.
                                </p>
                            </div>

                            <label
                                htmlFor="file-input"
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition ${
                                    data.file
                                        ? 'border-indigo-400 bg-indigo-50'
                                        : 'border-gray-300 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                                }`}
                            >
                                <svg className="mb-3 h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                {data.file ? (
                                    <p className="text-sm font-medium text-indigo-700">{data.file.name}</p>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-gray-700">
                                            Click to upload or drag & drop
                                        </p>
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

                            {errors.file && (
                                <p className="mt-2 text-sm text-red-600">{errors.file}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing || !selectedRole || !data.file}
                            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Importing…' : 'Import Users'}
                        </button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
