
import React from 'react';
import { Page } from '../types';

interface AccessDeniedPageProps {
  onNavigate: (page: Page) => void;
}

const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({ onNavigate }) => {
  return (
    <div className="container mx-auto px-6 py-24 text-center">
      <div className="max-w-md mx-auto bg-white p-10 rounded-2xl shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 1a9 9 0 100 18 9 9 0 000-18zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
        <button
          onClick={() => onNavigate('home')}
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
