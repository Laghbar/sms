import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="mb-5 text-lg font-semibold text-gray-900">{title}</h3>
                {children}
            </div>
        </div>
    );
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function Announcements({ announcements }) {
    const [prompt, setPrompt]       = useState('');
    const [generating, setGenerating] = useState(false);
    const [aiError, setAiError]     = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title:   '',
        content: '',
        prompt:  '',
    });

    async function generate() {
        if (!prompt.trim()) return;
        setGenerating(true);
        setAiError('');

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.content;
            const res = await fetch(route('admin.announcements.generate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const json = await res.json();

            if (!res.ok) {
                setAiError(json.error ?? 'Generation failed.');
                return;
            }

            setData({ title: json.title, content: json.content, prompt });
        } catch {
            setAiError('Network error. Please try again.');
        } finally {
            setGenerating(false);
        }
    }

    function publish(e) {
        e.preventDefault();
        post(route('admin.announcements.store'), {
            onSuccess: () => { reset(); setPrompt(''); },
        });
    }

    function confirmDelete(id) {
        router.delete(route('admin.announcements.destroy', id), {
            onFinish: () => setDeletingId(null),
        });
    }

    const hasPreview = data.title || data.content;

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">Announcements</h2>
            }
        >
            <Head title="Announcements" />

            <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Announcement">
                <p className="mb-6 text-sm text-gray-600">
                    This announcement will be removed for all users. Are you sure?
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setDeletingId(null)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => confirmDelete(deletingId)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </Modal>

            <div className="py-12">
                <div className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* ── AI Generator ── */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-lg text-white shadow">
                                    ✦
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Generate with AI</h3>
                                    <p className="text-xs text-gray-500">Describe the event — Claude will write the announcement.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Describe the event or information
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows={3}
                                    placeholder="e.g. End-of-semester exams start June 20th. Students must bring their student card and arrive 15 minutes early. No electronic devices allowed."
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                />
                                {aiError && (
                                    <p className="mt-1 text-xs text-red-500">{aiError}</p>
                                )}
                            </div>

                            <button
                                onClick={generate}
                                disabled={generating || !prompt.trim()}
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {generating ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Generating…
                                    </>
                                ) : (
                                    <>✦ Generate Announcement</>
                                )}
                            </button>
                        </div>

                        {/* Preview / Edit & Publish */}
                        {hasPreview && (
                            <form onSubmit={publish} className="border-t border-gray-100 p-6 space-y-4 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-700">Preview & Edit</p>
                                    <button
                                        type="button"
                                        onClick={() => { reset(); setPrompt(''); }}
                                        className="text-xs text-gray-400 hover:text-gray-600"
                                    >
                                        Clear
                                    </button>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">Title</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                    />
                                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">Content</label>
                                    <textarea
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        rows={6}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm leading-relaxed focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                    />
                                    {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                                    >
                                        {processing ? 'Publishing…' : '📢 Publish to All Users'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* ── Published Announcements ── */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-gray-600">
                            Published Announcements ({announcements.length})
                        </h3>

                        {announcements.length === 0 ? (
                            <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
                                No announcements published yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {announcements.map((ann) => (
                                    <div key={ann.id} className="rounded-xl bg-white p-5 shadow-sm">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-900">{ann.title}</p>
                                                <p className="mt-1 text-sm text-gray-500 line-clamp-2 whitespace-pre-line">
                                                    {ann.content}
                                                </p>
                                                <p className="mt-2 text-xs text-gray-400">
                                                    By {ann.author?.name} · {formatDate(ann.created_at)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setDeletingId(ann.id)}
                                                className="shrink-0 rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}
