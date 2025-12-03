import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Space, Booking, Profile, Review } from '../types';
import { supabase } from '../lib/supabase';

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
  getProfile: (userId: string) => Promise<Profile | null>;
  getHostReviews: (hostId: string) => Promise<Review[]>;
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
        hostId: space.host_id,
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
          host_id: spaceData.hostId,
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
      const { data: existingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('space_id', bookingData.spaceId)
        .or(`start_date.lte.${bookingData.endDate},end_date.gte.${bookingData.startDate}`);

      if (checkError) throw checkError;

      if (existingBookings && existingBookings.length > 0) {
        throw new Error('Space is already booked for these dates');
      }

      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          space_id: bookingData.spaceId,
          user_id: bookingData.userId,
          start_date: bookingData.startDate,
          end_date: bookingData.endDate,
          total_price: bookingData.totalPrice,
          payment_intent_id: bookingData.paymentIntentId,
          payment_status: bookingData.paymentStatus || 'pending',
        });

      if (insertError) throw insertError;

      // Update space availability
      await supabase
        .from('spaces')
        .update({ is_available: false, updated_at: new Date().toISOString() })
        .eq('id', bookingData.spaceId);

      await refreshBookings();
      await refreshSpaces();
    } catch (err: any) {
      console.error('Error creating booking:', err);
      throw err;
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
        getProfile: async (userId: string) => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();

            if (error) throw error;

            return {
              id: data.id,
              name: data.name,
              role: data.role,
              createdAt: data.created_at,
            };
          } catch (err) {
            console.error('Error fetching profile:', err);
            return null;
          }
        },
        getHostReviews: async (hostId: string) => {
          try {
            // First get all spaces owned by this host
            const { data: spacesData, error: spacesError } = await supabase
              .from('spaces')
              .select('id')
              .eq('host_id', hostId);

            if (spacesError) throw spacesError;

            const spaceIds = spacesData.map(s => s.id);

            if (spaceIds.length === 0) return [];

            // Then get reviews for these spaces
            const { data: reviewsData, error: reviewsError } = await supabase
              .from('reviews')
              .select('*, user:profiles(name)') // Join with profiles to get reviewer name
              .in('space_id', spaceIds)
              .order('created_at', { ascending: false });

            if (reviewsError) throw reviewsError;

            return reviewsData.map(r => ({
              id: r.id,
              spaceId: r.space_id,
              userId: r.user_id,
              rating: r.rating,
              comment: r.comment,
              createdAt: r.created_at,
              user: { name: r.user?.name || 'Unknown User' } as any // Simplified user object
            }));
          } catch (err) {
            console.error('Error fetching host reviews:', err);
            return [];
          }
        },
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

