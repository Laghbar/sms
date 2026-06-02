import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="flex flex-col items-center gap-1">
                    <ApplicationLogo className="h-16 w-16 fill-current text-indigo-600" />
                    <span className="text-2xl font-bold tracking-tight text-gray-900">SMS</span>
                    <span className="text-xs text-gray-500 tracking-widest uppercase">Student Management System</span>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
