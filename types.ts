
export type Role = 'BUYER' | 'SELLER';

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
}

export interface Booking {
  id: string;
  spaceId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type Page = 'home' | 'spaces' | 'spaceDetail' | 'dashboard' | 'admin' | 'login' | 'accessDenied' | 'profile' | 'checkout';