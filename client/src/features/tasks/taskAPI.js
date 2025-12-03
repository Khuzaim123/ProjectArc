import { apiSlice } from '../../app/apiSlice';

export const tasksAPI = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all tasks for a project
        getTasks: builder.query({
            query: (projectId) => `/api/tasks/project/${projectId}`,
            providesTags: (result, error, projectId) => {
                // Safely extract tasks array from nested response
                const tasks = Array.isArray(result?.data?.tasks)
                    ? result.data.tasks
                    : Array.isArray(result?.data)
                        ? result.data
                        : [];

                return [
                    { type: 'Task', id: `PROJECT_${projectId}` },
                    ...tasks.map(({ _id }) => ({ type: 'Task', id: _id })),
                ];
            },
        }),

        // Get single task by ID
        getTask: builder.query({
            query: (id) => `/api/tasks/${id}`,
            providesTags: (result, error, id) => [{ type: 'Task', id }],
        }),

        // Create new task
        createTask: builder.mutation({
            query: (newTask) => ({
                url: '/api/tasks',
                method: 'POST',
                body: newTask,
            }),
            // Only invalidate the specific project's task list
            invalidatesTags: (result, error, arg) => [
                { type: 'Task', id: `PROJECT_${arg.project}` },
            ],
        }),

        // Update task
        updateTask: builder.mutation({
            query: ({ id, ...updates }) => ({
                url: `/api/tasks/${id}`,
                method: 'PATCH',
                body: updates,
            }),
            invalidatesTags: (result, error, { id }) => [
                'Task',
                { type: 'Task', id },
            ],
        }),

        // Delete task
        deleteTask: builder.mutation({
            query: (id) => ({
                url: `/api/tasks/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Task'],
        }),

        // Move task (for Kanban)
        moveTask: builder.mutation({
            query: ({ id, column, position }) => ({
                url: `/api/tasks/${id}/move`,
                method: 'PATCH',
                body: { column, position },
            }),
            async onQueryStarted({ id, column }, { dispatch, queryFulfilled }) {
                // Optimistic update
                const patchResults = [];
                dispatch(
                    tasksAPI.util.updateQueryData('getTasks', undefined, (draft) => {
                        // Safely get tasks array
                        const tasks = Array.isArray(draft?.data?.tasks)
                            ? draft.data.tasks
                            : Array.isArray(draft?.data)
                                ? draft.data
                                : [];

                        const task = tasks.find((t) => t._id === id);
                        if (task) {
                            task.column = column;
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResults.forEach((patchResult) => patchResult.undo());
                }
            },
            invalidatesTags: (result, error, { id }) => [{ type: 'Task', id }],
        }),

        // Add subtask
        addSubtask: builder.mutation({
            query: ({ taskId, title }) => ({
                url: `/api/tasks/${taskId}/subtasks`,
                method: 'POST',
                body: { title },
            }),
            invalidatesTags: (result, error, { taskId }) => [{ type: 'Task', id: taskId }],
        }),

        // Toggle subtask completion
        toggleSubtask: builder.mutation({
            query: ({ taskId, subtaskId }) => ({
                url: `/api/tasks/${taskId}/subtasks/${subtaskId}/toggle`,
                method: 'PATCH',
            }),
            invalidatesTags: (result, error, { taskId }) => [{ type: 'Task', id: taskId }],
        }),

        // Delete subtask
        deleteSubtask: builder.mutation({
            query: ({ taskId, subtaskId }) => ({
                url: `/api/tasks/${taskId}/subtasks/${subtaskId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { taskId }) => [{ type: 'Task', id: taskId }],
        }),
    }),
});

export const {
    useGetTasksQuery,
    useGetTaskQuery,
    useCreateTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
    useMoveTaskMutation,
    useAddSubtaskMutation,
    useToggleSubtaskMutation,
    useDeleteSubtaskMutation,
} = tasksAPI;
