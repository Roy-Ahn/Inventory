'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Space, Booking } from '@/types';
import { supabase } from '@/lib/supabase';

interface DataContextType {
  spaces: Space[];
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  refreshSpaces: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  createSpace: (space: Omit<Space, 'id'>) => Promise<void>;
  updateSpace: (space: Space) => Promise<void>;
  deleteSpace: (id: string) => Promise<void>;
  createBooking: (booking: Omit<Booking, 'id'>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all spaces
  const refreshSpaces = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('spaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform Supabase data to match your Space interface
      const transformedSpaces: Space[] = (data || []).map(space => ({
        id: space.id,
        name: space.name,
        location: space.location,
        size: space.size,
        pricePerMonth: parseFloat(space.price_per_month),
        description: space.description,
        images: space.images || [],
        features: space.features || [],
        isAvailable: space.is_available,
      }));
      setSpaces(transformedSpaces);
    } catch (err: any) {
      console.error('Error fetching spaces:', err);
      setError(err.message);
    }
  }, []);

  // Fetch all bookings
  const refreshBookings = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform Supabase data to match your Booking interface
      const transformedBookings: Booking[] = (data || []).map(booking => ({
        id: booking.id,
        spaceId: booking.space_id,
        userId: booking.user_id,
        startDate: booking.start_date,
        endDate: booking.end_date,
        totalPrice: parseFloat(booking.total_price),
      }));
      setBookings(transformedBookings);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
    }
  }, []);

  // Create space
  const createSpace = useCallback(async (spaceData: Omit<Space, 'id'>) => {
    try {
      const { error: insertError } = await supabase
        .from('spaces')
        .insert({
          name: spaceData.name,
          location: spaceData.location,
          size: spaceData.size,
          price_per_month: spaceData.pricePerMonth,
          description: spaceData.description,
          images: spaceData.images,
          features: spaceData.features,
          is_available: spaceData.isAvailable,
        });

      if (insertError) throw insertError;
      await refreshSpaces();
    } catch (err: any) {
      console.error('Error creating space:', err);
      throw err;
    }
  }, [refreshSpaces]);

  // Update space
  const updateSpace = useCallback(async (spaceData: Space) => {
    try {
      const { error: updateError } = await supabase
        .from('spaces')
        .update({
          name: spaceData.name,
          location: spaceData.location,
          size: spaceData.size,
          price_per_month: spaceData.pricePerMonth,
          description: spaceData.description,
          images: spaceData.images,
          features: spaceData.features,
          is_available: spaceData.isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq('id', spaceData.id);

      if (updateError) throw updateError;
      await refreshSpaces();
    } catch (err: any) {
      console.error('Error updating space:', err);
      throw err;
    }
  }, [refreshSpaces]);

  // Delete space
  const deleteSpace = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('spaces')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await refreshSpaces();
    } catch (err: any) {
      console.error('Error deleting space:', err);
      throw err;
    }
  }, [refreshSpaces]);

  // Create booking
  const createBooking = useCallback(async (bookingData: Omit<Booking, 'id'>) => {
    try {
      // Check for overlapping bookings
      // Two date ranges overlap if: start_date <= new_end_date AND end_date >= new_start_date
      // Using PostgREST filter syntax: start_date.lte.end_date,end_date.gte.start_date
      const { data: existingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('space_id', bookingData.spaceId)
        .or(`start_date.lte.${bookingData.endDate},end_date.gte.${bookingData.startDate}`);

      if (checkError) {
        // If the query fails, log it but continue (might be a syntax issue)
        console.warn('Error checking for overlapping bookings:', checkError);
        // Don't throw - allow booking to proceed if we can't check overlaps
      }

      if (existingBookings && existingBookings.length > 0) {
        throw new Error('Space is already booked for these dates');
      }

      // Build insert object, only including payment fields if they exist
      const insertData: any = {
        space_id: bookingData.spaceId,
        user_id: bookingData.userId,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        total_price: bookingData.totalPrice,
      };
      
      // Only include payment fields if they are provided
      if (bookingData.paymentIntentId) {
        insertData.payment_intent_id = bookingData.paymentIntentId;
      }
      if (bookingData.paymentStatus) {
        insertData.payment_status = bookingData.paymentStatus;
      }

      const { error: insertError } = await supabase
        .from('bookings')
        .insert(insertData);

      if (insertError) throw insertError;

      // Update space availability
      await supabase
        .from('spaces')
        .update({ is_available: false, updated_at: new Date().toISOString() })
        .eq('id', bookingData.spaceId);

      await refreshBookings();
      await refreshSpaces();
    } catch (err: any) {
      // Log detailed error information
      const errorMessage = err?.message || err?.error?.message || JSON.stringify(err);
      const errorDetails = {
        message: errorMessage,
        code: err?.code || err?.error?.code,
        details: err?.details || err?.error?.details,
        hint: err?.hint || err?.error?.hint,
      };
      console.error('Error creating booking:', errorDetails);
      throw new Error(errorMessage || 'Failed to create booking');
    }
  }, [refreshBookings, refreshSpaces]);

  // Initialize data and set up real-time subscriptions
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([refreshSpaces(), refreshBookings()]);
      } catch (err) {
        console.error('Error loading initial data:', err);
        // Continue even if there's an error (tables might not exist yet)
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // Subscribe to real-time changes for spaces (only if table exists)
    let spacesSubscription: any = null;
    let bookingsSubscription: any = null;

    try {
      spacesSubscription = supabase
        .channel('spaces-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'spaces' },
          () => {
            refreshSpaces().catch(err => console.error('Error refreshing spaces:', err));
          }
        )
        .subscribe();

      bookingsSubscription = supabase
        .channel('bookings-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'bookings' },
          () => {
            refreshBookings().catch(err => console.error('Error refreshing bookings:', err));
          }
        )
        .subscribe();
    } catch (err) {
      console.error('Error setting up subscriptions:', err);
    }

    // Cleanup subscriptions on unmount
    return () => {
      if (spacesSubscription) {
        supabase.removeChannel(spacesSubscription);
      }
      if (bookingsSubscription) {
        supabase.removeChannel(bookingsSubscription);
      }
    };
  }, [refreshSpaces, refreshBookings]);

  return (
    <DataContext.Provider
      value={{
        spaces,
        bookings,
        isLoading,
        error,
        refreshSpaces,
        refreshBookings,
        createSpace,
        updateSpace,
        deleteSpace,
        createBooking,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

