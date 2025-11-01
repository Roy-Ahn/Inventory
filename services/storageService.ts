
import { MOCK_SPACES, MOCK_BOOKINGS, MOCK_USERS } from '../constants';
import { Space, Booking, User } from '../types';

let spaces: Space[] = [...MOCK_SPACES];
let bookings: Booking[] = [...MOCK_BOOKINGS];
const users: User[] = [...MOCK_USERS];

const simulateDelay = <T,>(data: T, delay: number = 500): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  const user = users.find(u => u.id === id);
  return simulateDelay(user);
};

export const getSpaces = async (): Promise<Space[]> => {
  return simulateDelay(spaces);
};

export const getSpaceById = async (id: string): Promise<Space | undefined> => {
  const space = spaces.find(s => s.id === id);
  return simulateDelay(space);
};

export const getBookingsForUser = async (userId: string): Promise<{booking: Booking, space?: Space}[]> => {
    const userBookings = bookings.filter(b => b.userId === userId);
    const populatedBookings = userBookings.map(booking => ({
        booking,
        space: spaces.find(s => s.id === booking.spaceId)
    }));
  return simulateDelay(populatedBookings);
};

export const createBooking = async (bookingData: Omit<Booking, 'id' | 'totalPrice'> & {totalPrice: number}): Promise<Booking> => {
    const newBooking: Booking = {
        ...bookingData,
        id: `booking-${Date.now()}`,
    };
    bookings.push(newBooking);
    const spaceToUpdate = spaces.find(s => s.id === newBooking.spaceId);
    if (spaceToUpdate) {
        spaceToUpdate.isAvailable = false;
    }
    return simulateDelay(newBooking, 1000);
}

// Admin functions
export const createSpace = async (spaceData: Omit<Space, 'id'>): Promise<Space> => {
    const newSpace: Space = {
        ...spaceData,
        id: `space-${Date.now()}`,
    };
    spaces.push(newSpace);
    return simulateDelay(newSpace);
}

export const updateSpace = async (spaceData: Space): Promise<Space> => {
    const index = spaces.findIndex(s => s.id === spaceData.id);
    if (index !== -1) {
        spaces[index] = spaceData;
        return simulateDelay(spaces[index]);
    }
    throw new Error('Space not found');
}

export const deleteSpace = async (id: string): Promise<{ success: boolean }> => {
    const initialLength = spaces.length;
    spaces = spaces.filter(s => s.id !== id);
    if (spaces.length < initialLength) {
        return simulateDelay({ success: true });
    }
    throw new Error('Space not found for deletion');
}