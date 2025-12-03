import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';

const VerifyResetOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtp(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/api/auth/verify-reset-otp', { email, otp });
            const { resetToken } = response.data.data;

            // Navigate to reset password page with token
            navigate('/reset-password', {
                state: { resetToken }
            });
        } catch (error) {
            console.error('Verification error:', error);
            const message = error.response?.data?.message || 'Verification failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResending(true);
        setError('');

        try {
            await api.post('/api/auth/forgot-password', { email });
            setCooldown(60); // 1 minute cooldown
        } catch (error) {
            console.error('Resend error:', error);
            const message = error.response?.data?.message || 'Failed to resend OTP';
            setError(message);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Verify Reset OTP</h1>
                    <p className="text-gray-600 mt-2">
                        Enter the 6-digit code sent to
                    </p>
                    <p className="text-primary-600 font-medium">{email}</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={handleChange}
                            maxLength={6}
                            required
                            className="input-field text-center text-2xl font-mono tracking-widest"
                            placeholder="000000"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 text-center mt-2">
                            OTP expires in 10 minutes
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-gray-600 text-sm mb-2">
                        Didn't receive the code?
                    </p>
                    <button
                        onClick={handleResendOTP}
                        disabled={resending || cooldown > 0}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                    </button>
                </div>

                <p className="text-center text-gray-600 mt-6 text-sm">
                    <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyResetOTP;
