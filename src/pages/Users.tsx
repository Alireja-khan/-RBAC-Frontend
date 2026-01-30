import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserRole, updateUserStatus } from '../api/user.api';
import { createInviteApi } from '../api/auth.api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  status: 'ACTIVE' | 'INACTIVE';
  invitedAt: string;
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

const Users = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newInvite, setNewInvite] = useState({ email: '', role: 'STAFF' as 'ADMIN' | 'MANAGER' | 'STAFF' });
  const [inviteErrors, setInviteErrors] = useState<{ email?: string }>({});
  const queryClient = useQueryClient();
  
  // Fetch users
  const { data, isLoading, isError, error } = useQuery<UsersResponse>({
    queryKey: ['users', currentPage],
    queryFn: () => getUsers(currentPage),
  });

  // Create invite mutation
  const createInviteMutation = useMutation({
    mutationFn: createInviteApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setNewInvite({ email: '', role: 'STAFF' });
      setShowInviteForm(false);
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'ADMIN' | 'MANAGER' | 'STAFF' }) => 
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'ACTIVE' | 'INACTIVE' }) => 
      updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleRoleChange = (userId: string, newRole: 'ADMIN' | 'MANAGER' | 'STAFF') => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleStatusChange = (userId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    updateStatusMutation.mutate({ userId, status: newStatus });
  };

  const validateInviteForm = () => {
    const newErrors: { email?: string } = {};
    
    if (!newInvite.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newInvite.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setInviteErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateInviteForm()) {
      createInviteMutation.mutate(newInvite);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[50vh]"><p>Loading users...</p></div>;
  }

  if (isError) {
    return <div className="flex justify-center items-center min-h-[50vh]"><p className="text-red-500">Error loading users: {error.message}</p></div>;
  }

  const totalPages = Math.ceil((data?.total || 0) / (data?.limit || 10)) || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button 
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          {showInviteForm ? 'Cancel Invite' : 'Invite User'}
        </button>
      </div>
      
      {/* Invite Form */}
      {showInviteForm && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Invite New User</h2>
          <form onSubmit={handleCreateInvite}>
            <div className="mb-3">
              <input
                type="email"
                placeholder="Email Address"
                className={`w-full border p-2 rounded ${inviteErrors.email ? 'border-red-500' : ''}`}
                value={newInvite.email}
                onChange={(e) => {
                  setNewInvite({...newInvite, email: e.target.value});
                  if (inviteErrors.email) setInviteErrors(prev => ({...prev, email: undefined}));
                }}
                required
              />
              {inviteErrors.email && <p className="text-red-500 text-sm mt-1">{inviteErrors.email}</p>}
            </div>
            <div className="mb-3">
              <select
                value={newInvite.role}
                onChange={(e) => setNewInvite({...newInvite, role: e.target.value as 'ADMIN' | 'MANAGER' | 'STAFF'})}
                className="w-full border p-2 rounded"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="STAFF">STAFF</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                disabled={createInviteMutation.isPending}
              >
                {createInviteMutation.isPending ? 'Sending...' : 'Send Invite'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowInviteForm(false);
                  setNewInvite({ email: '', role: 'STAFF' });
                  setInviteErrors({});
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
          
          {createInviteMutation.isError && (
            <div className="mt-3 p-3 bg-red-100 text-red-700 rounded">
              Error sending invite: {createInviteMutation.error?.message}
            </div>
          )}
          
          {createInviteMutation.isSuccess && (
            <div className="mt-3 p-3 bg-green-100 text-green-700 rounded">
              Invite sent successfully!
            </div>
          )}
        </div>
      )}
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value as 'ADMIN' | 'MANAGER' | 'STAFF')}
                    className={`text-sm rounded border ${user.role === 'ADMIN' ? 'bg-red-100' : user.role === 'MANAGER' ? 'bg-blue-100' : 'bg-green-100'} p-1`}
                    disabled={updateRoleMutation.isPending}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="STAFF">STAFF</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleStatusChange(user._id, user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    className={`mr-2 px-3 py-1 rounded text-xs ${user.status === 'ACTIVE' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    disabled={updateStatusMutation.isPending}
                  >
                    {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || isLoading}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages} ({data?.total} total users)
        </span>
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage >= totalPages || isLoading}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      
      {(updateRoleMutation.isError || updateStatusMutation.isError) && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error updating user: {updateRoleMutation.error?.message || updateStatusMutation.error?.message}
        </div>
      )}
    </div>
  );
};

export default Users;