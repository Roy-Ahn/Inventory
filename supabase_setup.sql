-- Supabase SQL Setup for Reviews Feature
-- Run this in your Supabase SQL Editor

-- First, ensure the reviews table exists with the correct schema
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    space_id UUID NOT NULL,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Add foreign key constraints if they don't exist
-- This assumes you have a 'spaces' table and an 'auth.users' table or 'users' table
DO $$ 
BEGIN
    -- Add foreign key to spaces table (if not exists)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reviews_space_id_fkey' 
        AND table_name = 'reviews'
    ) THEN
        ALTER TABLE public.reviews
        ADD CONSTRAINT reviews_space_id_fkey 
        FOREIGN KEY (space_id) 
        REFERENCES public.spaces(id) 
        ON DELETE CASCADE;
    END IF;

    -- Add foreign key to auth.users table (if not exists)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reviews_user_id_fkey' 
        AND table_name = 'reviews'
    ) THEN
        ALTER TABLE public.reviews
        ADD CONSTRAINT reviews_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS reviews_space_id_idx ON public.reviews(space_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

-- RLS Policies
-- Allow anyone to read reviews (including anonymous users)
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert reviews
CREATE POLICY "Authenticated users can create reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON public.reviews
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
