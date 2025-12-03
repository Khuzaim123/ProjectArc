import React from 'react';
import { FiShield, FiLock, FiEye, FiServer } from 'react-icons/fi';

const PrivacyPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                <p className="text-xl text-gray-600">
                    How we handle and protect your data at ProjectArc
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
                <section>
                    <div className="flex items-center space-x-3 mb-4">
                        <FiShield className="w-6 h-6 text-primary-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Data Collection</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        We collect information you provide directly to us, such as when you create an account, update your profile, create workspaces, or post comments. This includes:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 ml-4">
                        <li>Account information (Name, Email, Password)</li>
                        <li>Profile content (Avatar, Job Title)</li>
                        <li>Workspace data (Projects, Tasks, Comments)</li>
                    </ul>
                </section>

                <section>
                    <div className="flex items-center space-x-3 mb-4">
                        <FiLock className="w-6 h-6 text-primary-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        We implement appropriate technical and organizational measures to protect the security of your personal information. Your password is hashed using bcrypt, and all data transmission occurs over secure SSL/TLS encrypted connections.
                    </p>
                </section>

                <section>
                    <div className="flex items-center space-x-3 mb-4">
                        <FiEye className="w-6 h-6 text-primary-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Data Usage</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 ml-4">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process transactions and send related information</li>
                        <li>Send you technical notices, updates, and support messages</li>
                        <li>Respond to your comments and questions</li>
                    </ul>
                </section>

                <section>
                    <div className="flex items-center space-x-3 mb-4">
                        <FiServer className="w-6 h-6 text-primary-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Data Retention</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        We store the information we collect about you for as long as is necessary for the purpose(s) for which we originally collected it. You may request deletion of your account and data at any time via the Settings page.
                    </p>
                </section>

                <div className="border-t pt-8 mt-8">
                    <p className="text-sm text-gray-500 text-center">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
