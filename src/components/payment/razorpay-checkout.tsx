'use client';

import React, { useState, useEffect } from 'react';

// Type declaration for Razorpay to avoid TS errors
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  amount: number; // Amount in paise (minimum 100)
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  buttonText?: string;
  className?: string;
}

export function RazorpayCheckout({
  amount,
  onSuccess,
  onError,
  buttonText = 'Pay Now',
  className = '',
}: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const loadScript = () => {
      // Prevent multiple injections
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        setScriptLoaded(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    };

    loadScript();
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create order on our backend
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const order = await res.json();

      if (!res.ok) {
        throw new Error(order.error || 'Failed to create order');
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Only public key
        amount: order.amount,
        currency: order.currency,
        name: 'NCL Hub',
        description: 'Test Transaction',
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify payment signature on backend
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              if (onSuccess) onSuccess(verifyData);
              else alert('Payment successful!');
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (err) {
            console.error(err);
            if (onError) onError(err);
            else alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const paymentObject = new window.Razorpay(options);
      
      // Handle payment failure event
      paymentObject.on('payment.failed', function (response: any) {
        console.error('Payment failed', response.error);
        if (onError) onError(response.error);
        else alert(`Payment failed: ${response.error.description}`);
      });
      
      paymentObject.open();
    } catch (error: any) {
      console.error('Checkout error:', error);
      if (onError) onError(error);
      else alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || !scriptLoaded}
      className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors ${className}`}
    >
      {isLoading ? 'Processing...' : buttonText}
    </button>
  );
}
