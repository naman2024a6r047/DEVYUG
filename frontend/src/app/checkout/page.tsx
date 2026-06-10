'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Sparkles, CheckCircle, RefreshCw, AlertCircle, ShoppingBag, CreditCard, Landmark, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, updateUserLocal } = useAuth();
  const {
    cart,
    cartTotal,
    couponCode,
    discount,
    redeemPoints,
    pointsDiscount,
    clearCart
  } = useCart();

  // Redirect if cart empty on load
  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      router.push('/cart');
    }
  }, [cart]);

  // Form fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [addressLine1, setAddressLine1] = useState(user?.profile?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(user?.profile?.addressLine2 || '');
  const [city, setCity] = useState(user?.profile?.city || '');
  const [state, setState] = useState(user?.profile?.state || '');
  const [postalCode, setPostalCode] = useState(user?.profile?.postalCode || '');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // App execution states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRazorpayMock, setShowRazorpayMock] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Subtotal calculations
  const cartSubtotal = cart.reduce((total, item) => {
    const price = item.product.salePrice ? item.product.salePrice : item.product.price;
    return total + price * item.quantity;
  }, 0);
  
  const shippingFee = cartSubtotal >= 499 ? 0 : 60;
  const finalTotal = cartTotal + shippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to checkout your order!');
      router.push('/login?redirect=checkout');
      return;
    }

    if (!name || !phone || !addressLine1 || !city || !state || !postalCode) {
      setError('Please fill out all mandatory shipping details');
      return;
    }

    setError('');
    setLoading(true);

    const fullAddress = `${addressLine1}, ${addressLine2 ? addressLine2 + ', ' : ''}${city}, ${state} - ${postalCode}`;
    const orderItems = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));

    try {
      const res = await api.orders.checkout({
        items: orderItems,
        shippingAddress: fullAddress,
        paymentMethod,
        couponCode: couponCode || undefined,
        redeemPoints
      });

      if (res.success && res.order) {
        setCreatedOrder(res.order);
        
        // Sync user profile points in local storage if they changed
        if (redeemPoints || res.order.pointsEarned > 0) {
          const currentPoints = user.profile?.loyaltyPoints || 0;
          const pointsUsed = redeemPoints ? pointsDiscount : 0;
          const pointsEarned = res.order.pointsEarned || 0;
          
          updateUserLocal({
            ...user,
            profile: {
              ...user.profile!,
              loyaltyPoints: currentPoints - pointsUsed + pointsEarned
            }
          });
        }

        if (paymentMethod === 'COD') {
          // Direct success for COD
          setOrderSuccess(true);
          clearCart();
        } else {
          // Show simulated Razorpay sandbox gateway modal
          setShowRazorpayMock(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please review stock limits.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockPaymentSuccess = async () => {
    setLoading(true);
    setShowRazorpayMock(false);
    
    try {
      const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 12)}`;
      const res = await api.orders.verifyPayment({
        orderId: createdOrder.id,
        paymentId: mockPaymentId,
        paymentStatus: 'PAID'
      });
      if (res.success) {
        setOrderSuccess(true);
        clearCart();
      }
    } catch (err: any) {
      setError('Simulated payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMockPaymentFail = () => {
    setShowRazorpayMock(false);
    setError('Payment was cancelled or failed in the sandbox simulation.');
  };

  // --- RENDER ORDER SUCCESS SCREEN ---
  if (orderSuccess && createdOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center font-sans space-y-8 animate-fade-in">
        <div className="h-20 w-20 bg-[#2D5A27]/10 text-[#2D5A27] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-[#2D5A27]">Order Placed Successfully!</h1>
          <p className="text-xs text-[#2B2B2B]/60 font-light">Your order has been recorded into the Vedic registry.</p>
        </div>

        <div className="bg-[#F5EFE2] rounded-3xl p-6 border border-[#e2dccf] text-left space-y-4 text-xs font-light">
          <div className="flex justify-between border-b border-[#dcd6c8] pb-2 text-[#2B2B2B]">
            <span>Order Reference ID</span>
            <span className="font-bold">{createdOrder.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method</span>
            <span className="font-semibold">{createdOrder.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Address</span>
            <span className="font-semibold text-right max-w-[200px] truncate">{createdOrder.shippingAddress}</span>
          </div>
          <div className="flex justify-between text-[#2D5A27] font-semibold">
            <span>Loyalty Points Earned</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227] fill-[#C9A227]" />
              +{createdOrder.pointsEarned} points
            </span>
          </div>
          <div className="flex justify-between border-t border-[#dcd6c8] pt-2 text-sm font-bold text-[#2D5A27]">
            <span>Total Paid</span>
            <span>₹{createdOrder.totalAmount}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
          <Link 
            href="/dashboard?tab=orders" 
            className="px-6 py-3.5 bg-[#2D5A27] hover:bg-[#C9A227] text-white font-bold uppercase tracking-wider text-xs rounded-full shadow-md transition-colors"
          >
            Track Order Details
          </Link>
          <Link 
            href="/shop" 
            className="px-6 py-3.5 bg-transparent border border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27]/5 font-semibold text-xs rounded-full"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      <h1 className="text-3xl font-serif font-bold text-[#2D5A27]">Order Checkout</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left/Middle: Shipping Fields & Payment Selectors */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-[#F5EFE2] p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-serif font-bold text-[#2D5A27] border-b border-[#F5EFE2] pb-3">Shipping Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Contact Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Address Line 1</label>
                <input
                  type="text"
                  required
                  placeholder="Street address, P.O. box..."
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  placeholder="Apartment, suite, unit, building..."
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                />
              </div>
              <div className="space-y-1">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">PIN Code</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl border border-[#F5EFE2] p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-serif font-bold text-[#2D5A27] border-b border-[#F5EFE2] pb-3">Payment Methods</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay with cash at your doorstep', icon: Truck },
                { id: 'Razorpay', label: 'Razorpay Online Sandbox', desc: 'UPI, Cards, NetBanking simulated modal', icon: CreditCard },
                { id: 'UPI', label: 'Direct UPI Transfer', desc: 'Scan code on checkout', icon: Sparkles },
                { id: 'Card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Rupay', icon: CreditCard },
                { id: 'NetBanking', label: 'Net Banking', desc: 'Select from major Indian banks', icon: Landmark }
              ].map((method) => {
                const IconComp = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-xl border text-left flex gap-3 items-start transition-all ${paymentMethod === method.id ? 'bg-[#FAF8F2] border-[#2D5A27] shadow-sm' : 'bg-white border-[#F5EFE2] hover:border-[#2D5A27]/25'}`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === method.id}
                      onChange={() => {}}
                      className="mt-1 text-[#2D5A27] focus:ring-[#2D5A27]"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#2B2B2B] flex items-center gap-1.5">
                        <IconComp className="w-3.5 h-3.5 text-[#2D5A27]" />
                        {method.label}
                      </span>
                      <span className="block text-[10px] text-[#2B2B2B]/60 font-light mt-0.5">{method.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Sidebar: Order Checkout Summary */}
        <div className="space-y-6">
          <div className="bg-[#F5EFE2] border border-[#e2dccf] rounded-3xl p-6 space-y-5 shadow-md">
            <h3 className="text-sm font-bold text-[#2D5A27] uppercase tracking-wider border-b border-[#dad4c6] pb-3">Checkout Items</h3>
            
            <div className="space-y-3 max-h-40 overflow-y-auto border-b border-[#dad4c6] pb-3">
              {cart.map((item) => {
                const price = item.product.salePrice ? item.product.salePrice : item.product.price;
                return (
                  <div key={item.id} className="flex justify-between items-center text-xs text-[#2B2B2B]/90 font-light">
                    <span className="truncate pr-4">{item.product.name} (x{item.quantity})</span>
                    <span className="font-semibold flex-shrink-0">₹{price * item.quantity}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 text-xs font-light text-[#2B2B2B]/80">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-[#2D5A27] font-semibold">
                  <span>Promo Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between items-center text-[#2D5A27] font-semibold">
                  <span>Loyalty Discount</span>
                  <span>-₹{pointsDiscount}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div className="border-t border-[#dcd6c8] pt-3 flex justify-between items-center text-sm font-bold text-[#2D5A27]">
                <span>Grand Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2D5A27] hover:bg-[#C9A227] text-white py-3.5 rounded-full font-bold uppercase tracking-wider text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>

      </form>

      {/* --- MOCK RAZORPAY SANDBOX OVERLAY --- */}
      {showRazorpayMock && (
        <div className="fixed inset-0 z-50 bg-[#2B2B2B]/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF8F2] rounded-3xl border border-[#F5EFE2] shadow-2xl max-w-sm w-full p-6 sm:p-8 animate-slide-up space-y-6">
            
            {/* Header info */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold text-[#C9A227] tracking-widest uppercase">Razorpay Sandbox</span>
              <h3 className="text-lg font-serif font-bold text-[#2D5A27]">Simulated Payment Gateway</h3>
              <p className="text-[11px] text-[#2B2B2B]/60 font-light">Confirm transaction amount to authorize order completion.</p>
            </div>

            {/* Price Frame */}
            <div className="bg-white rounded-2xl p-4 border border-[#F5EFE2] text-center space-y-1">
              <span className="text-[10px] text-[#2B2B2B]/50 block">Amount Authorized</span>
              <span className="text-2xl font-bold text-[#2D5A27]">₹{finalTotal}</span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleMockPaymentSuccess}
                className="w-full py-3 bg-[#2D5A27] text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-green-700 transition-colors shadow-sm"
              >
                Simulate Successful Payment
              </button>
              <button
                onClick={handleMockPaymentFail}
                className="w-full py-3 bg-red-50 text-red-700 border border-red-200 font-bold text-xs uppercase tracking-wider rounded-full hover:bg-red-100 transition-colors"
              >
                Simulate Cancelled / Failed Payment
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
