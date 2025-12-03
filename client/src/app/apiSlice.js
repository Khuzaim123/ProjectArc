import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../utils/constants';

// Base query with auth token
const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.accessToken;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
    credentials: 'include', // For cookies (refresh token)
});

// Base query with re-auth logic
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // Try to get a new token
        const refreshResult = await baseQuery(
            { url: '/api/auth/refresh', method: 'POST' },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            // Store the new token
            api.dispatch({
                type: 'auth/setCredentials',
                payload: refreshResult.data.data
            });
            // Retry the initial query
            result = await baseQuery(args, api, extraOptions);
        } else {
            // Refresh failed, logout
            api.dispatch({ type: 'auth/logout' });
        }
    }

    return result;
};

// Create the API slice
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: [
        'User',
        'Workspace',
        'Project',
        'Task',
        'Comment',
        'Notification',
        'Invitation',
        'Activity',
    ],
    endpoints: (builder) => ({}), // Endpoints will be injected from feature slices
});

export default apiSlice;
