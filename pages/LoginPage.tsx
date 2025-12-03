
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Page, Role } from '../types';

interface LoginPageProps {
  onNavigate: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('CLIENT');
  const [error, setError] = useState('');
  const { signUp, signIn, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (!name || !email || !password) {
        setError('Please fill in all fields.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      try {
        await signUp(name, email, password, role);
        onNavigate('dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to sign up. Please try again.');
      }
    } else {
      if (!email || !password) {
        setError('Please fill in email and password.');
        return;
      }
      try {
        await signIn(email, password);
        onNavigate('dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to sign in. Please check your credentials.');
      }
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-132px)] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-300 z-0"></div>
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-center text-gray-500 mb-6">
          {isSignUp ? 'Sign up to get started' : 'Sign in to your account'}
        </p>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your name"
              />
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>
          {isSignUp && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to...
              </label>
              <div className="flex space-x-4">
                <label className={`flex-1 cursor-pointer p-3 rounded-lg border-2 transition-all ${role === 'CLIENT' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="CLIENT"
                    checked={role === 'CLIENT'}
                    onChange={() => setRole('CLIENT')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <span className="block font-semibold text-gray-900">Book Space</span>
                    <span className="text-xs text-gray-500">Find storage</span>
                  </div>
                </label>
                <label className={`flex-1 cursor-pointer p-3 rounded-lg border-2 transition-all ${role === 'HOST' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="HOST"
                    checked={role === 'HOST'}
                    onChange={() => setRole('HOST')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <span className="block font-semibold text-gray-900">Host Space</span>
                    <span className="text-xs text-gray-500">List storage</span>
                  </div>
                </label>
              </div>
            </div>
          )}
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400"
          >
            {isLoading ? (isSignUp ? 'Signing Up...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setName('');
                setEmail('');
                setPassword('');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
