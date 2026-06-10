'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cart,
    cartCount,
    cartTotal,
    couponCode,
    discount,
    redeemPoints,
    pointsDiscount,
    updateCartQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    setRedeemPoints,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(false);

  const cartSubtotal = cart.reduce((total, item) => {
    const price = item.product.salePrice ? item.product.salePrice : item.product.price;
    return total + price * item.quantity;
  }, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(false);
    setCouponSuccess(false);
    if (couponInput.trim()) {
      const valid = applyCoupon(couponInput);
      if (valid) {
        setCouponSuccess(true);
        setCouponInput('');
      } else {
        setCouponError(true);
      }
    }
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    router.push('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center font-sans space-y-6">
        <div className="h-16 w-16 bg-[#F5EFE2] rounded-full flex items-center justify-center text-[#2D5A27] mx-auto shadow-inner">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-serif font-bold text-[#2D5A27]">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-[#2B2B2B]/60 font-light">Add premium organic, Ayurvedic, and Vedic essentials to get started.</p>
        </div>
        <Link 
          href="/shop" 
          className="inline-block px-8 py-3 bg-[#2D5A27] hover:bg-[#C9A227] text-white font-bold uppercase tracking-wider text-xs rounded-full shadow-md transition-colors"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      <h1 className="text-3xl font-serif font-bold text-[#2D5A27]">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Cart Items lists */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const price = item.product.salePrice ? item.product.salePrice : item.product.price;
            return (
              <div 
                key={item.id} 
                className="bg-white border border-[#F5EFE2] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img 
                    src={item.product.images[0]} 
                    alt={item.product.name} 
                    className="w-16 h-16 object-cover rounded-xl bg-[#FAF8F2] border border-[#F5EFE2] flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase text-[#2D5A27] font-semibold">{item.product.category}</span>
                    <Link href={`/shop/${item.product.slug}`}>
                      <h3 className="text-xs sm:text-sm font-serif font-semibold text-[#2B2B2B] hover:text-[#2D5A27] line-clamp-1">
                        {item.product.name}
                      </h3>
                    </Link>
                    <span className="text-xs font-bold text-[#2D5A27] block mt-0.5">₹{price}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-8 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="flex items-center bg-[#FAF8F2] border border-[#e0dacd] rounded-full p-1">
                    <button
                      onClick={() => item.quantity > 1 && updateCartQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-[#2D5A27] hover:bg-[#F5EFE2] rounded-full"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3.5 text-xs font-bold text-[#2B2B2B]">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-[#2D5A27] hover:bg-[#F5EFE2] rounded-full"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-[#2B2B2B] w-16 text-right">
                    ₹{Math.round(price * item.quantity * 100) / 100}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Cart Summary card & Loyalty points */}
        <div className="space-y-6">
          
          {/* Promo Vouchers Panel */}
          <div className="bg-white rounded-2xl border border-[#F5EFE2] p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[#2B2B2B] uppercase tracking-wider">Apply Coupon</h3>
            
            {couponCode ? (
              <div className="flex justify-between items-center bg-[#2D5A27]/10 border border-[#2D5A27]/30 rounded-xl p-3 text-xs text-[#2D5A27] font-semibold">
                <span>Active: {couponCode}</span>
                <button onClick={removeCoupon} className="text-[10px] uppercase font-bold text-red-600 hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (VEDIC10, DIVINE20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-[#FAF8F2] text-xs px-3 py-2 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2D5A27] hover:bg-[#C9A227] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Apply
                </button>
              </form>
            )}
            {couponError && <p className="text-[10px] text-red-600 font-semibold mt-1">Invalid Coupon Code</p>}
            {couponSuccess && <p className="text-[10px] text-[#2D5A27] font-semibold mt-1">Coupon Applied Successfully!</p>}
          </div>

          {/* Loyalty Points Panel */}
          {user && user.profile && user.profile.loyaltyPoints > 0 && (
            <div className="bg-white rounded-2xl border border-[#F5EFE2] p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#2B2B2B] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C9A227]" />
                Loyalty Rewards
              </h3>
              <p className="text-[10px] text-[#2B2B2B]/60 font-light">
                You have **{user.profile.loyaltyPoints}** loyalty points (Worth ₹{user.profile.loyaltyPoints} discount).
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="redeemPoints"
                  checked={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.checked)}
                  className="rounded border-[#c3bdad] text-[#2D5A27] focus:ring-[#2D5A27] h-4 w-4"
                />
                <label htmlFor="redeemPoints" className="text-xs font-semibold text-[#2B2B2B] cursor-pointer">
                  Redeem points on this order
                </label>
              </div>
            </div>
          )}

          {/* Summary Price list */}
          <div className="bg-[#F5EFE2] border border-[#e2dccf] rounded-3xl p-6 space-y-5 shadow-md">
            <h3 className="text-sm font-bold text-[#2D5A27] uppercase tracking-wider border-b border-[#dad4c6] pb-3">Order Summary</h3>
            
            <div className="space-y-3 text-xs font-light text-[#2B2B2B]/90">
              <div className="flex justify-between items-center">
                <span>Subtotal ({cartCount} items)</span>
                <span className="font-semibold">₹{Math.round(cartSubtotal * 100) / 100}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between items-center text-[#2D5A27] font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              {pointsDiscount > 0 && (
                <div className="flex justify-between items-center text-[#2D5A27] font-semibold">
                  <span>Loyalty Points Discount</span>
                  <span>-₹{pointsDiscount}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Shipping Fee</span>
                <span>{cartSubtotal >= 499 ? 'FREE' : '₹60'}</span>
              </div>

              <div className="border-t border-[#dcd6c8] pt-4 flex justify-between items-center text-sm font-bold text-[#2D5A27]">
                <span>Total Amount</span>
                <span>₹{cartTotal + (cartSubtotal >= 499 ? 0 : 60)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full bg-[#2D5A27] hover:bg-[#C9A227] text-white py-3.5 rounded-full font-bold uppercase tracking-wider text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              Checkout Order
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
