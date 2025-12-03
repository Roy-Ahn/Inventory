import React from 'react';
import { Page } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onNavigate: (page: Page) => void;
}

const NavLink: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="text-gray-600 hover:text-primary-600 transition-colors duration-300 font-medium px-3 py-2 rounded-md"
  >
    {children}
  </button>
);

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  return (
    <header className="sticky top-0 glass z-50 w-full transition-all duration-300">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={() => onNavigate('home')} className="text-2xl font-bold text-gradient tracking-tight">
            Inventory
          </button>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <NavLink onClick={() => onNavigate('home')}>Home</NavLink>
          <NavLink onClick={() => onNavigate('spaces')}>Find a Space</NavLink>
          {currentUser && (
            <>
              <NavLink onClick={() => onNavigate('dashboard')}>My Dashboard</NavLink>
              {currentUser.role === 'HOST' && <NavLink onClick={() => onNavigate('admin')}>Inventory</NavLink>}
            </>
          )}
        </div>
        <div className="hidden md:flex items-center space-x-4">
          {currentUser ? (
            <>
              <button
                onClick={() => onNavigate('profile')}
                className="text-gray-600 hover:text-primary-600 transition-colors duration-300 font-medium"
              >
                Hi, {currentUser.name.split(' ')[0]}
              </button>
              <button onClick={handleLogout} className="bg-primary-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => onNavigate('login')} className="bg-primary-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Login
            </button>
          )}
        </div>
        <div className="md:hidden">
          {/* Mobile menu button can be added here */}
        </div>
      </nav>
    </header>
  );
};

export default Header;