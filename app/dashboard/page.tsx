'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Booking, Space } from '@/types';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface PopulatedBooking {
  booking: Booking;
  space?: Space;
}

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { bookings: allBookings, spaces, isLoading: loading } = useData();

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
    return (
      <div className="text-center py-20">
        <p>Please log in to see your dashboard.</p>
        <Button onClick={() => router.push('/login')} className="mt-4">
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">Welcome back, {currentUser.name}. Here are your bookings.</p>
        </motion.div>

        {loading ? (
          <Spinner />
        ) : bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map(({ booking, space }, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ x: 8, transition: { duration: 0.3 } }}
              >
                <Card className="transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
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
                    <Button 
                      onClick={() => space && router.push(`/spaces/${space.id}`)} 
                      variant="secondary"
                      disabled={!space}
                    >
                      View Space
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center py-16 px-6">
              <CardHeader>
                <CardTitle>No Bookings Yet</CardTitle>
                <CardDescription>You haven't booked any storage spaces. Ready to find one?</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => router.push('/spaces')} className="mt-6">
                    Find a Space
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

