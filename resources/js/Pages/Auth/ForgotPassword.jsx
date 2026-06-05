import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status, admin_contact }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    function submit(e) {
        e.preventDefault();
        post(route('password.email'));
    }

    if (status) {
        return (
            <GuestLayout>
                <Head title="Forgot Password" />

                <div className="py-4 text-center">
                    <div className="mb-4 flex items-center justify-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">✅</span>
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">Admin Notified</h2>
                    <p className="mt-2 text-sm text-gray-600">{status}</p>

                    <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 space-y-2">
                        <p className="text-xs text-indigo-600">You can also reach the admin directly:</p>
                        {admin_contact && (
                            <a href={`mailto:${admin_contact}`} className="flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline">
                                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {admin_contact}
                            </a>
                        )}
                        <a href="tel:0644437034" className="flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline">
                            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            0644437034
                        </a>
                    </div>

                    <Link
                        href={route('login')}
                        className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                        ← Back to Login
                    </Link>
                </div>
            </GuestLayout>
        );
    }

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            {/* Header */}
            <div className="mb-6 text-center">
                <div className="mb-3 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-3xl">🔑</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Forgot your password?</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Contact your administrator to recover access to your account.
                </p>
            </div>

            {/* Contact admin box */}
            <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                    Admin Contact
                </p>
                {admin_contact && (
                    <a href={`mailto:${admin_contact}`} className="flex items-center gap-2 text-sm font-medium text-indigo-700 hover:underline">
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {admin_contact}
                    </a>
                )}
                <a href="tel:0644437034" className="flex items-center gap-2 text-sm font-medium text-indigo-700 hover:underline">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    0644437034
                </a>
            </div>

            {/* Divider */}
            <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-gray-400">or notify the admin automatically</span>
                </div>
            </div>

            {/* Notify admin form */}
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                        Your Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@example.com"
                        autoFocus
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-60"
                >
                    {processing ? 'Notifying…' : 'Notify Administrator'}
                </button>
            </form>

            <p className="mt-4 text-center">
                <Link href={route('login')} className="text-sm text-gray-500 hover:text-indigo-600">
                    ← Back to Login
                </Link>
            </p>
        </GuestLayout>
    );
}
