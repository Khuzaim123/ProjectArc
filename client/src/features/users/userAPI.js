import { apiSlice } from '../../app/apiSlice';

export const usersAPI = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get user profile
        getProfile: builder.query({
            query: () => '/api/users/profile',
            providesTags: ['User'],
        }),

        // Update user profile
        updateProfile: builder.mutation({
            query: (data) => ({
                url: '/api/users/profile',
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),

        // Upload avatar
        uploadAvatar: builder.mutation({
            query: (formData) => ({
                url: '/api/users/avatar',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['User'],
        }),

        // Get notification preferences
        getPreferences: builder.query({
            query: () => '/api/users/preferences',
            providesTags: ['User'],
        }),

        // Update notification preferences
        updatePreferences: builder.mutation({
            query: (data) => ({
                url: '/api/users/preferences',
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
    }),
});

export const {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useUploadAvatarMutation,
    useGetPreferencesQuery,
    useUpdatePreferencesMutation,
} = usersAPI;
