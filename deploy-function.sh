#!/bin/bash

# Deployment script for Supabase Edge Function
# Run this in your terminal: bash deploy-function.sh

echo "🚀 Deploying Supabase Edge Function..."

# Step 1: Login to Supabase (will open browser)
echo "📝 Step 1: Logging into Supabase..."
supabase login

# Step 2: Link your project
echo "🔗 Step 2: Linking project..."
supabase link --project-ref sbufucteogmocywtoqqh

# Step 3: Set Stripe secret key (you'll need to replace YOUR_STRIPE_SECRET_KEY)
echo "🔑 Step 3: Setting Stripe secret key..."
read -p "Enter your Stripe Secret Key (sk_test_...): " STRIPE_KEY
supabase secrets set STRIPE_SECRET_KEY=$STRIPE_KEY

# Step 4: Deploy the function
echo "📦 Step 4: Deploying function..."
supabase functions deploy create-booking

echo "✅ Deployment complete! The function is now available at:"
echo "https://sbufucteogmocywtoqqh.supabase.co/functions/v1/create-booking"

