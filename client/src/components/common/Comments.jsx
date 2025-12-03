import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import Button from '../common/Button';
import { useGetCommentsQuery, useCreateCommentMutation } from '../../features/comments/commentAPI';

const Comments = ({ taskId }) => {
    const [newComment, setNewComment] = useState('');

    const { data: commentsData, isLoading } = useGetCommentsQuery(taskId, {
        skip: !taskId,
    });

    const [createComment, { isLoading: isSubmitting }] = useCreateCommentMutation();

    // Extract comments from response
    const comments = Array.isArray(commentsData?.data?.comments)
        ? commentsData.data.comments
        : Array.isArray(commentsData?.data)
            ? commentsData.data
            : [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await createComment({ taskId, content: newComment }).unwrap();
            setNewComment('');
        } catch (error) {
            console.error('Failed to create comment:', error);
        }
    };

    if (isLoading) {
        return <div className="text-sm text-gray-500">Loading comments...</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Comments</h3>

            {/* Comment List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                        No comments yet. Be the first to comment!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="flex space-x-3">
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                                {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm text-gray-900">
                                        {comment.author?.name || 'Unknown'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button type="submit" loading={isSubmitting} disabled={!newComment.trim()}>
                    <FiSend className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
};

export default Comments;
