import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaJournalWhills } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const BeginnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to UrbanSprout, {user.name}! 🌱</h2>
          <p className="text-green-100">
            Start your plant journey with our beginner-friendly guides and community support.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/my-garden-journal')}
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaJournalWhills className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">My Garden Journal</h3>
                <p className="text-gray-600 text-sm">Track your plants, progress, and memories</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default BeginnerDashboard;