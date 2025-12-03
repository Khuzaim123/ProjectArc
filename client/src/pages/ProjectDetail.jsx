import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetProjectQuery } from '../features/projects/projectAPI';
import { useGetTasksQuery } from '../features/tasks/taskAPI';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { FiTrello, FiList, FiCalendar } from 'react-icons/fi';

const ProjectDetail = () => {
    const { projectId } = useParams();
    const { data: projectData, isLoading } = useGetProjectQuery(projectId);
    const { data: tasksData } = useGetTasksQuery(projectId);

    const project = projectData?.data;
    const tasks = tasksData?.data || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!project) {
        return <div className="text-center py-12">Project not found</div>;
    }

    const taskStats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'Todo').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        done: tasks.filter(t => t.status === 'Done').length,
    };

    return (
        <div className="space-y-6">
            {/* Project Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <span className="text-4xl">{project.icon || '📁'}</span>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                            <p className="text-gray-600 mt-1">{project.description}</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <FiList className="w-4 h-4 mr-2" />
                            List View
                        </Button>
                        <Button variant="outline" size="sm">
                            <FiTrello className="w-4 h-4 mr-2" />
                            Kanban
                        </Button>
                        <Button variant="outline" size="sm">
                            <FiCalendar className="w-4 h-4 mr-2" />
                            Timeline
                        </Button>
                    </div>
                </div>
            </div>

            {/* Task Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Tasks" value={taskStats.total} color="blue" />
                <StatCard title="To Do" value={taskStats.todo} color="gray" />
                <StatCard title="In Progress" value={taskStats.inProgress} color="yellow" />
                <StatCard title="Completed" value={taskStats.done} color="green" />
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasks</h2>
                <div className="space-y-2">
                    {tasks.map((task) => (
                        <div
                            key={task._id}
                            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                    {task.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-700',
        gray: 'bg-gray-50 text-gray-700',
        yellow: 'bg-yellow-50 text-yellow-700',
        green: 'bg-green-50 text-green-700',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
        </div>
    );
};

const getStatusColor = (status) => {
    const colors = {
        'Todo': 'bg-gray-100 text-gray-700',
        'In Progress': 'bg-blue-100 text-blue-700',
        'Done': 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
};

export default ProjectDetail;
