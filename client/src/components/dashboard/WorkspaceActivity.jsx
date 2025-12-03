import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetWorkspaceActivitiesQuery } from '../../features/activities/activityAPI';
import { useGetWorkspaceQuery } from '../../features/workspaces/workspaceAPI';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import { FiClock, FiArrowLeft } from 'react-icons/fi';

const WorkspaceActivity = () => {
    const { workspaceId } = useParams();

    const { data: workspaceData } = useGetWorkspaceQuery(workspaceId);
    const { data: activityData, isLoading } = useGetWorkspaceActivitiesQuery({
        workspaceId,
        limit: 50
    });

    const workspace = workspaceData?.data?.workspace || workspaceData?.data;
    const activities = activityData?.data?.activities || [];

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
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                        <Link to={`/workspaces/${workspaceId}`} className="hover:text-primary-600">
                            {workspace?.name || 'Workspace'}
                        </Link>
                        <span>/</span>
                        <span>Activity Log</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Workspace Activity</h1>
                    <p className="text-gray-600 mt-1">
                        Track all changes and updates in this workspace
                    </p>
                </div>
                <Link to={`/workspaces/${workspaceId}`}>
                    <Button variant="outline">
                        <FiArrowLeft className="w-4 h-4 mr-2" />
                        Back to Workspace
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                {activities.length === 0 ? (
                    <EmptyState
                        icon={FiClock}
                        title="No activities yet"
                        description="Activities will appear here when you start working"
                    />
                ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {activities.map((activity) => (
                            <div key={activity._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                {/* Icon */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                    <div className="font-bold text-xs">
                                        {activity.user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                </div>

                                {/* Card */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                        <div className="font-bold text-slate-900">{activity.user?.name}</div>
                                        <time className="font-caveat font-medium text-indigo-500 text-xs">
                                            {new Date(activity.createdAt).toLocaleString()}
                                        </time>
                                    </div>
                                    <div className="text-slate-500 text-sm">
                                        {activity.action} <span className="font-medium text-slate-800">{activity.entityType}</span> "{activity.entityName}"
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspaceActivity;
