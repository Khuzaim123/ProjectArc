import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Comments from '../common/Comments';
import {
    useGetTaskQuery,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
    useAddSubtaskMutation,
    useToggleSubtaskMutation,
    useDeleteSubtaskMutation,
} from '../../features/tasks/taskAPI';
import { FiTrash2, FiPlus, FiCheck, FiX } from 'react-icons/fi';

const TaskDetailModal = ({ isOpen, onClose, taskId }) => {
    const { data: taskData, isLoading } = useGetTaskQuery(taskId, { skip: !taskId });
    const [updateTask] = useUpdateTaskMutation();
    const [deleteTask] = useDeleteTaskMutation();
    const [addSubtask] = useAddSubtaskMutation();
    const [toggleSubtask] = useToggleSubtaskMutation();
    const [deleteSubtask] = useDeleteSubtaskMutation();

    const [newSubtask, setNewSubtask] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [localDescription, setLocalDescription] = useState('');

    // Extract task safely
    const task = taskData?.data?.task || taskData?.data;

    // Update local description when task loads
    React.useEffect(() => {
        if (task) {
            setLocalDescription(task.description || '');
        }
    }, [task]);

    const handleUpdateTask = async (updates) => {
        try {
            await updateTask({ id: taskId, ...updates }).unwrap();
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const handleDeleteTask = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(taskId).unwrap();
                onClose();
            } catch (error) {
                console.error('Failed to delete task:', error);
            }
        }
    };

    const handleSaveDescription = () => {
        if (localDescription !== task.description) {
            handleUpdateTask({ description: localDescription });
        }
    };

    const handleAddSubtask = async (e) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;

        try {
            await addSubtask({ taskId, title: newSubtask }).unwrap();
            setNewSubtask('');
        } catch (error) {
            console.error('Failed to add subtask:', error);
        }
    };

    const handleToggleSubtask = async (subtaskId) => {
        try {
            await toggleSubtask({ taskId, subtaskId }).unwrap();
        } catch (error) {
            console.error('Failed to toggle subtask:', error);
        }
    };

    if (isLoading) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Task Details" size="lg">
                <div className="text-center py-8">Loading...</div>
            </Modal>
        );
    }

    if (!task) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Task Details" size="lg">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {isEditing ? (
                            <Input
                                value={editData.title || task.title}
                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                onBlur={() => {
                                    handleUpdateTask({ title: editData.title });
                                    setIsEditing(false);
                                }}
                                autoFocus
                            />
                        ) : (
                            <h2
                                className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-primary-600"
                                onClick={() => setIsEditing(true)}
                            >
                                {task.title}
                            </h2>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                            Created {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <Button variant="danger" size="sm" onClick={handleDeleteTask}>
                        <FiTrash2 className="w-4 h-4" />
                    </Button>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        onBlur={handleSaveDescription}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows="3"
                        placeholder="Add a description..."
                    />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={task.column || task.status}
                            onChange={(e) => handleUpdateTask({ column: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Todo">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="In Review">In Review</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <select
                            value={task.priority}
                            onChange={(e) => handleUpdateTask({ priority: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>
                </div>

                {/* Subtasks */}
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Subtasks</h3>
                    <div className="space-y-2 mb-3">
                        {task.subtasks?.map((subtask) => (
                            <div
                                key={subtask._id}
                                className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50"
                            >
                                <button
                                    onClick={() => handleToggleSubtask(subtask._id)}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${subtask.completed
                                        ? 'bg-primary-500 border-primary-500'
                                        : 'border-gray-300'
                                        }`}
                                >
                                    {subtask.completed && <FiCheck className="w-3 h-3 text-white" />}
                                </button>
                                <span
                                    className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-400' : ''
                                        }`}
                                >
                                    {subtask.title}
                                </span>
                                <button
                                    onClick={() => deleteSubtask({ taskId, subtaskId: subtask._id })}
                                    className="text-gray-400 hover:text-red-600"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleAddSubtask} className="flex space-x-2">
                        <input
                            type="text"
                            value={newSubtask}
                            onChange={(e) => setNewSubtask(e.target.value)}
                            placeholder="Add a subtask..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <Button type="submit" size="sm">
                            <FiPlus className="w-4 h-4" />
                        </Button>
                    </form>
                </div>

                {/* Comments */}
                <Comments taskId={taskId} />
            </div>
        </Modal>
    );
};

export default TaskDetailModal;
