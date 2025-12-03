import React from 'react';
import { Link } from 'react-router-dom';
import { FiFolder } from 'react-icons/fi';
import { useGetWorkspacesQuery } from '../features/workspaces/workspaceAPI';
import { useGetProjectsQuery } from '../features/projects/projectAPI';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProjectList = () => {
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
                    <h1 className="text-3xl font-bold text-gray-900">All Projects</h1>
                    <p className="text-gray-600 mt-1">
                        View all projects across your workspaces
                    </p>
                </div>
                <Link to="/workspaces">
                    <Button>
                        <FiFolder className="w-4 h-4 mr-2" />
                        Go to Workspaces
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                {allProjects.length === 0 ? (
                    <EmptyState
                        icon={FiFolder}
                        title="No projects yet"
                        description="Projects from all your workspaces will appear here. Create a workspace first."
                        action={
                            <Link to="/workspaces">
                                <Button>Go to Workspaces</Button>
                            </Link>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allProjects.map((project) => (
                            <Link
                                key={project._id}
                                to={`/projects/${project._id}/kanban`}
                                className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-2xl">
                                                {project.icon || '📁'}
                                            </span>
                                            <h3 className="font-semibold text-gray-900">
                                                {project.name}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {project.description || 'No description'}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectList;
