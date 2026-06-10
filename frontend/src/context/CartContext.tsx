'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string; // cart item ID
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    images: string[];
    category: string;
    stock: number;
  };
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[]; // product IDs
  loading: boolean;
  cartCount: number;
  cartTotal: number;
  couponCode: string;
  discount: number;
  redeemPoints: boolean;
  pointsDiscount: number;
  addToCart: (product: any, quantity?: number) => Promise<void>;
  updateCartQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  setRedeemPoints: (redeem: boolean) => void;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [redeemPoints, setRedeemPointsState] = useState(false);
  const [pointsDiscount, setPointsDiscount] = useState(0);

  // Load local or remote cart on mount / user change
  useEffect(() => {
    const initCart = async () => {
      setLoading(true);
      if (user) {
        try {
          // Fetch database cart
          const res = await api.cart.get();
          if (res.success) setCart(res.cart);
          
          // Fetch wishlist from local storage for simplicity or mock it
          const localWish = localStorage.getItem(`dvyug_wishlist_${user.id}`);
          if (localWish) setWishlist(JSON.parse(localWish));
        } catch (error) {
          console.error('Failed to load cart from database', error);
        }
      } else {
        // Load guest cart from localstorage
        const localCart = localStorage.getItem('dvyug_guest_cart');
        if (localCart) setCart(JSON.parse(localCart));
        
        const localWish = localStorage.getItem('dvyug_guest_wishlist');
        if (localWish) setWishlist(JSON.parse(localWish));
      }
      setLoading(false);
    };

    initCart();
  }, [user]);

  // Sync guest cart to local storage when it changes
  useEffect(() => {
    if (!user) {
      localStorage.setItem('dvyug_guest_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  // Sync wishlist to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`dvyug_wishlist_${user.id}`, JSON.stringify(wishlist));
    } else {
      localStorage.setItem('dvyug_guest_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const refreshCart = async () => {
    if (user) {
      const res = await api.cart.get();
      if (res.success) setCart(res.cart);
    }
  };

  const addToCart = async (product: any, quantity = 1) => {
    if (user) {
      setLoading(true);
      try {
        await api.cart.add(product.id, quantity);
        await refreshCart();
      } finally {
        setLoading(false);
      }
    } else {
      // Guest local cart addition
      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
        if (existingIndex > -1) {
          const newCart = [...prevCart];
          newCart[existingIndex].quantity += quantity;
          return newCart;
        } else {
          const newItem: CartItem = {
            id: `guest_${Math.random().toString(36).substring(2, 9)}`,
            quantity,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              salePrice: product.salePrice,
              images: product.images,
              category: product.category,
              stock: product.stock
            }
          };
          return [...prevCart, newItem];
        }
      });
    }
  };

  const updateCartQuantity = async (id: string, quantity: number) => {
    if (user) {
      setLoading(true);
      try {
        await api.cart.updateQty(id, quantity);
        await refreshCart();
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const removeFromCart = async (id: string) => {
    if (user) {
      setLoading(true);
      try {
        await api.cart.remove(id);
        await refreshCart();
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    }
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setDiscount(0);
    setRedeemPointsState(false);
    setPointsDiscount(0);
    if (!user) {
      localStorage.removeItem('dvyug_guest_cart');
    }
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => {
    const activePrice = item.product.salePrice ? item.product.salePrice : item.product.price;
    return total + activePrice * item.quantity;
  }, 0);

  // Coupon application logic
  const applyCoupon = (code: string) => {
    const upperCode = code.toUpperCase();
    if (upperCode === 'VEDIC10') {
      setCouponCode(upperCode);
      setDiscount(cartSubtotal * 0.10);
      return true;
    } else if (upperCode === 'DIVINE20') {
      setCouponCode(upperCode);
      setDiscount(cartSubtotal * 0.20);
      return true;
    } else if (upperCode === 'FIRST50') {
      setCouponCode(upperCode);
      setDiscount(Math.min(50, cartSubtotal));
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscount(0);
  };

  // Loyalty points redemption logic
  const setRedeemPoints = (redeem: boolean) => {
    setRedeemPointsState(redeem);
    if (redeem && user && user.profile) {
      const activeTotal = cartSubtotal - discount;
      const pointsToRedeem = Math.min(user.profile.loyaltyPoints, Math.floor(activeTotal));
      setPointsDiscount(pointsToRedeem);
    } else {
      setPointsDiscount(0);
    }
  };

  // Keep discount and points discount updated as cart changes
  useEffect(() => {
    if (couponCode) {
      applyCoupon(couponCode);
    }
  }, [cartSubtotal, couponCode]);

  useEffect(() => {
    if (redeemPoints && user && user.profile) {
      const activeTotal = cartSubtotal - discount;
      const pointsToRedeem = Math.min(user.profile.loyaltyPoints, Math.floor(activeTotal));
      setPointsDiscount(pointsToRedeem);
    }
  }, [cartSubtotal, discount, redeemPoints, user]);

  const cartTotal = Math.max(0, cartSubtotal - discount - pointsDiscount);

  // Wishlist actions
  const toggleWishlist = async (productId: string) => {
    setWishlist((prevWish) => {
      if (prevWish.includes(productId)) {
        return prevWish.filter((id) => id !== productId);
      } else {
        return [...prevWish, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        loading,
        cartCount,
        cartTotal: Math.round(cartTotal * 100) / 100,
        couponCode,
        discount: Math.round(discount * 100) / 100,
        redeemPoints,
        pointsDiscount,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        setRedeemPoints,
        toggleWishlist,
        isInWishlist,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
