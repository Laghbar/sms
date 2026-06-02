import StudentLayout from '@/Layouts/StudentLayout';
import { Head } from '@inertiajs/react';

function GradeCell({ grade }) {
    if (grade === undefined || grade === null) return <span className="text-gray-300">—</span>;
    const color = grade >= 16 ? 'text-green-600' : grade >= 10 ? 'text-gray-800' : 'text-red-600';
    return <span className={`font-semibold ${color}`}>{Number(grade).toFixed(2)}</span>;
}

function AverageBadge({ avg }) {
    if (avg === null || avg === undefined) return <span className="text-gray-300">—</span>;
    const color = avg >= 16 ? 'bg-green-100 text-green-700' : avg >= 10 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700';
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>
            {Number(avg).toFixed(2)} / 20
        </span>
    );
}

export default function Results({ modules }) {
    const overall = modules.length
        ? modules.filter(m => m.average !== null).reduce((sum, m) => sum + m.average * m.coefficient, 0) /
          modules.filter(m => m.average !== null).reduce((sum, m) => sum + m.coefficient, 0)
        : null;

    return (
        <StudentLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">My Results</h2>}>
            <Head title="My Results" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Overall average banner */}
                    {overall !== null && (
                        <div className={`rounded-xl p-5 text-center shadow-sm ${overall >= 10 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <p className="text-sm text-gray-500">Weighted Overall Average</p>
                            <p className={`text-4xl font-extrabold mt-1 ${overall >= 10 ? 'text-green-700' : 'text-red-700'}`}>
                                {overall.toFixed(2)} <span className="text-lg font-normal">/ 20</span>
                            </p>
                            <p className={`mt-1 text-sm font-medium ${overall >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                                {overall >= 10 ? '✓ Passing' : '✗ Failing'}
                            </p>
                        </div>
                    )}

                    {modules.length === 0 && (
                        <div className="rounded-xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
                            No results available yet.
                        </div>
                    )}

                    {[1, 2].map(sem => {
                        const semModules = modules.filter(m => m.semester === sem);
                        if (!semModules.length) return null;
                        return (
                            <div key={sem}>
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-400">Semester {sem}</h3>
                                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Module</th>
                                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Coef.</th>
                                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Exam</th>
                                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">CC</th>
                                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">TP</th>
                                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">TD</th>
                                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Average</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {semModules.map(mod => (
                                                    <tr key={mod.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-5 py-4">
                                                            <p className="text-sm font-medium text-gray-900">{mod.name}</p>
                                                            <p className="text-xs text-gray-400">{mod.code}</p>
                                                        </td>
                                                        <td className="px-5 py-4 text-center text-sm text-gray-600">{mod.coefficient}</td>
                                                        <td className="px-5 py-4 text-center text-sm"><GradeCell grade={mod.grades?.exam} /></td>
                                                        <td className="px-5 py-4 text-center text-sm"><GradeCell grade={mod.grades?.cc} /></td>
                                                        <td className="px-5 py-4 text-center text-sm"><GradeCell grade={mod.grades?.tp} /></td>
                                                        <td className="px-5 py-4 text-center text-sm"><GradeCell grade={mod.grades?.td} /></td>
                                                        <td className="px-5 py-4 text-center"><AverageBadge avg={mod.average} /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </StudentLayout>
    );
}
