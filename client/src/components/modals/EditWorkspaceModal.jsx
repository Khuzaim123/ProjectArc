import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useUpdateWorkspaceMutation } from '../../features/workspaces/workspaceAPI';
import toast from '../../utils/toast';

const EditWorkspaceModal = ({ isOpen, onClose, workspace }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const [updateWorkspace, { isLoading }] = useUpdateWorkspaceMutation();

    // Update form when workspace changes
    useEffect(() => {
        if (workspace) {
            setFormData({
                name: workspace.name || '',
                description: workspace.description || '',
            });
        }
    }, [workspace]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateWorkspace({
                id: workspace._id,
                ...formData,
            }).unwrap();

            toast.success('Workspace updated successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to update workspace:', error);
            toast.error(error?.data?.message || 'Failed to update workspace');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Workspace">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Workspace Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Workspace"
                    required
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="What's this workspace for?"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows="3"
                    />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" loading={isLoading}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditWorkspaceModal;
