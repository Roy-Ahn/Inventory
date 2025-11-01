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
    className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium px-3 py-2 rounded-md"
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
    <header className="sticky top-0 bg-white/80 backdrop-blur-lg shadow-sm z-50 w-full">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={() => onNavigate('home')} className="text-2xl font-bold text-blue-600">
            Inventory
          </button>
        </div>
        <div className="hidden md:flex items-center space-x-1">
          <NavLink onClick={() => onNavigate('home')}>Home</NavLink>
          <NavLink onClick={() => onNavigate('spaces')}>Find a Space</NavLink>
          {currentUser && (
            <>
              <NavLink onClick={() => onNavigate('dashboard')}>My Dashboard</NavLink>
              <NavLink onClick={() => onNavigate('admin')}>Admin</NavLink>
            </>
          )}
        </div>
        <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
                 <>
                    <button 
                      onClick={() => onNavigate('profile')} 
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium"
                    >
                      Hi, {currentUser.name.split(' ')[0]}
                    </button>
                    <button onClick={handleLogout} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                        Logout
                    </button>
                 </>
            ) : (
                <button onClick={() => onNavigate('login')} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">
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