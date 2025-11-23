# Backend Endpoint Deployment Guide

## Step 3: Install Supabase CLI

If you haven't already installed the Supabase CLI:

```bash
npm install -g supabase
```

Or using Homebrew (Mac):
```bash
brew install supabase/tap/supabase
```

## Step 4: Login to Supabase

```bash
supabase login
```

This will open a browser window for you to authenticate.

## Step 5: Link Your Project

Link your local project to your Supabase project:

```bash
cd /Users/ammoony/Desktop/inventory
supabase link --project-ref sbufucteogmocywtoqqh
```

Replace `sbufucteogmocywtoqqh` with your actual project reference ID if different.

## Step 6: Set Stripe Secret Key

Set your Stripe secret key as a Supabase secret:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
```

**Where to find your Stripe Secret Key:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy the **Secret key** (starts with `sk_test_...`)
3. Paste it in the command above

## Step 7: Deploy the Edge Function

Deploy your function to Supabase:

```bash
supabase functions deploy create-booking
```

This will:
- Upload your function code
- Make it available at: `https://sbufucteogmocywtoqqh.supabase.co/functions/v1/create-booking`
- Handle CORS automatically

## Step 8: Test the Endpoint

After deployment, test with your checkout form. The function should:
1. ✅ Accept payment method from frontend
2. ✅ Process payment with Stripe
3. ✅ Return booking ID on success
4. ✅ Handle CORS preflight requests
5. ✅ Return proper error messages

## What's Already Done

✅ **Frontend Updated** - `StripeCheckoutForm.tsx` now:
- Uses Supabase Edge Function endpoint
- Sends proper authentication headers
- Converts amount to cents for Stripe
- Handles errors properly

✅ **Backend Function Created** - `supabase/functions/create-booking/index.ts`:
- Handles CORS preflight (OPTIONS) requests
- Validates input data
- Processes Stripe payments
- Returns booking information

## Next Steps (Optional)

When you're ready to store bookings in your database:

1. Create a `bookings` table in Supabase
2. Uncomment the database insertion code in `index.ts` (lines 70-93)
3. Set `SUPABASE_SERVICE_ROLE_KEY` as a secret:
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Troubleshooting

**CORS Error:**
- Make sure the Edge Function is deployed
- Check that CORS headers are returned (the function includes them)

**Payment Fails:**
- Verify STRIPE_SECRET_KEY is set correctly
- Check Stripe dashboard for payment attempts
- Review function logs: `supabase functions logs create-booking`

**Function Not Found:**
- Ensure deployment was successful
- Verify project reference is correct
- Check Supabase dashboard → Edge Functions

