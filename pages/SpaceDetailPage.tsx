
import React, { useState, useEffect, useMemo } from 'react';
import { getSpaceById } from '../services/storageService';
import { Space, Page, Booking } from '../types';
import Spinner from '../components/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import { supabase } from '../lib/supabase';
import { ReviewSection } from '../components/ReviewSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface SpaceDetailPageProps {
  spaceId: string;
  onNavigate: (page: Page, spaceId?: string) => void;
}

const SpaceDetailPage: React.FC<SpaceDetailPageProps> = ({ spaceId, onNavigate }) => {
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState('');
  const [clientSecret, setClientSecret] = useState("");

  const { currentUser } = useAuth();
  const { createBooking } = useData();

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        setLoading(true);
        const data = await getSpaceById(spaceId);
        if (data) {
          setSpace(data);
          setMainImage(data.images[0]);
        } else {
          setError('Space not found.');
        }
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
    return (months * space.pricePerMonth).toFixed(2);
  }, [startDate, endDate, space]);

  const initiateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!space || !totalPrice || parseFloat(totalPrice) <= 0 || !currentUser) {
      setBookingError('Please select valid start and end dates.');
      return;
    }

    setBookingStatus('booking');
    setBookingError('');

    // Create PaymentIntent as soon as the user clicks book
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount: Math.round(parseFloat(totalPrice) * 100), currency: 'usd' } // Amount in cents
      });

      if (error) throw error;
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error("Error creating payment intent:", err);
      setBookingError('Failed to initialize payment. Please try again.');
      setBookingStatus('idle');
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!space || !currentUser || !totalPrice) return;

    try {
      const bookingData: Omit<Booking, 'id' | 'totalPrice'> & { totalPrice: number } = {
        spaceId: space.id,
        userId: currentUser.id,
        startDate,
        endDate,
        totalPrice: parseFloat(totalPrice),
        paymentIntentId: paymentIntentId,
        paymentStatus: 'succeeded'
      };
      await createBooking(bookingData);
      setBookingStatus('success');
      setTimeout(() => onNavigate('dashboard'), 2000);
    } catch (err) {
      console.error("Error creating booking after payment:", err);
      setBookingError('Payment successful but booking creation failed. Please contact support.');
      setBookingStatus('error');
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setBookingError(errorMessage);
    setBookingStatus('idle'); // Allow retry
  };

  const appearance = {
    theme: 'stripe' as const,
  };
  const options = {
    clientSecret,
    appearance,
  };

  if (loading) return <div className="py-20"><Spinner /></div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!space) return null;

  return (
    <div className="container mx-auto px-6 py-12">
      <Button onClick={() => onNavigate('spaces')} variant="ghost" className="mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        <span>Back to Spaces</span>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <img src={mainImage || space.images[0]} alt="Main view" className="w-full h-96 object-cover transition-opacity duration-300" />
            <div className="flex p-2 space-x-2 bg-gray-100">
              {space.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => setMainImage(img)}
                  className={`w-24 h-16 object-cover rounded-lg cursor-pointer border-2 ${mainImage === img ? 'border-blue-500' : 'border-transparent'} hover:border-blue-400 transition-all`}
                />
              ))}
            </div>
          </Card>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">{space.description}</p>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80 rounded-lg overflow-hidden border border-gray-200">
                <iframe
                  title="Space Location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(space.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardContent className="p-8">
              <ReviewSection spaceId={space.id} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-28">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{space.name}</CardTitle>
                <CardDescription>{space.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center border-t border-b border-gray-200 py-4 my-4">
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="font-bold text-lg">{space.size} sq ft</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-bold text-lg text-blue-600">${space.pricePerMonth} / month</p>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2 text-gray-800">Features</h3>
                  <ul className="space-y-2">
                    {space.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-center">Book This Space</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!currentUser ? (
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">You must be logged in to book a space.</p>
                        <Button onClick={() => onNavigate('login')} className="w-full">
                          Login to Book
                        </Button>
                      </div>
                    ) : space.isAvailable ? (
                      <>
                        {!clientSecret ? (
                          <form onSubmit={initiateBooking}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <Label htmlFor="start-date">Start Date</Label>
                                <Input type="date" id="start-date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="end-date">End Date</Label>
                                <Input type="date" id="end-date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
                              </div>
                            </div>
                            <div className="text-center bg-white p-3 rounded-lg mb-4">
                              <p className="text-sm text-gray-500">Estimated Total</p>
                              <p className="text-2xl font-bold text-blue-600">${totalPrice}</p>
                            </div>
                            {bookingError && (
                              <Alert variant="destructive" className="mb-2">
                                <AlertDescription>{bookingError}</AlertDescription>
                              </Alert>
                            )}
                            <Button type="submit" disabled={bookingStatus === 'booking'} className="w-full">
                              {bookingStatus === 'booking' ? 'Processing...' : 'Book Now'}
                            </Button>
                          </form>
                        ) : (
                          <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm amount={parseFloat(totalPrice)} onSuccess={handlePaymentSuccess} onError={handlePaymentError} />
                          </Elements>
                        )}
                        {bookingStatus === 'success' && (
                          <Alert className="mt-4">
                            <AlertDescription className="text-green-600 font-semibold">Booking successful! Redirecting...</AlertDescription>
                          </Alert>
                        )}
                      </>
                    ) : (
                      <Alert variant="destructive">
                        <AlertDescription className="font-bold">This space is currently unavailable.</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceDetailPage;
