import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    useGetWorkspaceQuery,
    useInviteMemberMutation,
    useRemoveMemberMutation
} from '../features/workspaces/workspaceAPI';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import toast from '../utils/toast';
import { FiUsers, FiPlus, FiTrash2, FiMail } from 'react-icons/fi';

const Team = () => {
    const { workspaceId } = useParams();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('Member');

    const { data: workspaceData, isLoading } = useGetWorkspaceQuery(workspaceId, {
        skip: !workspaceId,
    });
    const [inviteMember, { isLoading: isInviting }] = useInviteMemberMutation();
    const [removeMember] = useRemoveMemberMutation();

    const workspace = workspaceData?.data?.workspace || workspaceData?.data;

    const handleSendInvite = async (e) => {
        e.preventDefault();
        try {
            await inviteMember({
                workspaceId: workspace._id,
                email: inviteEmail,
                role: inviteRole.toLowerCase(),
            }).unwrap();

            toast.success(`Invitation sent to ${inviteEmail}!`);
            setShowInviteModal(false);
            setInviteEmail('');
            setInviteRole('Member');
        } catch (error) {
            console.error('Failed to send invite:', error);
            toast.error(error?.data?.message || 'Failed to send invitation');
        }
    };

    const handleRemoveMember = async (userId) => {
        if (window.confirm('Are you sure you want to remove this member from the workspace?')) {
            try {
                await removeMember({
                    workspaceId: workspace._id,
                    memberId: userId,
                }).unwrap();

                toast.success('Member removed successfully');
            } catch (error) {
                console.error('Failed to remove member:', error);
                toast.error(error?.data?.message || 'Failed to remove member');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!workspace) {
        // Don't show error for Team page since it doesn't require workspaceId
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Team</h1>
                    <p className="text-gray-600 mt-1">
                        Select a workspace from the sidebar to manage your team
                    </p>
                </div>
            </div>
        );
    }

    const members = workspace.members || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Team</h1>
                    <p className="text-gray-600 mt-1">
                        Manage team members for {workspace.name}
                    </p>
                </div>
                <Button onClick={() => setShowInviteModal(true)}>
                    <FiPlus className="w-4 h-4 mr-2" />
                    Invite Member
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                {members.length === 0 ? (
                    <EmptyState
                        icon={FiUsers}
                        title="No team members yet"
                        description="Invite team members to collaborate on this workspace"
                        action={
                            <Button onClick={() => setShowInviteModal(true)}>
                                <FiPlus className="w-4 h-4 mr-2" />
                                Invite Member
                            </Button>
                        }
                    />
                ) : (
                    <div className="space-y-4">
                        {members.map((member) => (
                            <div
                                key={member.user?._id || member._id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-lg">
                                        {(member.user?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {member.user?.name || 'Unknown User'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {member.user?.email || 'No email'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${member.role === 'Admin'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {member.role}
                                    </span>
                                    {member.role !== 'Owner' && (
                                        <button
                                            onClick={() => handleRemoveMember(member.user?._id || member._id)}
                                            className="text-gray-400 hover:text-red-600 transition"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Invite Member Modal */}
            <Modal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                title="Invite Team Member"
            >
                <form onSubmit={handleSendInvite} className="space-y-4">
                    <Input
                        label="Email Address"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@example.com"
                        required
                        icon={FiMail}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role
                        </label>
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Member">Member</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Members can view and contribute. Admins can manage settings.
                        </p>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowInviteModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" loading={isInviting}>
                            Send Invitation
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Team;
