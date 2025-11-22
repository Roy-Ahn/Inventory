
import { Space, Booking, User } from './types';

// Stripe Configuration
// Get your publishable key from: https://dashboard.stripe.com/test/apikeys
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alex Doe',
    email: 'alex.doe@example.com',
    role: 'BUYER',
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'SELLER',
  }
];

export const MOCK_SPACES: Space[] = [
  {
    id: 'space-1',
    name: 'Compact City Locker',
    location: 'Downtown, Metropolis',
    size: 25,
    pricePerMonth: 50,
    description: 'Perfect for students or for storing a few boxes and small items. Secure and accessible 24/7.',
    images: ['https://picsum.photos/seed/space1/800/600', 'https://picsum.photos/seed/space1a/800/600', 'https://picsum.photos/seed/space1b/800/600'],
    features: ['24/7 Access', 'CCTV Security', 'Climate Controlled'],
    isAvailable: true,
  },
  {
    id: 'space-2',
    name: 'Suburban Garage Unit',
    location: 'Oakwood Suburbs, Metropolis',
    size: 200,
    pricePerMonth: 180,
    description: 'A spacious garage-sized unit, ideal for furniture, appliances, or even a classic car. Drive-up access.',
    images: ['https://picsum.photos/seed/space2/800/600', 'https://picsum.photos/seed/space2a/800/600'],
    features: ['Drive-up Access', 'Ground Floor', 'Roll-up Door'],
    isAvailable: true,
  },
  {
    id: 'space-3',
    name: 'Medium Business Storage',
    location: 'Industrial Park, Metropolis',
    size: 500,
    pricePerMonth: 450,
    description: 'Excellent for business inventory, equipment, or documents. High ceilings and wide access doors.',
    images: ['https://picsum.photos/seed/space3/800/600'],
    features: ['24/7 Access', 'CCTV Security', 'Loading Dock'],
    isAvailable: false,
  },
  {
    id: 'space-4',
    name: 'The Collector\'s Vault',
    location: 'Uptown, Metropolis',
    size: 100,
    pricePerMonth: 300,
    description: 'A premium, climate-controlled unit for valuable collections like wine, art, or antiques. Maximum security.',
    images: ['https://picsum.photos/seed/space4/800/600', 'https://picsum.photos/seed/space4a/800/600'],
    features: ['Climate Controlled', 'High Security', 'Individual Alarms'],
    isAvailable: true,
  },
  {
    id: 'space-5',
    name: 'Walk-in Closet Size',
    location: 'Downtown, Metropolis',
    size: 50,
    pricePerMonth: 95,
    description: 'Equivalent to a large closet. Great for storing seasonal clothing, sports equipment, or documents.',
    images: ['https://picsum.photos/seed/space5/800/600'],
    features: ['24/7 Access', 'CCTV Security', 'Elevator Access'],
    isAvailable: true,
  },
  {
    id: 'space-6',
    name: 'Large Warehouse Space',
    location: 'Industrial Park, Metropolis',
    size: 2000,
    pricePerMonth: 1500,
    description: 'Vast space for commercial use, large-scale storage, or vehicle parking. Forklift available on site.',
    images: ['https://picsum.photos/seed/space6/800/600', 'https://picsum.photos/seed/space6a/800/600'],
    features: ['Drive-up Access', 'Loading Dock', 'High Ceilings'],
    isAvailable: true,
  },
];

export const MOCK_BOOKINGS: Booking[] = [
    {
        id: 'booking-1',
        spaceId: 'space-2',
        userId: 'user-1',
        startDate: '2024-08-01',
        endDate: '2024-09-01',
        totalPrice: 180,
    },
    {
        id: 'booking-2',
        spaceId: 'space-4',
        userId: 'user-1',
        startDate: '2024-07-15',
        endDate: '2025-01-15',
        totalPrice: 1800,
    }
];