import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import toast from '../utils/toast';
import { FiBell, FiMail, FiSmartphone, FiGlobe, FiShield } from 'react-icons/fi';

import { useGetPreferencesQuery, useUpdatePreferencesMutation } from '../features/users/userAPI';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Settings = () => {
    const { data: prefData, isLoading } = useGetPreferencesQuery();
    const [updatePreferences, { isLoading: isSaving }] = useUpdatePreferencesMutation();

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: false,
        taskAssignments: true,
        taskComments: true,
        projectUpdates: true,
        weeklyDigest: false,
    });

    // Load initial data
    React.useEffect(() => {
        if (prefData?.data?.preferences) {
            const prefs = prefData.data.preferences;
            setNotifications({
                emailNotifications: prefs.email,
                pushNotifications: prefs.push,
                taskAssignments: prefs.taskAssigned,
                taskComments: prefs.taskComment,
                projectUpdates: prefs.projectUpdate,
                weeklyDigest: prefs.weeklyDigest,
            });
        }
    }, [prefData]);

    const handleSaveSettings = async () => {
        try {
            await updatePreferences({
                email: notifications.emailNotifications,
                push: notifications.pushNotifications,
                taskAssigned: notifications.taskAssignments,
                taskComment: notifications.taskComments,
                projectUpdate: notifications.projectUpdates,
                weeklyDigest: notifications.weeklyDigest,
            }).unwrap();

            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error(error?.data?.message || 'Failed to save settings');
        }
    };

    const handleToggle = (setting) => {
        setNotifications({
            ...notifications,
            [setting]: !notifications[setting],
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">
                    Manage your preferences and application settings
                </p>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <FiBell className="w-6 h-6 text-gray-700" />
                    <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <FiMail className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="font-medium text-gray-900">Email Notifications</p>
                                <p className="text-sm text-gray-500">Receive notifications via email</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.emailNotifications}
                                onChange={() => handleToggle('emailNotifications')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <FiSmartphone className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="font-medium text-gray-900">Push Notifications</p>
                                <p className="text-sm text-gray-500">Receive push notifications</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.pushNotifications}
                                onChange={() => handleToggle('pushNotifications')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                    </div>

                    <hr className="my-4" />

                    <h3 className="font-semibold text-gray-900 mb-3">Notify me when:</h3>

                    <div className="space-y-3 pl-4">
                        {[
                            { key: 'taskAssignments', label: 'I am assigned to a task' },
                            { key: 'taskComments', label: 'Someone comments on my task' },
                            { key: 'projectUpdates', label: 'Projects I follow are updated' },
                            { key: 'weeklyDigest', label: 'Send weekly activity digest' },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between">
                                <p className="text-gray-700">{item.label}</p>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications[item.key]}
                                        onChange={() => handleToggle(item.key)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Language & Region */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <FiGlobe className="w-6 h-6 text-gray-700" />
                    <h2 className="text-xl font-semibold text-gray-900">Language & Region</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Timezone
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="UTC">UTC (GMT+0)</option>
                            <option value="EST">Eastern Time (GMT-5)</option>
                            <option value="PST">Pacific Time (GMT-8)</option>
                            <option value="CET">Central European Time (GMT+1)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <FiShield className="w-6 h-6 text-gray-700" />
                    <h2 className="text-xl font-semibold text-gray-900">Privacy & Security</h2>
                </div>

                <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                        Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                        Active Sessions
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                        Active Sessions
                    </Button>
                    <Link to="/privacy" className="w-full">
                        <Button variant="outline" className="w-full justify-start">
                            Privacy Policy
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSaveSettings} loading={isSaving}>
                    Save Settings
                </Button>
            </div>
        </div>
    );
};

export default Settings;
