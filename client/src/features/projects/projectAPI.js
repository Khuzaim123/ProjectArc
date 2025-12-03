import { apiSlice } from '../../app/apiSlice';

export const projectsAPI = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all projects for a workspace
        getProjects: builder.query({
            query: (workspaceId) => `/api/projects/workspace/${workspaceId}`,
            providesTags: (result) => {
                const projects = Array.isArray(result?.data) ? result.data : [];
                return [
                    ...projects.map(({ _id }) => ({ type: 'Project', id: _id })),
                    'Project',
                ];
            },
        }),

        // Get single project by ID
        getProject: builder.query({
            query: (id) => `/api/projects/${id}`,
            providesTags: (result, error, id) => [{ type: 'Project', id }],
        }),

        // Create new project
        createProject: builder.mutation({
            query: (newProject) => ({
                url: '/api/projects',
                method: 'POST',
                body: newProject,
            }),
            invalidatesTags: ['Project'],
        }),

        // Update project
        updateProject: builder.mutation({
            query: ({ id, ...updates }) => ({
                url: `/api/projects/${id}`,
                method: 'PATCH',
                body: updates,
            }),
            invalidatesTags: (result, error, { id }) => [
                'Project',
                { type: 'Project', id },
            ],
        }),

        // Delete project
        deleteProject: builder.mutation({
            query: (id) => ({
                url: `/api/projects/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Project'],
        }),
    }),
});

export const {
    useGetProjectsQuery,
    useGetProjectQuery,
    useCreateProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
} = projectsAPI;
