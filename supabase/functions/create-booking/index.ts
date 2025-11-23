// Supabase Edge Function: create-booking
// Handles Stripe payment processing and booking creation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    });
  }

  // Log request headers for debugging
  const authHeader = req.headers.get('authorization');
  const apikeyHeader = req.headers.get('apikey');
  console.log('Request headers - Authorization:', authHeader ? 'Present' : 'Missing', 'apikey:', apikeyHeader ? 'Present' : 'Missing');

  try {
    // Step 1: Parse and validate request body
    const {
      paymentMethodId,
      amount, // Already in cents
      spaceId,
      userId,
      startDate,
      endDate,
      currency = 'usd',
    } = await req.json();

    // Validate required fields
    if (!paymentMethodId) {
      throw new Error('Missing required field: paymentMethodId');
    }
    if (!amount || amount <= 0) {
      throw new Error('Missing or invalid amount');
    }
    if (!spaceId) {
      throw new Error('Missing required field: spaceId');
    }
    if (!startDate || !endDate) {
      throw new Error('Missing required fields: startDate and endDate');
    }

    console.log('Processing booking:', { paymentMethodId, amount, spaceId, userId, startDate, endDate });

    // Step 2: Confirm payment with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      return_url: `${req.headers.get('origin') || 'http://localhost:3000'}/checkout`,
    });

    console.log('Payment intent created:', paymentIntent.id, 'Status:', paymentIntent.status);

    // Step 3: Check if payment was successful
    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment not completed. Status: ${paymentIntent.status}`);
    }

    // Step 4: Create booking record
    // TODO: Replace this with actual Supabase database insertion
    // For now, we'll generate a booking ID
    // When you have a bookings table, uncomment and use:
    
    /*
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseServiceKey) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: booking, error: dbError } = await supabase
        .from('bookings')
        .insert({
          space_id: spaceId,
          user_id: userId,
          start_date: startDate,
          end_date: endDate,
          total_price: amount / 100, // Convert cents to dollars
          payment_intent_id: paymentIntent.id,
          status: 'confirmed',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }
    }
    */

    // Generate booking ID (replace with actual database booking ID when you add database)
    const bookingId = `booking-${Date.now()}`;

    // Step 5: Return success response
    return new Response(
      JSON.stringify({
        bookingId,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: amount / 100, // Return amount in dollars for display
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing booking:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : 'Payment processing failed',
        error: error instanceof Error ? error.stack : String(error),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});

