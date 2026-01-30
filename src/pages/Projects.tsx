import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[50vh]"><p>Loading projects...</p></div>;
  }

  if (isError) {
    return <div className="flex justify-center items-center min-h-[50vh]"><p className="text-red-500">Error loading projects: {error.message}</p></div>;
  }

  const activeProjects = data?.filter(p => !p.isDeleted) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Create Project
        </button>
      </div>
      
      {/* Create Project Form */}
      {isCreating && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Create New Project</h2>
          <form onSubmit={handleCreateProject}>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Project Name"
                className="w-full border p-2 rounded"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                placeholder="Description (optional)"
                className="w-full border p-2 rounded"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Projects List */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeProjects.map((project) => (
              <tr key={project._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{project.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-xs truncate">{project.description || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{project.createdBy.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(project._id, e.target.value as 'ACTIVE' | 'ARCHIVED' | 'DELETED')}
                    className={`text-sm rounded ${project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : project.status === 'ARCHIVED' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'} p-1`}
                    disabled={updateMutation.isPending || user?.role !== 'ADMIN'}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                    <option value="DELETED">DELETED</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user?.role === 'ADMIN' && (
                    <>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="mr-2 px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50"
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {(createMutation.isError || updateMutation.isError || deleteMutation.isError) && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {createMutation.error?.message || updateMutation.error?.message || deleteMutation.error?.message}
        </div>
      )}
    </div>
  );
};

export default Projects;