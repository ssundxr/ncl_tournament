import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
    });

    const body = await request.json();
    const { amount, currency = 'INR', receipt = 'receipt_' + Math.random().toString(36).substring(7) } = body;

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: 'Invalid amount. Minimum amount is 100 paise.' },
        { status: 400 }
      );
    }

    const options = {
      amount,
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    
    // Check if error is related to authentication
    if (error.statusCode === 401) {
      return NextResponse.json({ error: 'Authentication failed with Razorpay' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 });
  }
}
