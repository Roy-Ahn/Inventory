import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

interface StripeCheckoutFormProps {
  spaceId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  onSuccess: (bookingId: string) => void;
  onError: (error: string) => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  spaceId,
  startDate,
  endDate,
  totalPrice,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to complete booking.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment method from card details
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement as any,
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      // Get Supabase session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      // Use Supabase Edge Function endpoint
      const endpoint = SUPABASE_URL && SUPABASE_URL !== 'https://placeholder.supabase.co'
        ? `${SUPABASE_URL}/functions/v1/create-booking`
        : '/api/create-booking'; // Fallback if Supabase not configured

      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add Supabase authentication headers if available
      if (SUPABASE_URL && SUPABASE_URL !== 'https://placeholder.supabase.co') {
        // Supabase Edge Functions ALWAYS need the apikey header (anon key)
        if (SUPABASE_ANON_KEY) {
          headers['apikey'] = SUPABASE_ANON_KEY;
        }
        // Add user's auth token if logged in (optional)
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: Math.round(totalPrice * 100), // Convert to cents for Stripe
          spaceId: spaceId,
          userId: currentUser?.id || null,
          startDate: startDate,
          endDate: endDate,
          currency: 'usd',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      // Call success callback with booking ID
      onSuccess(data.bookingId);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Stripe CardElement styling options
  const cardElementOptions = {
    hidePostalCode: false, // Explicitly show postal code field
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Information</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Card Details Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
              <CardElement options={cardElementOptions} />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your payment information is encrypted and secure.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium text-sm">Payment Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Order Total Summary */}
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Order Total</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold text-gray-900">$0.00</span>
              </div>
              <div className="border-t border-blue-300 pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="terms" 
                required 
                className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                I agree to the terms and conditions. This booking is non-refundable after confirmation.
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!stripe || loading}
            className={`w-full font-bold py-4 px-6 rounded-lg transition-colors duration-300 text-lg ${
              loading || !stripe
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Processing Payment...' : `Complete Booking - $${totalPrice.toFixed(2)}`}
          </button>

          {/* Security Notice */}
          <p className="text-xs text-center text-gray-500">
            By confirming, you authorize StoreAway to charge your card for this booking.
          </p>
        </div>
      </form>
    </div>
  );
};

export default StripeCheckoutForm;