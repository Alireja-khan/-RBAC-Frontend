import React from 'react';
import { useAuth } from '../auth/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name || user?.email}</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {user?.role} Role
            </span>
            <button 
              onClick={handleLogout}
              className="block mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">User Info</h3>
            <p className="mb-1">Name: {user?.name || 'N/A'}</p>
            <p className="mb-1">Email: {user?.email || 'N/A'}</p>
            <p className="mb-1">Role: {user?.role || 'N/A'}</p>
            <p>Status: {user?.status || 'N/A'}</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Access Level</h3>
            <p className="mb-2">You have access to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>View projects</li>
              <li>Create new projects</li>
              {user?.role === 'ADMIN' && <li>Manage users</li>}
              {user?.role === 'ADMIN' && <li>Edit/delete projects</li>}
            </ul>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Navigation</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <a href="/projects" className="hover:underline">Projects</a>
              </li>
              {user?.role === 'ADMIN' && (
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <a href="/users" className="hover:underline">User Management</a>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">About This System</h2>
          <p className="text-gray-600 mb-3">
            Welcome to the Role-Based Access Control (RBAC) Project Management System.
          </p>
          <p className="text-gray-600 mb-3">
            As a <span className="font-semibold">{user?.role}</span>, you have specific permissions within this system.
            {user?.role === 'ADMIN' && ' You can manage users and control all project operations.'}
            {user?.role !== 'ADMIN' && ' You can create and view projects, but only admins can edit or delete them.'}
          </p>
          <p className="text-gray-600">
            All user registrations are controlled by administrators through invite tokens.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;