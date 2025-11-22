# How to Check if Bookings are Stored in the Database

## Current Status

**Bookings are NOT currently stored in the database** - the Edge Function just generates a booking ID but doesn't save it to Supabase.

## How to Check Bookings in Supabase Dashboard

### Method 1: Check via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/sbufucteogmocywtoqqh/editor
2. Look for a **`bookings`** table in the left sidebar
3. If the table exists, click on it to see all bookings
4. If the table doesn't exist, bookings aren't being stored yet

### Method 2: Check via SQL Editor

1. Go to: https://supabase.com/dashboard/project/sbufucteogmocywtoqqh/sql
2. Run this query to check if a bookings table exists:
   ```sql
   SELECT * FROM bookings LIMIT 10;
   ```
3. If you get an error like "relation 'bookings' does not exist", the table hasn't been created yet

### Method 3: Check Function Logs

1. Go to: https://supabase.com/dashboard/project/sbufucteogmocywtoqqh/functions
2. Click on `create-booking` function
3. Go to "Logs" tab
4. Look for log messages - if you see database errors, the booking insertion might be failing

## Current Implementation

Right now, the Edge Function code has database insertion **commented out** (lines 86-111 in `index.ts`). It just returns a generated booking ID without saving to the database.

## To Enable Database Storage

You need to:
1. Create a `bookings` table in Supabase
2. Uncomment the database code in the Edge Function
3. Set the `SUPABASE_SERVICE_ROLE_KEY` secret
4. Redeploy the function

Would you like me to help set this up?

