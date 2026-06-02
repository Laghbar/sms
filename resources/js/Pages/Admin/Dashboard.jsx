import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

function StatCard({ label, count, icon, color }) {
    return (
        <div className={`rounded-xl bg-white p-6 shadow-sm border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{count}</p>
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </div>
    );
}

export default function Dashboard({ stats }) {
    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Admin Dashboard
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <StatCard
                            label="Total Teachers"
                            count={stats.teachers}
                            icon="👩‍🏫"
                            color="border-blue-500"
                        />
                        <StatCard
                            label="Total Students"
                            count={stats.students}
                            icon="🎓"
                            color="border-green-500"
                        />
                        <StatCard
                            label="Total Admins"
                            count={stats.admins}
                            icon="🛡️"
                            color="border-purple-500"
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Quick Actions</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Link
                                href={route('admin.bulk-import.index')}
                                className="flex items-center gap-4 rounded-lg border border-gray-200 p-5 transition hover:border-indigo-400 hover:bg-indigo-50"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-2xl">
                                    📤
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Bulk Import Users</p>
                                    <p className="text-sm text-gray-500">
                                        Upload Excel file to add Teachers or Students
                                    </p>
                                </div>
                            </Link>

                            <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-5 opacity-50 cursor-not-allowed">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
                                    👥
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Manage Users</p>
                                    <p className="text-sm text-gray-500">Coming soon</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
