import React from 'react';
import { Link } from 'react-router-dom';
import { useGetWorkspacesQuery } from '../features/workspaces/workspaceAPI';
import { useGetProjectsQuery } from '../features/projects/projectAPI';
import { FiTrello } from 'react-icons/fi';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const KanbanOverview = () => {
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Kanban Boards</h1>
                <p className="text-gray-600 mt-1">
                    View Kanban boards for your projects
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                {allProjects.length === 0 ? (
                    <EmptyState
                        icon={FiTrello}
                        title="No projects yet"
                        description="Create a project first to view its Kanban board"
                        action={
                            <Link to="/workspaces">
                                <Button>Go to Workspaces</Button>
                            </Link>
                        }
                    />
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">
                            Select a project to view its Kanban board:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allProjects.map((project) => (
                                <Link
                                    key={project._id}
                                    to={`/projects/${project._id}/kanban`}
                                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-lg transition"
                                >
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="text-3xl">{project.icon || '📁'}</span>
                                        <h3 className="font-semibold text-lg text-gray-900">{project.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">{project.description || 'No description'}</p>
                                    <p className="text-xs text-primary-600 mt-3 font-medium">View Kanban Board →</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanOverview;
