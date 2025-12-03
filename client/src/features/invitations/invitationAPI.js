import { apiSlice } from '../../app/apiSlice';

export const invitationsAPI = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get user's pending invitations
        getInvitations: builder.query({
            query: () => '/api/invitations',
            providesTags: ['Invitation'],
        }),

        // Get invitation details by token
        getInvitationByToken: builder.query({
            query: (token) => `/api/invitations/${token}`,
            providesTags: (result, error, token) => [{ type: 'Invitation', id: token }],
        }),

        // Accept invitation
        acceptInvitation: builder.mutation({
            query: (token) => ({
                url: `/api/invitations/${token}/accept`,
                method: 'POST',
            }),
            invalidatesTags: ['Invitation', 'Workspace'],
        }),

        // Reject invitation
        rejectInvitation: builder.mutation({
            query: (token) => ({
                url: `/api/invitations/${token}/reject`,
                method: 'POST',
            }),
            invalidatesTags: ['Invitation'],
        }),
    }),
});

export const {
    useGetInvitationsQuery,
    useGetInvitationByTokenQuery,
    useAcceptInvitationMutation,
    useRejectInvitationMutation,
} = invitationsAPI;
