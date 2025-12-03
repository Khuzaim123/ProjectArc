import { apiSlice } from '../../app/apiSlice';

export const commentsAPI = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get comments for a task
        getComments: builder.query({
            query: (taskId) => `/api/comments/task/${taskId}`,
            providesTags: (result, error, taskId) => [
                { type: 'Comment', id: taskId },
                'Comment',
            ],
        }),

        // Create comment
        createComment: builder.mutation({
            query: ({ taskId, content }) => ({
                url: `/api/comments/task/${taskId}`,
                method: 'POST',
                body: { content },
            }),
            invalidatesTags: (result, error, { taskId }) => [
                { type: 'Comment', id: taskId },
                'Comment',
            ],
        }),

        // Update comment
        updateComment: builder.mutation({
            query: ({ id, content }) => ({
                url: `/api/comments/${id}`,
                method: 'PATCH',
                body: { content },
            }),
            invalidatesTags: ['Comment'],
        }),

        // Delete comment
        deleteComment: builder.mutation({
            query: (id) => ({
                url: `/api/comments/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Comment'],
        }),
    }),
});

export const {
    useGetCommentsQuery,
    useCreateCommentMutation,
    useUpdateCommentMutation,
    useDeleteCommentMutation,
} = commentsAPI;
