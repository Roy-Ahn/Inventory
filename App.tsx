
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
import CheckoutPage from './pages/CheckoutPage';

interface BookingData {
  spaceId: string;
  startDate: string;
  endDate: string;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const { currentUser } = useAuth();

  const navigateTo = useCallback((page: Page, spaceId: string | null = null) => {
    setCurrentPage(page);
    setSelectedSpaceId(spaceId);
    if (page !== 'checkout') {
      setBookingData(null);
    }
    window.scrollTo(0, 0);
  }, []);

  const navigateToCheckout = useCallback((spaceId: string, startDate: string, endDate: string) => {
    setBookingData({ spaceId, startDate, endDate });
    setCurrentPage('checkout');
    setSelectedSpaceId(spaceId);
    window.scrollTo(0, 0);
  }, []);

  const renderPage = () => {
    // Protected routes
    if (currentPage === 'dashboard' && !currentUser) {
      return <LoginPage onNavigate={navigateTo} />;
    }
    if (currentPage === 'admin') {
      if (!currentUser) {
        return <LoginPage onNavigate={navigateTo} />;
      }
      // All logged-in users can access admin page
    }
    if (currentPage === 'profile') {
      if (!currentUser) {
        return <LoginPage onNavigate={navigateTo} />;
      }
    }
    if (currentPage === 'checkout') {
      if (!currentUser) {
        return <LoginPage onNavigate={navigateTo} />;
      }
      if (!bookingData) {
        return <SpacesPage onNavigate={navigateTo} />;
      }
      return (
        <CheckoutPage
          spaceId={bookingData.spaceId}
          startDate={bookingData.startDate}
          endDate={bookingData.endDate}
          onNavigate={navigateTo}
        />
      );
    }
    
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />;
      case 'spaces':
        return <SpacesPage onNavigate={navigateTo} />;
      case 'spaceDetail':
        return selectedSpaceId ? (
          <SpaceDetailPage 
            spaceId={selectedSpaceId} 
            onNavigate={navigateTo}
            onNavigateToCheckout={navigateToCheckout}
          />
        ) : (
          <SpacesPage onNavigate={navigateTo} />
        );
      case 'dashboard':
        return <DashboardPage onNavigate={navigateTo} />;
      case 'admin':
        return <AdminPage />;
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