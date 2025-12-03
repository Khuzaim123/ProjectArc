import { createSlice } from '@reduxjs/toolkit';

// Helper to safely parse localStorage
const getStoredUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user && user !== 'undefined' ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        return null;
    }
};

const initialState = {
    user: getStoredUser(),
    accessToken: localStorage.getItem('accessToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken } = action.payload;
            state.user = user;
            state.accessToken = accessToken;
            state.isAuthenticated = true;

            // Persist to localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', accessToken);
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;

            // Clear localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
