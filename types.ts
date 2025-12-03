
export type Role = 'CLIENT' | 'HOST';

export interface Space {
  id: string;
  name: string;
  location: string;
  size: number; // in square feet
  pricePerMonth: number;
  description: string;
  images: string[];
  features: string[];
  isAvailable: boolean;
  hostId: string;
}

export interface Booking {
  id: string;
  spaceId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  paymentIntentId?: string;
  paymentStatus?: 'pending' | 'succeeded' | 'failed';
}

export interface Review {
  id: string;
  spaceId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Profile {
  id: string;
  name: string;
  role: Role;
  createdAt: string;
}

export type Page = 'home' | 'spaces' | 'spaceDetail' | 'dashboard' | 'admin' | 'login' | 'accessDenied' | 'profile' | 'hostProfile';