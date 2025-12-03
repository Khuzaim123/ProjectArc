import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { apiSlice } from './apiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
        // Add other reducers here as you create them:
        // workspaces: workspaceReducer,
        // projects: projectReducer,
        // tasks: taskReducer,
        // notifications: notificationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(apiSlice.middleware),
});

export default store;
