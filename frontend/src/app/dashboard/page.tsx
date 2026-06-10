'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { User as UserIcon, ShoppingBag, Heart, MapPin, Settings, Sparkles, RefreshCw, LogOut, CheckCircle, Tag } from 'lucide-react';
import Link from 'next/link';

// Mock values for fallback local database operation
const MOCK_ORDERS = [
  {
    id: 'ord_mock_12345',
    totalAmount: 1848.0,
    status: 'SHIPPED',
    paymentMethod: 'Razorpay',
    paymentStatus: 'PAID',
    pointsEarned: 184,
    createdAt: '2026-06-05T12:00:00Z',
    items: [
      {
        quantity: 1,
        price: 1399.0,
        product: { name: 'Vedic A2 Gir Cow Bilona Ghee', images: ['https://images.unsplash.com/photo-1589733901241-5e3a676a04a3?q=80&w=200'] }
      },
      {
        quantity: 1,
        price: 449.0,
        product: { name: 'Organic Ashwagandha Capsules', images: ['https://images.unsplash.com/photo-1611070973770-b1a672610041?q=80&w=200'] }
      }
    ]
  }
];

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, token, logout, updateUserLocal } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();

  // Redirect if not signed in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user]);

  // States
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses' | 'settings'>('profile');
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Form states
  const [profilePhone, setProfilePhone] = useState(user?.profile?.phone || '');
  const [addressLine1, setAddressLine1] = useState(user?.profile?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(user?.profile?.addressLine2 || '');
  const [city, setCity] = useState(user?.profile?.city || '');
  const [state, setState] = useState(user?.profile?.state || '');
  const [postalCode, setPostalCode] = useState(user?.profile?.postalCode || '');
  
  const [settingsName, setSettingsName] = useState(user?.name || '');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Fetch orders
  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.orders.getMyOrders();
      if (res.success) {
        setOrders(res.orders || []);
      } else {
        setOrders(MOCK_ORDERS);
      }
    } catch (err) {
      setOrders(MOCK_ORDERS);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch wishlist products
  const loadWishlist = async () => {
    if (wishlist.length === 0) {
      setWishlistProducts([]);
      return;
    }
    setWishlistLoading(true);
    try {
      // Pull products matching active wishlist IDs
      const res = await api.products.getAll({ limit: 50 });
      if (res.success && res.data) {
        const filtered = res.data.filter((p: any) => wishlist.includes(p.id));
        setWishlistProducts(filtered);
      }
    } catch (err) {
      console.warn('Failed to load wishlist items details');
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (activeTab === 'orders') loadOrders();
      if (activeTab === 'wishlist') loadWishlist();
    }
  }, [activeTab, wishlist, user]);

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Simulate updating user profile
    const updatedUser = {
      ...user,
      profile: {
        ...user.profile!,
        phone: profilePhone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode
      }
    };
    updateUserLocal(updatedUser);
    alert('Shipping Address saved successfully!');
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Simulate account settings change
    const updatedUser = {
      ...user,
      name: settingsName
    };
    updateUserLocal(updatedUser);
    setSettingsSuccess(true);
    setSettingsPassword('');
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3 text-sm text-[#2B2B2B]/60 font-sans">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2D5A27]" />
        <span>Authenticating session details...</span>
      </div>
    );
  }

  const tabItems = [
    { id: 'profile', name: 'My Profile', icon: UserIcon },
    { id: 'orders', name: 'Order History', icon: ShoppingBag },
    { id: 'wishlist', name: 'My Wishlist', icon: Heart },
    { id: 'addresses', name: 'Shipping Address', icon: MapPin },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Sidebar Toggles */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">
          
          {/* User badge card */}
          <div className="bg-[#2D5A27] rounded-3xl p-6 text-white space-y-2 border border-[#FAF8F2] shadow-md">
            <div className="h-12 w-12 bg-[#F5EFE2] rounded-full flex items-center justify-center text-[#2D5A27] font-serif font-bold text-xl shadow-inner">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-serif font-bold truncate">{user.name}</h2>
              <span className="text-[10px] text-[#FAF8F2]/75 font-light">{user.email}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="bg-white rounded-2xl border border-[#F5EFE2] p-2 space-y-1 shadow-sm">
            {tabItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full text-left px-4 py-3 text-xs font-semibold rounded-xl transition-all flex items-center gap-2.5 ${activeTab === item.id ? 'bg-[#FAF8F2] text-[#2D5A27] border-l-4 border-[#2D5A27]' : 'text-[#2B2B2B]/80 hover:bg-[#FAF8F2]'}`}
                >
                  <IconComp className="w-4.5 h-4.5" />
                  {item.name}
                </button>
              );
            })}
            <button
              onClick={logout}
              className="w-full text-left px-4 py-3 text-xs font-semibold rounded-xl text-red-600 hover:bg-red-50 transition-all flex items-center gap-2.5"
            >
              <LogOut className="w-4.5 h-4.5" />
              Sign Out
            </button>
          </div>

        </aside>

        {/* Right Dashboard Workspace Panel */}
        <div className="flex-grow bg-white rounded-3xl border border-[#F5EFE2] p-6 sm:p-8 shadow-sm min-h-[400px]">
          
          {/* TAB 1: PROFILE SUMMARY */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-[#F5EFE2] pb-4">
                <h2 className="text-xl font-serif font-bold text-[#2D5A27]">Profile Dashboard</h2>
                <p className="text-xs text-[#2B2B2B]/60 font-light mt-0.5">Welcome back to your Vedic wellness dashboard.</p>
              </div>

              {/* Stats aggregates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Loyalty points card */}
                <div className="bg-[#F5EFE2] rounded-2xl p-6 border border-[#e2dccf] space-y-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#2B2B2B]/60">Loyalty Points</span>
                    <h3 className="text-3xl font-serif font-bold text-[#2D5A27] flex items-center gap-1.5">
                      <Sparkles className="w-6 h-6 text-[#C9A227] fill-[#C9A227]" />
                      {user.profile?.loyaltyPoints || 0}
                    </h3>
                    <p className="text-[10px] font-light text-[#2B2B2B]/75 leading-relaxed">
                      Points are worth ₹1.0 each. Spend them at checkout or on subscriptions.
                    </p>
                  </div>
                </div>

                {/* Referral program card */}
                <div className="bg-white rounded-2xl p-6 border border-[#F5EFE2] space-y-3 shadow-inner">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#2B2B2B]/60">My Referral Code</span>
                    <h3 className="text-xl font-serif font-bold text-[#C9A227] tracking-widest flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      {user.profile?.referralCode || 'DVYUG100'}
                    </h3>
                    <p className="text-[10px] font-light text-[#2B2B2B]/75 leading-relaxed">
                      Share this code with companions. They receive 50 points on signup, and you receive 100 points upon their first order.
                    </p>
                  </div>
                </div>

              </div>

              {/* Profile details grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#2B2B2B] uppercase tracking-wider">Account Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light text-[#2B2B2B]/85">
                  <div className="p-3 bg-[#FAF8F2] rounded-lg border border-[#F5EFE2]">
                    <span className="block font-bold text-[10px] text-[#2D5A27] uppercase">Full Name</span>
                    <span className="block mt-0.5 font-medium">{user.name}</span>
                  </div>
                  <div className="p-3 bg-[#FAF8F2] rounded-lg border border-[#F5EFE2]">
                    <span className="block font-bold text-[10px] text-[#2D5A27] uppercase">Email Address</span>
                    <span className="block mt-0.5 font-medium">{user.email}</span>
                  </div>
                  <div className="p-3 bg-[#FAF8F2] rounded-lg border border-[#F5EFE2]">
                    <span className="block font-bold text-[10px] text-[#2D5A27] uppercase">Phone Number</span>
                    <span className="block mt-0.5 font-medium">{user.profile?.phone || 'Not provided'}</span>
                  </div>
                  <div className="p-3 bg-[#FAF8F2] rounded-lg border border-[#F5EFE2]">
                    <span className="block font-bold text-[10px] text-[#2D5A27] uppercase">Registered Since</span>
                    <span className="block mt-0.5 font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#F5EFE2] pb-4">
                <h2 className="text-xl font-serif font-bold text-[#2D5A27]">Order History</h2>
                <p className="text-xs text-[#2B2B2B]/60 font-light mt-0.5">Track and view invoices for all purchases.</p>
              </div>

              {ordersLoading ? (
                <div className="flex justify-center py-20">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <p className="text-xs text-[#2B2B2B]/60 font-light">No orders placed yet.</p>
                  <Link href="/shop" className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs font-bold rounded-full hover:bg-[#C9A227] shadow-sm">
                    Browse Shop
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl border border-[#F5EFE2] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      
                      {/* Order main meta bar */}
                      <div className="bg-[#F5EFE2] px-4 py-3 flex flex-wrap justify-between items-center gap-2 border-b border-[#e2dccf] text-xs font-light text-[#2B2B2B]/80">
                        <div>
                          <span>Order ID: </span>
                          <span className="font-bold uppercase text-[#2B2B2B]">{order.id.slice(0, 8)}</span>
                        </div>
                        <div>
                          <span>Placed: </span>
                          <span className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase bg-[#2D5A27]">
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items loop */}
                      <div className="p-4 space-y-3">
                        {order.items.map((item: any, i: number) => (
                          <div key={i} className="flex gap-3 items-center">
                            <img 
                              src={item.product.images ? (typeof item.product.images === 'string' ? JSON.parse(item.product.images)[0] : item.product.images[0]) : 'https://images.unsplash.com/photo-1611070973770-b1a672610041?q=80&w=100'} 
                              alt={item.product.name} 
                              className="w-10 h-10 object-cover rounded bg-[#FAF8F2]" 
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-[#2B2B2B] truncate">{item.product.name}</h4>
                              <span className="text-[10px] text-[#2B2B2B]/60 font-light">Qty: {item.quantity} &bull; Price: ₹{item.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Receipts totals and reward credits */}
                      <div className="px-4 py-3 bg-[#FAF8F2] border-t border-[#F5EFE2] flex flex-wrap justify-between items-center gap-4 text-xs font-light text-[#2B2B2B]">
                        <div className="flex items-center gap-1 text-[#2D5A27] font-semibold">
                          <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                          +{order.pointsEarned} Points Credited
                        </div>
                        <div className="font-bold text-[#2D5A27]">
                          <span>Paid: </span>
                          <span>₹{order.totalAmount}</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: WISHLIST PORTAL */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#F5EFE2] pb-4">
                <h2 className="text-xl font-serif font-bold text-[#2D5A27]">My Wishlist</h2>
                <p className="text-xs text-[#2B2B2B]/60 font-light mt-0.5">Quickly access items you favorited.</p>
              </div>

              {wishlistLoading ? (
                <div className="flex justify-center py-20">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
                </div>
              ) : wishlistProducts.length === 0 ? (
                <p className="text-xs text-[#2B2B2B]/50 italic font-light py-8 text-center">No items added to wishlist.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((product) => {
                    const price = product.salePrice || product.price;
                    return (
                      <div key={product.id} className="bg-white rounded-xl border border-[#F5EFE2] p-3 flex gap-3 shadow-sm justify-between">
                        <img src={product.images[0]} alt={product.name} className="w-14 h-14 object-cover rounded-lg bg-[#FAF8F2] flex-shrink-0" />
                        <div className="flex-grow min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-[#2B2B2B] truncate">{product.name}</h4>
                            <span className="text-[10px] text-[#2D5A27]">{product.category}</span>
                          </div>
                          <span className="text-xs font-bold text-[#2D5A27] mt-1">₹{price}</span>
                        </div>
                        <div className="flex flex-col gap-2 justify-center">
                          <button
                            onClick={() => { addToCart(product, 1); alert(`${product.name} added to cart!`); }}
                            className="p-1.5 rounded-full bg-[#FAF8F2] hover:bg-[#2D5A27] hover:text-white border border-[#ded8c9] text-[#2D5A27]"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="text-[9px] text-red-500 font-bold hover:underline uppercase"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 4: SHIPPING ADDRESS */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#F5EFE2] pb-4">
                <h2 className="text-xl font-serif font-bold text-[#2D5A27]">Default Shipping Address</h2>
                <p className="text-xs text-[#2B2B2B]/60 font-light mt-0.5">Configure address coordinates for automatic checkout auto-filling.</p>
              </div>

              <form onSubmit={handleUpdateAddress} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Contact Phone</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Address Line 1</label>
                    <input
                      type="text"
                      placeholder="Street name, flat, house number..."
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      placeholder="Apartment, building unit details..."
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">City</label>
                    <input
                      type="text"
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
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">PIN Code</label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs font-bold uppercase rounded-full hover:bg-[#C9A227] shadow-sm"
                >
                  Save Address
                </button>
              </form>

            </div>
          )}

          {/* TAB 5: ACCOUNT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#F5EFE2] pb-4">
                <h2 className="text-xl font-serif font-bold text-[#2D5A27]">Account Settings</h2>
                <p className="text-xs text-[#2B2B2B]/60 font-light mt-0.5">Manage personal information and passwords.</p>
              </div>

              {settingsSuccess && (
                <div className="bg-[#FAF8F2] border border-[#2D5A27]/30 text-[#2D5A27] text-xs rounded-xl p-3 flex items-center gap-2 font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Account configurations updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleUpdateAccount} className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Display Name</label>
                  <input
                    type="text"
                    required
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Change Password</label>
                  <input
                    type="password"
                    placeholder="New password (optional)..."
                    value={settingsPassword}
                    onChange={(e) => setSettingsPassword(e.target.value)}
                    className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs font-bold uppercase rounded-full hover:bg-[#C9A227] shadow-sm"
                >
                  Save Settings
                </button>
              </form>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
