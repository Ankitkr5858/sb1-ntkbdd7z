import { supabase } from './supabase';

export async function processPayment(amount: number, paymentMethod: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // For demo purposes, simulate a successful payment
    // In production, this would integrate with a real payment gateway
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Insert payment record
    const { error } = await supabase
      .from('payments')
      .insert({
        amount,
        payment_method: paymentMethod,
        status: 'completed',
        ride_id: null // Will be updated when ride is created
      });

    if (error) {
      console.error('Payment error:', error);
      throw new Error('Failed to process payment. Please try again.');
    }
    
    return {
      success: true,
      message: 'Payment processed successfully'
    };
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return {
      success: false,
      message: error.message || 'Payment processing failed'
    };
  }
}