# Fix 401 Unauthorized Error

## The Problem

The Edge Function is returning 401 because Supabase's gateway requires JWT authentication by default.

## Solution: Disable JWT Verification

You need to configure the function to **not require JWT verification** since guests can book without logging in.

## Option 1: Via Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/sbufucteogmocywtoqqh/functions
2. Find the `create-booking` function
3. Click on it to open settings
4. Look for **"Require JWT"** or **"Verify JWT"** setting
5. **Disable** JWT verification
6. Save the settings

## Option 2: Via CLI Config

Create a configuration file:

```bash
# Create the config file
touch supabase/config.toml
```

Then add this content:

```toml
[functions.create-booking]
verify_jwt = false
```

Then redeploy:
```bash
supabase functions deploy create-booking
```

## Option 3: Update Function Code (Temporary Workaround)

The function code has been updated to log headers for debugging. Check the function logs to see if headers are being sent:

```bash
supabase functions logs create-booking
```

## Verify Headers Are Being Sent

Check your browser's Network tab:
1. Open DevTools → Network tab
2. Submit the payment form
3. Click on the `create-booking` request
4. Go to "Headers" section
5. Verify you see:
   - `apikey: eyJ...` (your anon key)
   - `Authorization: Bearer ...` (if logged in)

If `apikey` is missing, check that `VITE_SUPABASE_ANON_KEY` is set in your `.env` file.

## Quick Fix Steps

1. **Disable JWT verification in Supabase Dashboard** (easiest)
   - Dashboard → Functions → create-booking → Settings → Disable JWT verification

2. **Or create config file:**
   ```bash
   echo '[functions.create-booking]
   verify_jwt = false' > supabase/config.toml
   supabase functions deploy create-booking
   ```

After disabling JWT verification, the 401 error should be resolved!

