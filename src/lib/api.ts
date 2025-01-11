import { supabase } from './supabase';

export async function createPaymentIntent(amount: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount,
        currency: 'inr',
        payment_method_types: ['card'],
        metadata: {
          user_id: user.id,
        },
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}