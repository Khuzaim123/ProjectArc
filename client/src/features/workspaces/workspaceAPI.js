import { apiSlice } from '../../app/apiSlice';

export const workspacesAPI = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all workspaces for current user
        getWorkspaces: builder.query({
            query: () => '/api/workspaces',
            providesTags: ['Workspace'],
        }),

        // Get single workspace by ID
        getWorkspace: builder.query({
            query: (id) => `/api/workspaces/${id}`,
            providesTags: (result, error, id) => [{ type: 'Workspace', id }],
        }),

        // Create new workspace
        createWorkspace: builder.mutation({
            query: (newWorkspace) => ({
                url: '/api/workspaces',
                method: 'POST',
                body: newWorkspace,
            }),
            invalidatesTags: ['Workspace'],
        }),

        // Update workspace
        updateWorkspace: builder.mutation({
            query: ({ id, ...updates }) => ({
                url: `/api/workspaces/${id}`,
                method: 'PATCH',
                body: updates,
            }),
            invalidatesTags: (result, error, { id }) => [
                'Workspace',
                { type: 'Workspace', id },
            ],
        }),

        // Delete workspace
        deleteWorkspace: builder.mutation({
            query: (id) => ({
                url: `/api/workspaces/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Workspace'],
        }),

        // Invite member to workspace
        inviteMember: builder.mutation({
            query: ({ workspaceId, email, role }) => ({
                url: `/api/workspaces/${workspaceId}/invite`,
                method: 'POST',
                body: { email, role },
            }),
            invalidatesTags: (result, error, { workspaceId }) => [
                { type: 'Workspace', id: workspaceId },
            ],
        }),

        // Get workspace members
        getWorkspaceMembers: builder.query({
            query: (workspaceId) => `/api/workspaces/${workspaceId}/members`,
            providesTags: (result, error, workspaceId) => [
                { type: 'Workspace', id: workspaceId },
            ],
        }),

        // Remove member from workspace
        removeMember: builder.mutation({
            query: ({ workspaceId, memberId }) => ({
                url: `/api/workspaces/${workspaceId}/members/${memberId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { workspaceId }) => [
                { type: 'Workspace', id: workspaceId },
            ],
        }),
    }),
});

export const {
    useGetWorkspacesQuery,
    useGetWorkspaceQuery,
    useCreateWorkspaceMutation,
    useUpdateWorkspaceMutation,
    useDeleteWorkspaceMutation,
    useInviteMemberMutation,
    useGetWorkspaceMembersQuery,
    useRemoveMemberMutation,
} = workspacesAPI;
