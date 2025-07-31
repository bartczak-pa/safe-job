import React from 'react';
import { useAuthStore } from '../store/authStore';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Safe Job Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.firstName}</span>
              <button onClick={logout} className="btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="card">
              <h3 className="mb-2 text-lg font-medium text-gray-900">Profile Status</h3>
              <p className="text-sm text-gray-600">
                Role: <span className="font-medium">{user?.role}</span>
              </p>
              <p className="text-sm text-gray-600">
                Status:{' '}
                <span className="font-medium">
                  {user?.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </p>
            </div>

            <div className="card">
              <h3 className="mb-2 text-lg font-medium text-gray-900">Quick Actions</h3>
              <div className="space-y-2">
                {user?.role === 'candidate' ? (
                  <>
                    <button className="btn-primary w-full text-sm">Browse Jobs</button>
                    <button className="btn-secondary w-full text-sm">Update Profile</button>
                  </>
                ) : (
                  <>
                    <button className="btn-primary w-full text-sm">Post a Job</button>
                    <button className="btn-secondary w-full text-sm">View Applications</button>
                  </>
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="mb-2 text-lg font-medium text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500">No recent activity to display.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
