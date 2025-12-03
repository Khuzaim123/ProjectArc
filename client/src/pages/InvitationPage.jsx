import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    useGetInvitationByTokenQuery,
    useAcceptInvitationMutation,
    useRejectInvitationMutation,
} from '../features/invitations/invitationAPI';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import toast from '../utils/toast';
import { FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

const InvitationPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const { data: invitationData, isLoading, error } = useGetInvitationByTokenQuery(token);
    const [acceptInvitation, { isLoading: isAccepting }] = useAcceptInvitationMutation();
    const [rejectInvitation, { isLoading: isRejecting }] = useRejectInvitationMutation();

    const invitation = invitationData?.data?.invitation;

    useEffect(() => {
        if (!isAuthenticated) {
            // Redirect to login with return URL
            navigate(`/login?redirect=/invitations/${token}`);
        }
    }, [isAuthenticated, navigate, token]);

    const handleAccept = async () => {
        try {
            await acceptInvitation(token).unwrap();
            toast.success('Invitation accepted! Welcome to the workspace.');
            navigate(`/workspaces/${invitation.workspace._id}`);
        } catch (error) {
            console.error('Failed to accept invitation:', error);
            toast.error(error?.data?.message || 'Failed to accept invitation');
        }
    };

    const handleReject = async () => {
        try {
            await rejectInvitation(token).unwrap();
            toast.success('Invitation rejected');
            navigate('/');
        } catch (error) {
            console.error('Failed to reject invitation:', error);
            toast.error(error?.data?.message || 'Failed to reject invitation');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        This invitation may have expired or is invalid. Please ask the workspace admin to send a new invitation.
                    </p>
                    <Button onClick={() => navigate('/')} className="w-full">
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Invited!</h1>
                    <p className="text-gray-600">
                        <span className="font-semibold text-gray-900">{invitation.invitedBy?.name}</span> has invited you to join the workspace{' '}
                        <span className="font-semibold text-primary-600">{invitation.workspace?.name}</span>
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500">Role</span>
                        <span className="font-medium text-gray-900 capitalize">{invitation.role}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium text-gray-900">{invitation.email}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={handleAccept}
                        loading={isAccepting}
                        className="w-full justify-center"
                        size="lg"
                    >
                        <FiCheck className="w-5 h-5 mr-2" />
                        Accept Invitation
                    </Button>
                    <Button
                        onClick={handleReject}
                        loading={isRejecting}
                        variant="secondary"
                        className="w-full justify-center"
                        size="lg"
                    >
                        <FiX className="w-5 h-5 mr-2" />
                        Decline
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InvitationPage;
