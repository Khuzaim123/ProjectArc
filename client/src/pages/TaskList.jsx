import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetWorkspacesQuery } from '../features/workspaces/workspaceAPI';
import { useGetProjectsQuery } from '../features/projects/projectAPI';
import { FiCheckSquare, FiPlus } from 'react-icons/fi';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CreateTaskModal from '../components/modals/CreateTaskModal';

const TaskList = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const { data: workspacesData, isLoading: loadingWorkspaces } = useGetWorkspacesQuery();

    // Extract workspaces
    const workspaces = Array.isArray(workspacesData?.data?.workspaces)
        ? workspacesData.data.workspaces
        : Array.isArray(workspacesData?.data)
            ? workspacesData.data
            : [];

    // Fetch projects for all workspaces
    const projectQueries = workspaces.map(workspace =>
        useGetProjectsQuery(workspace._id)
    );

    // Combine all projects from all workspaces
    const allProjects = projectQueries.reduce((acc, query) => {
        if (query.data?.data?.projects) {
            return [...acc, ...query.data.data.projects];
        } else if (Array.isArray(query.data?.data)) {
            return [...acc, ...query.data.data];
        }
        return acc;
    }, []);

    const isLoading = loadingWorkspaces || projectQueries.some(q => q.isLoading);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
                    <p className="text-gray-600 mt-1">
                        View and manage all your tasks across projects
                    </p>
                </div>
                <Button
                    onClick={() => {
                        if (allProjects.length > 0) {
                            setSelectedProject(allProjects[0]._id);
                            setShowCreateModal(true);
                        } else {
                            alert('Please create a project first');
                        }
                    }}
                >
                    <FiPlus className="w-4 h-4 mr-2" />
                    New Task
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                {allProjects.length === 0 ? (
                    <EmptyState
                        icon={FiCheckSquare}
                        title="No projects yet"
                        description="Create a project first, then you can add tasks to it"
                        action={
                            <Link to="/workspaces">
                                <Button>Go to Workspaces</Button>
                            </Link>
                        }
                    />
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            You have {allProjects.length} project(s). Click on a project to view its tasks:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allProjects.map((project) => (
                                <Link
                                    key={project._id}
                                    to={`/projects/${project._id}/kanban`}
                                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{project.icon || '📁'}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                            <p className="text-xs text-gray-500">View Kanban Board →</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Task Modal */}
            {selectedProject && (
                <CreateTaskModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    projectId={selectedProject}
                />
            )}
        </div>
    );
};

export default TaskList;
