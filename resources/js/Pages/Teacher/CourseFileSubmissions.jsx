import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link } from '@inertiajs/react';

function formatSize(bytes) {
    if (bytes < 1024)        return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDateTime(str) {
    return new Date(str).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CourseFileSubmissions({ courseFile, submissions }) {
    const isPast = courseFile.due_date
        ? new Date(courseFile.due_date) < new Date(new Date().setHours(0, 0, 0, 0))
        : false;

    return (
        <TeacherLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('teacher.course-files.index')}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Course Files
                    </Link>
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Submissions — {courseFile.title}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {courseFile.module.name} ({courseFile.module.code})
                            {courseFile.due_date && (
                                <span className={`ml-2 font-medium ${isPast ? 'text-red-500' : 'text-green-600'}`}>
                                    · Deadline: {formatDate(courseFile.due_date)} ({isPast ? 'Closed' : 'Open'})
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Submissions – ${courseFile.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

                    {submissions.length === 0 ? (
                        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                            <p className="text-sm text-gray-400">No submissions yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                                <span className="text-sm font-semibold text-gray-600">
                                    {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">File</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Submitted</th>
                                        <th className="px-6 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {submissions.map((s) => (
                                        <tr key={s.id} className="transition-colors hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900">{s.student.name}</p>
                                                <p className="text-xs text-gray-400">{s.student.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="max-w-[200px] truncate text-sm text-gray-600">{s.file_name}</p>
                                                <p className="text-xs text-gray-400">{formatSize(s.file_size)}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDateTime(s.submitted_at)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={s.download_url}
                                                    className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                                                >
                                                    Download
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
}
