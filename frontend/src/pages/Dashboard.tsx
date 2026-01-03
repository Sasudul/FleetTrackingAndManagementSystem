import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="text-xl font-bold text-blue-600">FleetTracker</div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.fullName}</span>
              <button
                onClick={logout}
                className="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="rounded-lg border-4 border-dashed border-gray-200 p-10 text-center">
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>
            <p className="mt-2 text-gray-600">Map and Fleet statistics will go here.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;