import React from 'react';
import { useGetInvitationsQuery, useAcceptInvitationMutation, useRejectInvitationMutation } from '../../features/invitations/invitationAPI';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from '../../utils/toast';
import { FiMail, FiCheck, FiX } from 'react-icons/fi';

const PendingInvitations = () => {
    const { data: invitationsData, isLoading, refetch } = useGetInvitationsQuery();
    const [acceptInvitation, { isLoading: isAccepting }] = useAcceptInvitationMutation();
    const [rejectInvitation, { isLoading: isRejecting }] = useRejectInvitationMutation();

    const invitations = invitationsData?.data?.invitations || [];

    const handleAccept = async (token) => {
        try {
            await acceptInvitation(token).unwrap();
            toast.success('Invitation accepted! You are now a member.');
            refetch();
        } catch (error) {
            console.error('Failed to accept:', error);
            toast.error(error?.data?.message || 'Failed to accept invitation');
        }
    };

    const handleReject = async (token) => {
        if (window.confirm('Are you sure you want to decline this invitation?')) {
            try {
                await rejectInvitation(token).unwrap();
                toast.success('Invitation declined');
                refetch();
            } catch (error) {
                console.error('Failed to reject:', error);
                toast.error(error?.data?.message || 'Failed to decline invitation');
            }
        }
    };

    if (isLoading) return <LoadingSpinner size="sm" />;

    if (invitations.length === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6 border-l-4 border-blue-500">
            <div className="flex items-center space-x-3 mb-4">
                <FiMail className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900">Pending Invitations</h2>
            </div>
            <div className="space-y-4">
                {invitations.map((invitation) => (
                    <div key={invitation._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900">
                                You have been invited to join <strong>{invitation.workspace?.name}</strong>
                            </p>
                            <p className="text-sm text-gray-500">
                                Role: {invitation.role} • Invited by {invitation.invitedBy?.name}
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(invitation.token)}
                                disabled={isRejecting || isAccepting}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                                <FiX className="w-4 h-4 mr-1" />
                                Decline
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleAccept(invitation.token)}
                                disabled={isRejecting || isAccepting}
                            >
                                <FiCheck className="w-4 h-4 mr-1" />
                                Accept
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingInvitations;
