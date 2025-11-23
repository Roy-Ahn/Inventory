# Quick Deployment Instructions

## Option 1: Run the Deployment Script

```bash
cd /Users/ammoony/Desktop/inventory
bash deploy-function.sh
```

This will guide you through:
1. Logging into Supabase (opens browser)
2. Linking your project
3. Setting your Stripe secret key
4. Deploying the function

## Option 2: Manual Steps

Run these commands one by one in your terminal:

```bash
# 1. Navigate to project
cd /Users/ammoony/Desktop/inventory

# 2. Login to Supabase (opens browser)
supabase login

# 3. Link your project
supabase link --project-ref sbufucteogmocywtoqqh

# 4. Set your Stripe secret key
# Replace sk_test_YOUR_KEY with your actual Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY

# 5. Deploy the function
supabase functions deploy create-booking
```

## Get Your Stripe Secret Key

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy the **Secret key** (starts with `sk_test_...`)
3. Use it in step 4 above

## After Deployment

Once deployed, the CORS error should be resolved! The function will be available at:
```
https://sbufucteogmocywtoqqh.supabase.co/functions/v1/create-booking
```

## Verify Deployment

After deploying, test your checkout form. The function should:
- ✅ Handle CORS preflight requests
- ✅ Process Stripe payments
- ✅ Return booking information

## Troubleshooting

**If you get "function not found":**
- Check the deployment was successful
- Verify project reference matches your Supabase project

**If CORS error persists:**
- Check function logs: `supabase functions logs create-booking`
- Verify the function is deployed correctly

