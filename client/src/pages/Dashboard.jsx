import React from 'react';
import { Link } from 'react-router-dom';
import { useGetWorkspacesQuery } from '../features/workspaces/workspaceAPI';
import { useGetRecentActivitiesQuery } from '../features/activities/activityAPI';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import PendingInvitations from '../components/dashboard/PendingInvitations';
import { FiGrid, FiPlus, FiFolder, FiCheckSquare, FiClock } from 'react-icons/fi';

const Dashboard = () => {
    const { data: workspacesData, isLoading, error } = useGetWorkspacesQuery();

    // Safely extract workspaces array
    const workspaces = Array.isArray(workspacesData?.data?.workspaces)
        ? workspacesData.data.workspaces
        : Array.isArray(workspacesData?.data)
            ? workspacesData.data
            : [];

    console.log('Workspaces Data:', workspacesData);
    console.log('Workspaces Array:', workspaces);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        console.error('Workspaces Error:', error);
        return (
            <div className="text-center text-red-600 p-4">
                Error loading workspaces: {error?.data?.message || error?.message || 'Please try again.'}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Pending Invitations */}
            <PendingInvitations />

            {/*  Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Welcome back! Here's an overview of your projects.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={FiGrid}
                    title="Workspaces"
                    value={workspaces.length}
                    color="blue"
                />
                <StatCard
                    icon={FiFolder}
                    title="Active Projects"
                    value="0"
                    color="green"
                />
                <StatCard
                    icon={FiCheckSquare}
                    title="Tasks in Progress"
                    value="0"
                    color="purple"
                />
                <StatCard
                    icon={FiClock}
                    title="Overdue Tasks"
                    value="0"
                    color="red"
                />
            </div>

            {/* Workspaces Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Your Workspaces</h2>
                    <Link to="/workspaces">
                        <Button variant="outline" size="sm">
                            <FiPlus className="w-4 h-4 mr-2" />
                            New Workspace
                        </Button>
                    </Link>
                </div>

                {workspaces.length === 0 ? (
                    <EmptyState
                        icon={FiGrid}
                        title="No workspaces yet"
                        description="Create your first workspace to start organizing your projects"
                        action={
                            <Link to="/workspaces">
                                <Button>
                                    <FiPlus className="w-4 h-4 mr-2" />
                                    Create Workspace
                                </Button>
                            </Link>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {workspaces.map((workspace) => (
                            <Link
                                key={workspace._id}
                                to={`/workspaces/${workspace._id}`}
                                className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {workspace.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {workspace.description || 'No description'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm text-gray-500">
                                    <FiFolder className="w-4 h-4 mr-1" />
                                    <span>{workspace.projects?.length || 0} projects</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                <RecentActivityList />
            </div>
        </div>
    );
};

const RecentActivityList = () => {
    const { data: activityData, isLoading } = useGetRecentActivitiesQuery();
    const activities = activityData?.data?.activities || [];

    if (isLoading) {
        return <LoadingSpinner size="sm" />;
    }

    if (activities.length === 0) {
        return (
            <EmptyState
                title="No recent activity"
                description="Your recent workspace activities will appear here"
            />
        );
    }

    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <div key={activity._id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">
                        {activity.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user?.name}</span>{' '}
                            {activity.action}{' '}
                            {activity.entityType}{' '}
                            <span className="font-medium">"{activity.entityName}"</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, color }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
