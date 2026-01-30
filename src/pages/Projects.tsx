import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, updateProject, deleteProject } from '../api/project.api';
import { useAuth } from '../auth/useAuth';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
}

interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  isDeleted: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

const Projects = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
//   const location = useLocation();
  
  // Fetch projects
  const { data, isLoading, isError, error } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setNewProject({ name: '', description: '' });
      setIsCreating(false);
    },
  });

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: { name?: string; description?: string; status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED' } }) => 
      updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name.trim()) {
      createMutation.mutate(newProject);
    }
  };

  const handleStatusChange = (projectId: string, status: 'ACTIVE' | 'ARCHIVED' | 'DELETED') => {
    updateMutation.mutate({ projectId, data: { status } });
  };

  const handleDelete = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This will be a soft delete.')) {
      deleteMutation.mutate(projectId);
    }
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading projects...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-700">Error Loading Projects</h3>
          </div>
          <p className="text-red-600">{error.message}</p>
          <div className="flex gap-3 mt-4">
            <button 
              onClick={handleGoHome}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Go Home
            </button>
            <button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeProjects = data?.filter(p => !p.isDeleted) || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Go back"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Project Management</h1>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={handleGoHome}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </button>
                <span className="text-gray-400">•</span>
                <p className="text-gray-600">
                  {activeProjects.length} {activeProjects.length === 1 ? 'project' : 'projects'} available
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Project
            </button>
          </div>
        </div>

        {/* Create Project Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
                  <button 
                    onClick={() => setIsCreating(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleCreateProject}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                      <input
                        type="text"
                        placeholder="Enter project name"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={newProject.name}
                        onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                        required
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        placeholder="Project description (optional)"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button 
                      type="submit" 
                      className="flex-1 px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </span>
                      ) : 'Create Project'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsCreating(false)}
                      className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Projects Table */}
        {activeProjects.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeProjects.map((project) => (
                    <tr 
                      key={project._id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{project.name}</div>
                            <div className="text-xs text-gray-500">
                              Created {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs">
                          {project.description || (
                            <span className="text-gray-400 italic">No description</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="shrink-0 h-8 w-8 bg-linear-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                            {project.createdBy.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.createdBy.name}</div>
                            <div className="text-xs text-gray-500">{project.createdBy.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={project.status}
                          onChange={(e) => handleStatusChange(project._id, e.target.value as 'ACTIVE' | 'ARCHIVED' | 'DELETED')}
                          className={`text-sm font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${project.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800 focus:ring-green-500' 
                            : project.status === 'ARCHIVED' 
                            ? 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500' 
                            : 'bg-red-100 text-red-800 focus:ring-red-500'}`}
                          disabled={updateMutation.isPending || user?.role !== 'ADMIN'}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                          <option value="DELETED">DELETED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {user?.role === 'ADMIN' && (
                            <button
                              onClick={() => handleDelete(project._id)}
                              className="inline-flex items-center px-3 py-1.5 bg-linear-to-r from-red-50 to-red-100 text-red-700 font-medium rounded-lg hover:from-red-100 hover:to-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                              disabled={deleteMutation.isPending}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="h-16 w-16 bg-linear-to-r from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Found</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first project.</p>
              <button 
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Project
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(createMutation.isError || updateMutation.isError || deleteMutation.isError) && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-red-700">Error:</span>
            </div>
            <p className="text-red-600 mt-1 text-sm">
              {createMutation.error?.message || updateMutation.error?.message || deleteMutation.error?.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;