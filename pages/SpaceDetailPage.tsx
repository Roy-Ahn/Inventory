
import React, { useState, useEffect, useMemo } from 'react';
import { getSpaceById, createBooking } from '../services/storageService';
import { Space, Page, Booking } from '../types';
import Spinner from '../components/Spinner';
import { useAuth } from '../contexts/AuthContext';

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
  
  const { currentUser } = useAuth();

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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!space || !totalPrice || parseFloat(totalPrice) <= 0 || !currentUser) {
      setBookingError('Please select valid start and end dates.');
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
        totalPrice: parseFloat(totalPrice),
      };
      await createBooking(bookingData);
      setBookingStatus('success');
      setTimeout(() => onNavigate('dashboard'), 2000);
    } catch {
      setBookingStatus('error');
      setBookingError('Failed to create booking. Please try again.');
    }
  };

  if (loading) return <div className="py-20"><Spinner /></div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!space) return null;

  return (
    <div className="container mx-auto px-6 py-12">
      <button onClick={() => onNavigate('spaces')} className="mb-8 text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        <span>Back to Spaces</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
          </div>
          <div className="mt-8 bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Description</h2>
            <p className="text-gray-600 leading-relaxed">{space.description}</p>
          </div>
          
          <div className="mt-8 bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Location</h2>
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
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-28">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{space.name}</h1>
              <p className="text-gray-500 mb-4">{space.location}</p>
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
              
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-center mb-4 text-gray-800">Book This Space</h2>
                {!currentUser ? (
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">You must be logged in to book a space.</p>
                        <button onClick={() => onNavigate('login')} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700">
                            Login to Book
                        </button>
                    </div>
                ) : space.isAvailable ? (
                  <form onSubmit={handleBooking}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" id="start-date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                      </div>
                      <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" id="end-date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                      </div>
                    </div>
                     <div className="text-center bg-white p-3 rounded-lg mb-4">
                        <p className="text-sm text-gray-500">Estimated Total</p>
                        <p className="text-2xl font-bold text-blue-600">${totalPrice}</p>
                    </div>
                    {bookingError && <p className="text-red-500 text-sm mb-2 text-center">{bookingError}</p>}
                    <button type="submit" disabled={bookingStatus === 'booking'} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400">
                      {bookingStatus === 'booking' ? 'Processing...' : 'Book Now'}
                    </button>
                    {bookingStatus === 'success' && <p className="text-green-600 mt-4 text-center font-semibold">Booking successful! Redirecting...</p>}
                  </form>
                ) : (
                  <div className="text-center p-4 bg-red-100 border border-red-200 rounded-lg">
                    <p className="font-bold text-red-700">This space is currently unavailable.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceDetailPage;
