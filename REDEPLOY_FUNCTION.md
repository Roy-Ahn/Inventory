# Quick Fix: Redeploy Function to Fix 401 Error

## The Issue

The function needs to be redeployed with JWT verification disabled.

## Solution: Redeploy the Function

Run this command to redeploy with the new configuration:

```bash
cd /Users/ammoony/Desktop/inventory
supabase functions deploy create-booking
```

The `config.toml` file I created will disable JWT verification for this function.

## After Redeployment

After redeploying, the 401 error should be resolved and guests can book without logging in.

## Verify It Worked

After redeploying, test the checkout form again. The function should now accept requests with just the `apikey` header (no JWT required).

