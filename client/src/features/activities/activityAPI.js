import { apiSlice } from '../../app/apiSlice';

export const activitiesAPI = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get recent activities across all workspaces
        getRecentActivities: builder.query({
            query: (limit = 20) => `/api/activities/recent?limit=${limit}`,
            providesTags: ['Activity'],
        }),

        // Get activities for a specific workspace
        getWorkspaceActivities: builder.query({
            query: ({ workspaceId, limit = 50, skip = 0 }) =>
                `/api/activities/${workspaceId}?limit=${limit}&skip=${skip}`,
            providesTags: (result, error, { workspaceId }) => [
                { type: 'Activity', id: `WORKSPACE_${workspaceId}` }
            ],
            // Merge incoming data with existing cache for infinite scroll
            merge: (currentCache, newItems) => {
                if (newItems.pagination.skip === 0) {
                    return newItems;
                }
                currentCache.activities.push(...newItems.activities);
                currentCache.pagination = newItems.pagination;
            },
            // Refetch when the page arg changes
            forceRefetch({ currentArg, previousArg }) {
                return currentArg !== previousArg;
            },
        }),
    }),
});

export const {
    useGetRecentActivitiesQuery,
    useGetWorkspaceActivitiesQuery,
} = activitiesAPI;
