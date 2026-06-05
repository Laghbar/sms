import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const TYPE_COLORS = {
    cours: 'bg-blue-100 text-blue-700',
    td:    'bg-purple-100 text-purple-700',
    tp:    'bg-amber-100 text-amber-700',
};

function avatar(name) {
    return name?.charAt(0).toUpperCase() ?? '?';
}

function RoleBadge({ role }) {
    if (role !== 'teacher') return null;
    return (
        <span className="ml-1.5 inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
            Teacher
        </span>
    );
}

function CommentBubble({ comment, currentUserId, onReply, isReply = false }) {
    const isOwn    = comment.user.id === currentUserId;
    const isTeacher = comment.user.role === 'teacher';

    return (
        <div className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : ''}`}>
            {/* Avatar */}
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${isTeacher ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                {avatar(comment.user.name)}
            </div>

            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-1">
                    <span className="text-sm font-semibold text-gray-900">{comment.user.name}</span>
                    <RoleBadge role={comment.user.role} />
                    <span className="text-xs text-gray-400">{comment.created_at}</span>
                </div>

                {/* Body */}
                <div className={`mt-1 rounded-xl px-4 py-2.5 text-sm text-gray-800 leading-relaxed ${
                    isTeacher
                        ? 'bg-indigo-50 border border-indigo-100'
                        : 'bg-gray-100'
                }`}>
                    {comment.body}
                </div>

                {/* Actions */}
                <div className="mt-1.5 flex items-center gap-3">
                    {!isReply && onReply && (
                        <button
                            onClick={() => onReply(comment)}
                            className="text-xs text-gray-400 hover:text-indigo-600"
                        >
                            Reply
                        </button>
                    )}
                    {isOwn && (
                        <Link
                            href={comment.delete_url}
                            method="delete"
                            as="button"
                            preserveScroll
                            className="text-xs text-gray-400 hover:text-red-500"
                        >
                            Delete
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

function ReplyForm({ parentComment, storeUrl, onCancel }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        body:      '',
        parent_id: parentComment.id,
    });

    function submit(e) {
        e.preventDefault();
        post(storeUrl, {
            preserveScroll: true,
            onSuccess: () => { reset(); onCancel(); },
        });
    }

    return (
        <form onSubmit={submit} className="ml-10 mt-3 flex gap-2">
            <div className="flex-1">
                <textarea
                    value={data.body}
                    onChange={(e) => setData('body', e.target.value)}
                    placeholder={`Reply to ${parentComment.user.name}…`}
                    rows={2}
                    autoFocus
                    className="block w-full rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
                />
                {errors.body && <p className="mt-1 text-xs text-red-500">{errors.body}</p>}
            </div>
            <div className="flex flex-col gap-1 pt-0.5">
                <button
                    type="submit"
                    disabled={processing || !data.body.trim()}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {processing ? '…' : 'Reply'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function CourseFileDiscussion({ courseFile, comments }) {
    const { auth } = usePage().props;
    const currentUserId = auth.user.id;

    const [replyingTo, setReplyingTo] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({ body: '', parent_id: null });

    function submitComment(e) {
        e.preventDefault();
        post(courseFile.store_url, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    return (
        <StudentLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={courseFile.files_url}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Course Files
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase ${TYPE_COLORS[courseFile.type]}`}>
                                {courseFile.type}
                            </span>
                            <h2 className="text-xl font-semibold text-gray-800">{courseFile.title}</h2>
                        </div>
                        <p className="text-sm text-gray-500">
                            {courseFile.module.name} ({courseFile.module.code})
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Discussion — ${courseFile.title}`} />

            <div className="py-10">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

                    {/* Comment count header */}
                    <div className="mb-6 flex items-center gap-2">
                        <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="text-base font-semibold text-gray-700">
                            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                        </h3>
                    </div>

                    {/* Empty state */}
                    {comments.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                            <svg className="mx-auto mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-sm text-gray-400">No comments yet. Be the first to ask a question!</p>
                        </div>
                    )}

                    {/* Comment thread */}
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                                <CommentBubble
                                    comment={comment}
                                    currentUserId={currentUserId}
                                    onReply={(c) => setReplyingTo(replyingTo?.id === c.id ? null : c)}
                                />

                                {/* Replies */}
                                {comment.replies.map((reply) => (
                                    <CommentBubble
                                        key={reply.id}
                                        comment={reply}
                                        currentUserId={currentUserId}
                                        isReply
                                    />
                                ))}

                                {/* Inline reply form */}
                                {replyingTo?.id === comment.id && (
                                    <ReplyForm
                                        parentComment={comment}
                                        storeUrl={courseFile.store_url}
                                        onCancel={() => setReplyingTo(null)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* New top-level comment form */}
                    <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                        <h4 className="mb-3 text-sm font-semibold text-gray-700">Add a comment</h4>
                        <form onSubmit={submitComment} className="space-y-3">
                            <textarea
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                placeholder="Ask a question or share a thought about this document…"
                                rows={3}
                                className="block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
                            />
                            {errors.body && <p className="text-xs text-red-500">{errors.body}</p>}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing || !data.body.trim()}
                                    className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Posting…' : 'Post Comment'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </StudentLayout>
    );
}
