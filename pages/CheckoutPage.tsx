import React, { useState, useEffect, useMemo } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { getSpaceById } from '../services/storageService';
import { Space, Page } from '../types';
import Spinner from '../components/Spinner';
import BookingSummary from '../components/BookingSummary';
import StripeCheckoutForm from '../components/StripeCheckoutForm';
import { useAuth } from '../contexts/AuthContext';
import { STRIPE_PUBLISHABLE_KEY } from '../constants';

// Initialize Stripe
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

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
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
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

  // Handle successful payment
  const handlePaymentSuccess = (bookingId: string) => {
    console.log('Payment successful! Booking ID:', bookingId);
    // Redirect to dashboard after a brief delay
    setTimeout(() => onNavigate('dashboard'), 2000);
  };

  // Handle payment errors
  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentError(error);
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

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Checkout</h1>

        {/* Check if Stripe is configured */}
        {!stripePromise ? (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="text-yellow-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Stripe Not Configured</h2>
            <p className="text-gray-600 mb-4">
              Please set VITE_STRIPE_PUBLISHABLE_KEY in your environment variables to enable payment processing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Booking Summary */}
            <div>
              <BookingSummary 
                space={space}
                startDate={startDate}
                endDate={endDate}
                totalPrice={totalPrice}
              />
            </div>

            {/* Right Side - Payment Form */}
            <div>
              <Elements stripe={stripePromise}>
                <StripeCheckoutForm
                  spaceId={spaceId}
                  startDate={startDate}
                  endDate={endDate}
                  totalPrice={totalPrice}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
              
              {/* Global Payment Error Display */}
              {paymentError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm text-center font-semibold">{paymentError}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;

