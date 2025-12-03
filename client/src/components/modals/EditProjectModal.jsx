import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useUpdateProjectMutation } from '../../features/projects/projectAPI';
import toast from '../../utils/toast';

const EditProjectModal = ({ isOpen, onClose, project }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '📁',
        privacy: 'workspace',
    });

    const [updateProject, { isLoading }] = useUpdateProjectMutation();

    // Update form when project changes
    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                icon: project.icon || '📁',
                privacy: project.privacy || 'workspace',
            });
        }
    }, [project]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProject({
                id: project._id,
                ...formData,
            }).unwrap();

            toast.success('Project updated successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to update project:', error);
            toast.error(error?.data?.message || 'Failed to update project');
        }
    };

    const icons = ['📁', '📊', '🎯', '💼', '🚀', '⚡', '🎨', '📱'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Project">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Project Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Project"
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="What's this project about?"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows="3"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {icons.map((icon) => (
                            <button
                                key={icon}
                                type="button"
                                onClick={() => setFormData({ ...formData, icon })}
                                className={`text-2xl p-2 rounded-lg border-2 transition ${formData.icon === icon
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Privacy
                    </label>
                    <select
                        value={formData.privacy}
                        onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="workspace">Workspace (Visible to all members)</option>
                        <option value="team">Team (Visible to assigned members)</option>
                        <option value="private">Private (Only you)</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
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

export default EditProjectModal;
