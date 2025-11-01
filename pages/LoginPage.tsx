
import React, { useState } from 'react';
import { MOCK_USERS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { Page } from '../types';

interface LoginPageProps {
    onNavigate: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [selectedUserId, setSelectedUserId] = useState(MOCK_USERS[0]?.id || '');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedUserId) {
        setError('Please select a user to log in.');
        return;
    }
    try {
        await login(selectedUserId);
        onNavigate('dashboard');
    } catch (err) {
        setError('Failed to log in. Please try again.');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-132px)] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-300 z-0"></div>
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-center text-gray-500 mb-6">Select a profile to sign in.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-1">
              Login As
            </label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {MOCK_USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
           {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
