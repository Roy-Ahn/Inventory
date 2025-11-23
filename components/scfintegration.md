# StripeCheckoutForm Component

This is a standalone Stripe payment form component ready to integrate into your checkout page.

## Installation

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## File Location

Place this file in:
```
src/components/StripeCheckoutForm.tsx
```

## How to Use in Your CheckoutPage

### 1. Import at the top of CheckoutPage.tsx

```typescript
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCheckoutForm from '../components/StripeCheckoutForm';

// Initialize Stripe - get your key from https://dashboard.stripe.com/
const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');
```

### 2. Wrap the component in your JSX

Replace your current booking form with:

```tsx
<Elements stripe={stripePromise}>
  <StripeCheckoutForm
    spaceId={spaceId}
    startDate={startDate}
    endDate={endDate}
    totalPrice={totalPrice}
    onSuccess={handlePaymentSuccess}
    onError={handlePaymentError}
  />
</Elements>
```

### 3. Add the callback handlers

```typescript
const handlePaymentSuccess = (bookingId: string) => {
  console.log('Payment successful! Booking ID:', bookingId);
  // Show success message
  // Redirect to dashboard
  setTimeout(() => onNavigate('dashboard'), 2000);
};

const handlePaymentError = (error: string) => {
  console.error('Payment error:', error);
  // Error is already shown in the component
};
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `spaceId` | `string` | The ID of the space being booked |
| `startDate` | `string` | Booking start date (ISO format) |
| `endDate` | `string` | Booking end date (ISO format) |
| `totalPrice` | `number` | Total booking price |
| `onSuccess` | `(bookingId: string) => void` | Called when payment succeeds |
| `onError` | `(error: string) => void` | Called when payment fails |

## What You Need to Update

### In the Component (Line 47-50)

Update the API endpoint URL:

```typescript
// For Supabase Edge Function:
const response = await fetch(
  'https://YOUR-PROJECT.supabase.co/functions/v1/create-booking',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${YOUR_SUPABASE_ANON_KEY}`,
    },
    // ...
  }
);

// OR for Express server:
const response = await fetch('http://localhost:3001/api/create-booking', {
  // ...
});
```

### In CheckoutPage.tsx (Line 7)

Add your Stripe publishable key:

```typescript
const stripePromise = loadStripe('pk_test_51Abc123...');
```

Get your key from: https://dashboard.stripe.com/test/apikeys

## Backend Requirements

The component expects a backend endpoint that:

1. Receives: `paymentMethodId`, `amount`, `spaceId`, `userId`, `startDate`, `endDate`
2. Processes payment with Stripe
3. Creates booking in database
4. Returns: `{ bookingId: string }` on success

## Test Cards

Use these Stripe test cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Exp**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)

## Features Included

✅ Stripe CardElement for secure card input  
✅ Real-time card validation  
✅ Loading states  
✅ Error handling and display  
✅ Order total summary  
✅ Terms and conditions checkbox  
✅ Matches your app's design (blue theme, rounded corners, shadows)  
✅ Uses your existing `useAuth()` context  

## Layout Suggestion

For a 2-column layout on checkout page:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Left - Payment */}
  <Elements stripe={stripePromise}>
    <StripeCheckoutForm {...props} />
  </Elements>
  
  {/* Right - Summary */}
  <BookingSummary {...props} />
</div>
```

## What Happens When User Clicks "Complete Booking"

1. ✅ Stripe validates card
2. ✅ Creates payment method token (`pm_abc123`)
3. ✅ Sends token + booking data to your backend
4. ⏳ Backend processes payment and creates booking (YOU NEED TO BUILD THIS)
5. ✅ Calls `onSuccess()` with booking ID
6. ✅ You redirect to dashboard

## Next Steps

1. ✅ Copy this file to `src/components/`
2. ✅ Install Stripe packages
3. ✅ Add to CheckoutPage as shown above
4. ✅ Get Stripe publishable key
5. ⏳ Build backend endpoint to process payments
6. ✅ Test with test cards

The component is **fully coded and ready to use** - just drop it in and connect it!