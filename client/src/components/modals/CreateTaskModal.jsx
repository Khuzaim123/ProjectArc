import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useCreateTaskMutation } from '../../features/tasks/taskAPI';

const CreateTaskModal = ({ isOpen, onClose, projectId, initialColumn = 'Todo' }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        column: initialColumn,
        project: projectId || '',
    });

    const [createTask, { isLoading }] = useCreateTaskMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createTask(formData).unwrap();
            setFormData({
                title: '',
                description: '',
                priority: 'Medium',
                column: 'Todo',
                project: projectId || '',
            });
            onClose();
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Task Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="What needs to be done?"
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Add more details..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows="3"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={formData.column}
                            onChange={(e) => setFormData({ ...formData, column: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Todo">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="In Review">In Review</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={isLoading}>
                        Create Task
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateTaskModal;
