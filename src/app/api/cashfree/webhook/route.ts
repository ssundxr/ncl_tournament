import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// We need a server-role client to bypass RLS for webhook updates
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature');
    const timestamp = request.headers.get('x-webhook-timestamp');

    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify signature
    const secretKey = process.env.CASHFREE_SECRET_KEY || '';
    const generatedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(timestamp + rawBody)
      .digest('base64');

    if (generatedSignature !== signature) {
      console.warn('Webhook signature mismatch!');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    console.log('Webhook payload:', payload);

    if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const orderId = payload.data.order.order_id;
      const paymentStatus = payload.data.payment.payment_status;

      if (paymentStatus === 'SUCCESS') {
        // Update database using the orderId (which we stored as payment_ref during creation)
        const { error } = await supabase
          .from('season_enrollments')
          .update({ payment_status: 'paid' })
          .eq('payment_ref', orderId);

        if (error) {
          console.error('Error updating DB from webhook:', error.message);
          return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error: any) {
    console.error('Webhook processing error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
