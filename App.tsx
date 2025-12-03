
import React, { useState, useCallback } from 'react';
import { Page } from './types';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SpacesPage from './pages/SpacesPage';
import SpaceDetailPage from './pages/SpaceDetailPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import ProfilePage from './pages/ProfilePage';
import HostProfilePage from './pages/HostProfilePage';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const navigateTo = (page: Page, id?: string) => {
    if (page === 'spaceDetail' && id) {
      setSelectedSpaceId(id);
    } else {
      setSelectedSpaceId(null); // Clear spaceId if not navigating to spaceDetail
    }
    if (page === 'hostProfile' && id) {
      setSelectedHostId(id);
    } else {
      setSelectedHostId(null); // Clear hostId if not navigating to hostProfile
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    // Protected routes
    if (currentPage === 'dashboard' && !currentUser) {
      return <LoginPage onNavigate={navigateTo} />;
    }
    if (currentPage === 'admin') {
      if (!currentUser) {
        return <LoginPage onNavigate={navigateTo} />;
      }
      if (currentUser.role !== 'HOST') {
        return <AccessDeniedPage onNavigate={navigateTo} />;
      }
    }
    if (currentPage === 'profile') {
      if (!currentUser) {
        return <LoginPage onNavigate={navigateTo} />;
      }
    }
    if (currentPage === 'hostProfile' && !selectedHostId) {
      // If hostProfile is requested but no hostId is set, redirect to spaces or home
      return <SpacesPage onNavigate={navigateTo} />;
    }


    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />;
      case 'spaces':
        return <SpacesPage onNavigate={navigateTo} />;
      case 'spaceDetail':
        return selectedSpaceId ? <SpaceDetailPage spaceId={selectedSpaceId} onNavigate={navigateTo} /> : <SpacesPage onNavigate={navigateTo} />;
      case 'dashboard':
        return <DashboardPage onNavigate={navigateTo} />;
      case 'admin':
        return <AdminPage />;
      case 'profile':
        return <ProfilePage onNavigate={navigateTo} />;
      case 'hostProfile':
        return selectedHostId ? <HostProfilePage hostId={selectedHostId} onNavigate={navigateTo} /> : <SpacesPage onNavigate={navigateTo} />;
      case 'login':
        return <LoginPage onNavigate={navigateTo} />;
      case 'accessDenied':
        return <AccessDeniedPage onNavigate={navigateTo} />;
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800">
      <Header onNavigate={navigateTo} />
      <main className="flex-grow">
        <div className="w-full transition-opacity duration-500 ease-in-out">
          {renderPage()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;