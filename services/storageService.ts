import { Space, Booking, User } from '../types';
import { supabase } from '../lib/supabase';

export const getUserById = async (id: string): Promise<User | undefined> => {
  return undefined;
};

export const getSpaces = async (): Promise<Space[]> => {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(space => ({
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
};

export const getSpaceById = async (id: string): Promise<Space | undefined> => {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return undefined;

  return {
    id: data.id,
    name: data.name,
    location: data.location,
    size: data.size,
    pricePerMonth: parseFloat(data.price_per_month),
    description: data.description,
    images: data.images || [],
    features: data.features || [],
    isAvailable: data.is_available,
  };
};

export const getBookingsForUser = async (userId: string): Promise<{booking: Booking, space?: Space}[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      spaces (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((item: any) => {
    const booking: Booking = {
      id: item.id,
      spaceId: item.space_id,
      userId: item.user_id,
      startDate: item.start_date,
      endDate: item.end_date,
      totalPrice: parseFloat(item.total_price),
    };

    const space: Space | undefined = item.spaces ? {
      id: item.spaces.id,
      name: item.spaces.name,
      location: item.spaces.location,
      size: item.spaces.size,
      pricePerMonth: parseFloat(item.spaces.price_per_month),
      description: item.spaces.description,
      images: item.spaces.images || [],
      features: item.spaces.features || [],
      isAvailable: item.spaces.is_available,
    } : undefined;

    return { booking, space };
  });
};

export const createBooking = async (bookingData: Omit<Booking, 'id' | 'totalPrice'> & {totalPrice: number}): Promise<Booking> => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      space_id: bookingData.spaceId,
      user_id: bookingData.userId,
      start_date: bookingData.startDate,
      end_date: bookingData.endDate,
      total_price: bookingData.totalPrice,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('spaces')
    .update({ is_available: false, updated_at: new Date().toISOString() })
    .eq('id', bookingData.spaceId);

  return {
    id: data.id,
    spaceId: data.space_id,
    userId: data.user_id,
    startDate: data.start_date,
    endDate: data.end_date,
    totalPrice: parseFloat(data.total_price),
  };
};

export const createSpace = async (spaceData: Omit<Space, 'id'>): Promise<Space> => {
  const { data, error } = await supabase
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
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    location: data.location,
    size: data.size,
    pricePerMonth: parseFloat(data.price_per_month),
    description: data.description,
    images: data.images || [],
    features: data.features || [],
    isAvailable: data.is_available,
  };
};

export const updateSpace = async (spaceData: Space): Promise<Space> => {
  const { data, error } = await supabase
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
    .eq('id', spaceData.id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    location: data.location,
    size: data.size,
    pricePerMonth: parseFloat(data.price_per_month),
    description: data.description,
    images: data.images || [],
    features: data.features || [],
    isAvailable: data.is_available,
  };
};

export const deleteSpace = async (id: string): Promise<{ success: boolean }> => {
  const { error } = await supabase
    .from('spaces')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};
