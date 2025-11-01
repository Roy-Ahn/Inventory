-- Supabase Database Setup Script
-- Run this in your Supabase Dashboard SQL Editor

-- Create spaces table
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  size INTEGER NOT NULL,
  price_per_month DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can read spaces
CREATE POLICY "Spaces are viewable by everyone" 
  ON spaces FOR SELECT 
  USING (true);

-- Policies: Only authenticated users can manage spaces
CREATE POLICY "Authenticated users can manage spaces" 
  ON spaces FOR ALL 
  USING (auth.role() = 'authenticated');

-- Policies: Users can view all bookings
CREATE POLICY "Bookings are viewable by everyone" 
  ON bookings FOR SELECT 
  USING (true);

-- Policies: Users can only create their own bookings
CREATE POLICY "Users can create their own bookings" 
  ON bookings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Enable Realtime for automatic sync
ALTER PUBLICATION supabase_realtime ADD TABLE spaces;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

