
import React, { useMemo } from 'react';
import { Booking, Space, Page } from '../types';
import Spinner from '../components/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface DashboardPageProps {
  onNavigate: (page: Page, spaceId?: string) => void;
}

interface PopulatedBooking {
  booking: Booking;
  space?: Space;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { bookings: allBookings, spaces, isLoading: loading } = useData();

  // Filter bookings for current user and populate with space data
  const bookings = useMemo<PopulatedBooking[]>(() => {
    if (!currentUser) return [];
    
    return allBookings
      .filter(booking => booking.userId === currentUser.id)
      .map(booking => ({
        booking,
        space: spaces.find(space => space.id === booking.spaceId),
      }));
  }, [allBookings, spaces, currentUser]);

  if (!currentUser) {
    // This case is handled by router in App.tsx, but as a fallback:
    return (
        <div className="text-center py-20">
            <p>Please log in to see your dashboard.</p>
            <button onClick={() => onNavigate('login')} className="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
                Login
            </button>
        </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">Welcome back, {currentUser.name}. Here are your bookings.</p>
        </div>

        {loading ? (
          <Spinner />
        ) : bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map(({ booking, space }) => (
              <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col md:flex-row items-center gap-6">
                <img src={space?.images[0] || 'https://picsum.photos/200'} alt={space?.name || 'Storage Space'} className="w-full md:w-48 h-32 object-cover rounded-xl"/>
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-800">{space?.name || 'Unknown Space'}</h2>
                  <p className="text-gray-500">{space?.location}</p>
                  <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-gray-700">
                    <span><strong>From:</strong> {new Date(booking.startDate).toLocaleDateString()}</span>
                    <span><strong>To:</strong> {new Date(booking.endDate).toLocaleDateString()}</span>
                    <span><strong>Total:</strong> ${booking.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button 
                    onClick={() => space && onNavigate('spaceDetail', space.id)} 
                    className="bg-blue-100 text-blue-700 font-semibold py-2 px-5 rounded-full hover:bg-blue-200 transition-colors duration-300"
                    disabled={!space}
                  >
                    View Space
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800">No Bookings Yet</h3>
            <p className="text-gray-500 mt-2">You haven't booked any storage spaces. Ready to find one?</p>
            <button onClick={() => onNavigate('spaces')} className="mt-6 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300">
              Find a Space
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;