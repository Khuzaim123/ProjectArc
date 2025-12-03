import toast from 'react-hot-toast';

// Success toast
export const showSuccess = (message) => {
    toast.success(message, {
        duration: 3000,
        position: 'top-right',
        style: {
            background: '#10b981',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
        },
    });
};

// Error toast
export const showError = (message) => {
    toast.error(message || 'Something went wrong. Please try again.', {
        duration: 4000,
        position: 'top-right',
        style: {
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
        },
    });
};

// Loading toast
export const showLoading = (message) => {
    return toast.loading(message, {
        position: 'top-right',
        style: {
            padding: '16px',
            borderRadius: '8px',
        },
    });
};

// Dismiss toast
export const dismissToast = (toastId) => {
    toast.dismiss(toastId);
};

// Promise toast
export const showPromise = (promise, messages) => {
    return toast.promise(
        promise,
        {
            loading: messages.loading || 'Loading...',
            success: messages.success || 'Success!',
            error: messages.error || 'Error occurred',
        },
        {
            position: 'top-right',
            style: {
                padding: '16px',
                borderRadius: '8px',
            },
        }
    );
};

export default {
    success: showSuccess,
    error: showError,
    loading: showLoading,
    dismiss: dismissToast,
    promise: showPromise,
};
