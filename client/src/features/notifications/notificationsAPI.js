import React from 'react';
import { apiSlice } from '../../app/apiSlice';

export const notificationsAPI = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all notifications for current user
        getNotifications: builder.query({
            query: () => '/api/notifications',
            providesTags: ['Notification'],
        }),

        // Mark notification as read
        markAsRead: builder.mutation({
            query: (id) => ({
                url: `/api/notifications/${id}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notification'],
        }),

        // Mark all notifications as read
        markAllAsRead: builder.mutation({
            query: () => ({
                url: '/api/notifications/read-all',
                method: 'PATCH',
            }),
            invalidatesTags: ['Notification'],
        }),

        // Delete notification
        deleteNotification: builder.mutation({
            query: (id) => ({
                url: `/api/notifications/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
} = notificationsAPI;
