import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setCredentials } from '../features/auth/authSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from '../utils/toast';
import { FiUser, FiMail, FiLock, FiCamera } from 'react-icons/fi';
import { useUploadAvatarMutation, useUpdateProfileMutation } from '../features/users/userAPI';
import { useGetWorkspacesQuery } from '../features/workspaces/workspaceAPI';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Profile = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);
    const { data: workspacesData } = useGetWorkspacesQuery();
    const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
    const [updateProfile] = useUpdateProfileMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showChangePassword, setShowChangePassword] = useState(false);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const result = await uploadAvatar(formData).unwrap();

            // Update local state and redux store
            const updatedUser = { ...currentUser, avatar: result.data.avatar };
            dispatch(setCredentials({
                user: updatedUser,
                accessToken: localStorage.getItem('accessToken')
            }));

            toast.success('Profile photo updated!');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error(error?.data?.message || 'Failed to upload photo');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const result = await updateProfile({ name: formData.name }).unwrap();

            // Update redux store
            dispatch(setCredentials({
                user: result.data.user,
                accessToken: localStorage.getItem('accessToken')
            }));

            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            console.error('Update failed:', error);
            toast.error(error?.data?.message || 'Failed to update profile');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        try {
            // TODO: Implement change password API call
            toast.success('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setShowChangePassword(false);
        } catch (error) {
            toast.error('Failed to change password');
        }
    };

    const handleExportData = async () => {
        try {
            console.log('Starting PDF export...');
            console.log('Current user:', currentUser);
            console.log('Workspaces data:', workspacesData);

            const doc = new jsPDF();
            console.log('jsPDF instance created');

            // Title
            doc.setFontSize(20);
            doc.text('ProjectArc User Data Export', 14, 22);

            // User Info
            doc.setFontSize(12);
            doc.text(`Name: ${currentUser?.name || 'N/A'}`, 14, 40);
            doc.text(`Email: ${currentUser?.email || 'N/A'}`, 14, 48);
            doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 14, 56);
            console.log('User info added to PDF');

            // Workspaces Table
            if (workspacesData?.data?.workspaces && Array.isArray(workspacesData.data.workspaces)) {
                console.log('Adding workspaces table...');
                doc.setFontSize(16);
                doc.text('Workspaces', 14, 70);

                const workspaceRows = workspacesData.data.workspaces.map(ws => [
                    ws.name || 'Unnamed',
                    ws.role || 'Member',
                    ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : 'N/A'
                ]);
                console.log('Workspace rows:', workspaceRows);

                doc.autoTable({
                    startY: 75,
                    head: [['Name', 'Role', 'Joined']],
                    body: workspaceRows,
                });
                console.log('Workspaces table added');
            } else {
                console.log('No workspaces data available');
                doc.setFontSize(12);
                doc.text('No workspaces found', 14, 70);
            }

            // Save
            console.log('Saving PDF...');
            doc.save('projectarc-data-export.pdf');
            console.log('PDF saved successfully');
            toast.success('Data exported successfully!');
        } catch (error) {
            console.error('Export failed - Full error:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            toast.error(`Failed to export data: ${error.message}`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-1">
                    Manage your profile information and preferences
                </p>
            </div>

            {/* Profile Picture Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Picture</h2>
                <div className="flex items-center space-x-6">
                    <div className="relative w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                        {currentUser?.avatar ? (
                            <img
                                src={currentUser.avatar}
                                alt={currentUser.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            (currentUser?.name?.charAt(0).toUpperCase() || 'U')
                        )}
                    </div>
                    <div>
                        <input
                            type="file"
                            id="avatar-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={isUploading}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('avatar-upload').click()}
                            loading={isUploading}
                        >
                            <FiCamera className="w-4 h-4 mr-2" />
                            Change Photo
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                            JPG, GIF or PNG. Max size of 5MB.
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    {!isEditing && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit
                        </Button>
                    )}
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        disabled={!isEditing}
                        icon={FiUser}
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        disabled={!isEditing}
                        icon={FiMail}
                    />

                    {isEditing && (
                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        name: currentUser?.name || '',
                                        email: currentUser?.email || '',
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Save Changes
                            </Button>
                        </div>
                    )}
                </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>

                {!showChangePassword ? (
                    <Button
                        variant="outline"
                        onClick={() => setShowChangePassword(true)}
                    >
                        <FiLock className="w-4 h-4 mr-2" />
                        Change Password
                    </Button>
                ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <Input
                            label="Current Password"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            placeholder="••••••••"
                            required
                        />
                        <Input
                            label="New Password"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="••••••••"
                            required
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            required
                        />
                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setShowChangePassword(false);
                                    setPasswordData({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: '',
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Update Password
                            </Button>
                        </div>
                    </form>
                )}
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h2>
                <div className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleExportData}
                    >
                        Export Data
                    </Button>
                    <Button variant="danger" className="w-full justify-start">
                        Delete Account
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
