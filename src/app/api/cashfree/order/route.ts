import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { player_id, phone, name, season_id, return_url } = await request.json();

    if (!player_id || !phone || !name || !return_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderId = `nfl_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const response = await axios.post(
      'https://sandbox.cashfree.com/pg/orders',
      {
        order_amount: 25.00,
        order_currency: 'INR',
        order_id: orderId,
        customer_details: {
          customer_id: player_id,
          customer_phone: phone,
          customer_name: name,
        },
        order_meta: {
          return_url: return_url
        },
        order_tags: {
          season_id: season_id
        }
      },
      {
        headers: {
          'x-client-id': process.env.NEXT_PUBLIC_CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Cashfree Create Order Error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to create order', details: error.response?.data },
      { status: 500 }
    );
  }
}
