import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
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
      setInviteErrors({});
      // Scroll to success banner
      setTimeout(() => {
        const element = document.getElementById('invite-success-banner');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-green-400');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-green-400');
          }, 2000);
        }
      }, 100);
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

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading users...</p>
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
            <h3 className="text-lg font-semibold text-red-700">Error Loading Users</h3>
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
              onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((data?.total || 0) / (data?.limit || 10)) || 1;

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
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
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
                  {data?.total || 0} {data?.total === 1 ? 'user' : 'users'} total
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="inline-flex items-center px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {showInviteForm ? 'Cancel Invite' : 'Invite User'}
              {!showInviteForm && (
                <span className="ml-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  + Link Generated
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Invite User Modal */}
        {showInviteForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Invite New User</h2>
                  <button 
                    onClick={() => {
                      setShowInviteForm(false);
                      setInviteErrors({});
                    }}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleCreateInvite}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        className={`w-full px-4 py-2.5 border ${inviteErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:ring-2 focus:border-blue-500 transition-all`}
                        value={newInvite.email}
                        onChange={(e) => {
                          setNewInvite({...newInvite, email: e.target.value});
                          if (inviteErrors.email) setInviteErrors(prev => ({...prev, email: undefined}));
                        }}
                        required
                        autoFocus
                      />
                      {inviteErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{inviteErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={newInvite.role}
                        onChange={(e) => setNewInvite({...newInvite, role: e.target.value as 'ADMIN' | 'MANAGER' | 'STAFF'})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="STAFF">STAFF</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex gap-3">
                    <button 
                      type="submit" 
                      className="flex-1 px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={createInviteMutation.isPending}
                    >
                      {createInviteMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : 'Send Invite'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowInviteForm(false);
                        setNewInvite({ email: '', role: 'STAFF' });
                        setInviteErrors({});
                      }}
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

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.users.map((user) => (
                  <tr 
                    key={user._id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10 bg-linear-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value as 'ADMIN' | 'MANAGER' | 'STAFF')}
                        className={`text-sm font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${user.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-800 focus:ring-red-500' 
                          : user.role === 'MANAGER' 
                          ? 'bg-blue-100 text-blue-800 focus:ring-blue-500' 
                          : 'bg-green-100 text-green-800 focus:ring-green-500'}`}
                        disabled={updateRoleMutation.isPending}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="STAFF">STAFF</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'}`}>
                          {user.status === 'ACTIVE' ? (
                            <>
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                              ACTIVE
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
                              INACTIVE
                            </>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStatusChange(user._id, user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${user.status === 'ACTIVE' 
                            ? 'bg-linear-to-r from-red-50 to-red-100 text-red-700 hover:from-red-100 hover:to-red-200 focus:ring-red-300' 
                            : 'bg-linear-to-r from-green-50 to-green-100 text-green-700 hover:from-green-100 hover:to-green-200 focus:ring-green-300'}`}
                          disabled={updateStatusMutation.isPending}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {user.status === 'ACTIVE' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                          {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * (data?.limit || 10) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * (data?.limit || 10), data?.total || 0)}
                </span>{' '}
                of <span className="font-medium">{data?.total || 0}</span> users
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${currentPage === pageNum 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages || isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(createInviteMutation.isError || updateRoleMutation.isError || updateStatusMutation.isError) && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-red-700">Error:</span>
            </div>
            <p className="text-red-600 mt-1 text-sm">
              {createInviteMutation.error?.message || updateRoleMutation.error?.message || updateStatusMutation.error?.message}
            </p>
          </div>
        )}

        {/* Success Message with Invite Link - Positioned prominently */}
        {createInviteMutation.isSuccess && !showInviteForm && (
          <div 
            id="invite-success-banner"
            className="mb-6 p-6 bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-[1.02] relative"
          >
            {/* Animated indicator arrow */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="animate-bounce">
                <svg className="w-8 h-8 text-green-500 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div className="text-xs text-green-600 font-bold text-center mt-1 animate-pulse">LINK BELOW</div>
            </div>
            
            <div className="flex items-start gap-4 pt-4">
              <div className="shrink-0 mt-1">
                <div className="animate-pulse">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center gap-2">
                  🎉 Invitation Sent Successfully!
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                    NEW
                  </span>
                </h3>
                <p className="text-green-700 mb-5 text-lg">
                  An invitation has been sent to <span className="font-bold text-green-900">{newInvite.email}</span>. 
                  <span className="font-semibold">Share the link below</span> with them to complete registration.
                </p>
                
                <div className="bg-white border border-green-300 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1 font-medium">INVITATION LINK</p>
                      <input
                        type="text"
                        readOnly
                        value={createInviteMutation.data?.inviteLink || `https://rbac-frontend-7u53.vercel.app/register/${createInviteMutation.data?.token}`}
                        className="w-full bg-gray-50 text-sm text-gray-800 px-3 py-2 rounded border border-gray-200 truncate font-mono"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const linkToCopy = createInviteMutation.data?.inviteLink || `https://rbac-frontend-7u53.vercel.app/register/${createInviteMutation.data?.token}`;
                        navigator.clipboard.writeText(linkToCopy);
                        alert('✅ Link copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center text-xs text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  This link will expire in 24 hours
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;