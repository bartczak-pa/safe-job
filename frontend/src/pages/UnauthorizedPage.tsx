import React from 'react';
import { Link } from 'react-router-dom';

interface UnauthorizedPageProps {
  redirectTo?: string;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  redirectTo = '/dashboard',
}) => {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mb-6 text-gray-600">You don't have permission to access this page.</p>
          <Link to={redirectTo} className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
