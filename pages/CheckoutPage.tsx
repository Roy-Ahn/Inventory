import React, { useState, useEffect, useMemo } from 'react';
import { getSpaceById, createBooking } from '../services/storageService';
import { Space, Page, Booking } from '../types';
import Spinner from '../components/Spinner';
import BookingSummary from '../components/BookingSummary';
import { useAuth } from '../contexts/AuthContext';

interface CheckoutPageProps {
  spaceId: string;
  startDate: string;
  endDate: string;
  onNavigate: (page: Page, spaceId?: string) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ spaceId, startDate, endDate, onNavigate }) => {
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState('');
  
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        setLoading(true);
        const data = await getSpaceById(spaceId);
        if (!data) {
          setError('Space not found.');
          return;
        }
        setSpace(data);
      } catch (err) {
        setError('Failed to load space details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpace();
  }, [spaceId]);

  const totalPrice = useMemo(() => {
    if (!startDate || !endDate || !space) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return 0;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = diffDays / 30.44; // Average days in a month
    return parseFloat((months * space.pricePerMonth).toFixed(2));
  }, [startDate, endDate, space]);

  const handleConfirmBooking = async () => {
    if (!space || !totalPrice || totalPrice <= 0 || !currentUser) {
      setBookingError('Invalid booking information. Please try again.');
      return;
    }

    setBookingStatus('booking');
    setBookingError('');
    
    try {
      const bookingData: Omit<Booking, 'id' | 'totalPrice'> & {totalPrice: number} = {
        spaceId: space.id,
        userId: currentUser.id,
        startDate,
        endDate,
        totalPrice,
      };
      await createBooking(bookingData);
      setBookingStatus('success');
      setTimeout(() => onNavigate('dashboard'), 2000);
    } catch (err: any) {
      setBookingStatus('error');
      setBookingError(err.message || 'Failed to create booking. Please try again.');
    }
  };

  if (loading) return <div className="py-20"><Spinner /></div>;
  
  if (error || !space) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'Space not found'}</p>
          <button 
            onClick={() => onNavigate('spaces')} 
            className="mt-6 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700"
          >
            Back to Spaces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <button 
        onClick={() => onNavigate('spaceDetail', spaceId)} 
        className="mb-8 text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>Back to Space Details</span>
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-2">
            <BookingSummary 
              space={space}
              startDate={startDate}
              endDate={endDate}
              totalPrice={totalPrice}
            />
          </div>

          {/* Order Total & Confirm */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Total</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {bookingError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm text-center">{bookingError}</p>
                </div>
              )}

              {bookingStatus === 'success' && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm text-center font-semibold">
                    Booking successful! Redirecting to dashboard...
                  </p>
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={bookingStatus === 'booking' || bookingStatus === 'success'}
                className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
              >
                {bookingStatus === 'booking' ? 'Processing...' : bookingStatus === 'success' ? 'Success!' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

