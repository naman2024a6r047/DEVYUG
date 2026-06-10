'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { Star, ShoppingCart, Search, SlidersHorizontal, RefreshCw, Sparkles, Box, Info, X, Heart } from 'lucide-react';
import Link from 'next/link';

// Fallback seed products list for offline support
const FALLBACK_PRODUCTS = [
  { id: '1', name: 'Organic Ashwagandha Capsules', slug: 'organic-ashwagandha-capsules', description: 'Premium organic Ashwagandha root extract capsules to reduce stress and boost cognitive function.', price: 499.0, salePrice: 449.0, stock: 50, category: 'Herbal Products', ratings: 4.8, images: ['https://images.unsplash.com/photo-1611070973770-b1a672610041?q=80&w=600'], ingredients: ['Ashwagandha Extract'], benefits: ['Reduces anxiety', 'Improves vitality'], ayurvedicProperties: 'Vata/Kapha balancing' },
  { id: '2', name: 'Vedic A2 Gir Cow Bilona Ghee', slug: 'vedic-a2-gir-cow-bilona-ghee', description: 'Authentic A2 Ghee made using traditional wooden churners.', price: 1499.0, salePrice: 1399.0, stock: 25, category: 'Organic Food', ratings: 4.9, images: ['https://images.unsplash.com/photo-1589733901241-5e3a676a04a3?q=80&w=600'], ingredients: ['Gir cow milk fat'], benefits: ['Strengthens gut', 'Boosts ojas'], ayurvedicProperties: 'Vata/Pitta balancing' },
  { id: '3', name: 'Sandalwood Incense Sticks', slug: 'sandalwood-chandan-incense-sticks', description: 'Handrolled chemical-free incense for peaceful environments.', price: 250.0, salePrice: 220.0, stock: 100, category: 'Spiritual Essentials', ratings: 4.7, images: ['https://images.unsplash.com/photo-1602847213180-50e43a80cef6?q=80&w=600'], ingredients: ['Sandalwood powder', 'essential oils'], benefits: ['Purifies space', 'Calms mind'], ayurvedicProperties: 'Cooling Pitta' },
  { id: '4', name: 'Kumkumadi Radiance Face Oil', slug: 'kumkumadi-radiance-face-oil', description: 'Ayurvedic skin brightening serum with saffron and goat milk.', price: 1899.0, salePrice: 1699.0, stock: 30, category: 'Personal Care', ratings: 4.9, images: ['https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600'], ingredients: ['Saffron', 'Sandalwood', 'Goat milk'], benefits: ['Reduces spots', 'Gives natural glow'], ayurvedicProperties: 'Varnya (Complexion booster)' },
  { id: '5', name: 'Premium Puja Thali Gift Set', slug: 'premium-puja-thali-gift-set', description: 'Traditional solid brass plate set for holy rituals.', price: 2499.0, salePrice: 2299.0, stock: 15, category: 'Gift Sets', ratings: 4.8, images: ['https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=600'], ingredients: ['Solid brass items'], benefits: ['Aesthetic look', 'Traditional feel'], ayurvedicProperties: 'Purifying metal waves' },
  { id: '6', name: 'Organic Tulsi Herbal Tea', slug: 'organic-tulsi-herbal-tea', description: 'Relaxing herbal tea made from three kinds of holy Tulsi leaves.', price: 299.0, salePrice: 269.0, stock: 80, category: 'Organic Food', ratings: 4.6, images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600'], ingredients: ['Rama, Krishna, Vana Tulsi'], benefits: ['Antioxidant boost', 'Respiration support'], ayurvedicProperties: 'Ushna (Warm potency)' },
  { id: '7', name: 'Giloy & Neem Purifying Soap', slug: 'giloy-neem-purifying-soap', description: 'Anti-bacterial bath soap for skin rashes.', price: 180.0, salePrice: 150.0, stock: 120, category: 'Personal Care', ratings: 4.5, images: ['https://images.unsplash.com/photo-1607006342465-b74d324b104e?q=80&w=600'], ingredients: ['Neem', 'Giloy extract'], benefits: ['Soothes rashes', 'Antibacterial'], ayurvedicProperties: 'Pitta/Kapha pacifier' },
  { id: '8', name: 'Pure Camphor (Bhimseni Kapur)', slug: 'pure-camphor-bhimseni-kapur', description: 'Pure white wax-free camphor for puja and aromatherapy.', price: 350.0, salePrice: 310.0, stock: 90, category: 'Puja Essentials', ratings: 4.7, images: ['https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=600'], ingredients: ['Camphor crystals'], benefits: ['Cleans air', 'Calms sinus'], ayurvedicProperties: 'Scent therapeutic' }
];

const CATEGORIES_LIST = [
  'Herbal Products',
  'Organic Food',
  'Spiritual Essentials',
  'Personal Care',
  'Puja Essentials',
  'Gift Sets'
];

export default function ShopPage() {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  
  // States
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(2500);
  const [sortBy, setSortBy] = useState('newest');
  
  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  
  // Mode selection (Standard vs Quiz vs Gift Hamper)
  const [activeMode, setActiveMode] = useState<'shop' | 'quiz' | 'hamper'>('shop');

  // --- AI RECOMMENDATION QUIZ STATES ---
  const [quizStep, setQuizStep] = useState(1);
  const [quizAge, setQuizAge] = useState('');
  const [quizLifestyle, setQuizLifestyle] = useState('');
  const [quizGoal, setQuizGoal] = useState('');
  const [quizInterests, setQuizInterests] = useState<string[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [quizExplanation, setQuizExplanation] = useState('');
  const [quizLoading, setQuizLoading] = useState(false);

  // --- HAMPER BUILDER STATES ---
  const [hamperBoxSize, setHamperBoxSize] = useState<'small' | 'medium' | 'large'>('small');
  const [hamperItems, setHamperItems] = useState<any[]>([]);
  const [hamperGreeting, setHamperGreeting] = useState('');
  const [hamperSuccess, setHamperSuccess] = useState(false);

  const getHamperLimit = () => {
    if (hamperBoxSize === 'small') return 3;
    if (hamperBoxSize === 'medium') return 5;
    return 8;
  };

  const getHamperDiscount = () => {
    if (hamperBoxSize === 'small') return 0.05; // 5%
    if (hamperBoxSize === 'medium') return 0.10; // 10%
    return 0.15; // 15%
  };

  const getHamperBasePrice = () => {
    if (hamperBoxSize === 'small') return 150; // box cost
    if (hamperBoxSize === 'medium') return 250;
    return 350;
  };

  // Fetch shop items
  const loadShop = async () => {
    setLoading(true);
    try {
      const res = await api.products.getAll({
        category: selectedCategory || undefined,
        maxPrice: maxPrice.toString(),
        search: search || undefined,
        sortBy
      });
      if (res.success) {
        setProducts(res.data || []);
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
    } catch (err) {
      console.warn('REST API unavailable. Running Shop using local fallback items.');
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  // Listen filters
  useEffect(() => {
    if (activeMode === 'shop') {
      loadShop();
    }
  }, [selectedCategory, maxPrice, sortBy, activeMode]);

  // Handle URL query check on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('hamper') === 'true') setActiveMode('hamper');
      if (urlParams.get('quiz') === 'true') setActiveMode('quiz');
      const catParam = urlParams.get('category');
      if (catParam) setSelectedCategory(catParam);
      const searchParam = urlParams.get('search');
      if (searchParam) setSearch(searchParam);
    }
    loadShop();
  }, []);

  // --- AI RECOMMENDATION SUBMIT ---
  const handleQuizSubmit = async () => {
    setQuizLoading(true);
    try {
      const res = await api.ai.getRecommendations({
        age: quizAge,
        lifestyle: quizLifestyle,
        goal: quizGoal,
        healthInterest: quizInterests
      });
      if (res.success) {
        setQuizResults(res.recommendations);
        setQuizExplanation(res.explanation);
      } else {
        setQuizResults(FALLBACK_PRODUCTS.slice(0, 3));
        setQuizExplanation('These general organic products balance stress and strengthen cellular immunity.');
      }
    } catch (err) {
      setQuizResults(FALLBACK_PRODUCTS.slice(0, 3));
      setQuizExplanation('Ancient scriptures recommend adaptogens like Ashwagandha and purifying honey to balance Vata/Pitta during busy lifestyles.');
    } finally {
      setQuizLoading(false);
      setQuizStep(5); // results step
    }
  };

  const resetQuiz = () => {
    setQuizStep(1);
    setQuizAge('');
    setQuizLifestyle('');
    setQuizGoal('');
    setQuizInterests([]);
    setQuizResults([]);
    setQuizExplanation('');
  };

  // --- HAMPER ACTIONS ---
  const toggleHamperItem = (product: any) => {
    setHamperItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        if (prev.length >= getHamperLimit()) {
          alert(`Your ${hamperBoxSize} box is full! Upgrade size or remove items.`);
          return prev;
        }
        return [...prev, product];
      }
    });
  };

  const calculateHamperTotal = () => {
    const itemsTotal = hamperItems.reduce((sum, item) => sum + (item.salePrice || item.price), 0);
    const boxCost = getHamperBasePrice();
    const discount = itemsTotal * getHamperDiscount();
    return Math.round((itemsTotal + boxCost - discount) * 100) / 100;
  };

  const addHamperToCart = async () => {
    if (hamperItems.length === 0) {
      alert('Please add some items to your gift hamper first!');
      return;
    }
    
    // Package hamper as a virtual custom product bundle
    const bundleProduct = {
      id: `hamper_${Date.now()}`,
      name: `Custom Vedic Gift Bundle (${hamperBoxSize.toUpperCase()})`,
      slug: `custom-hamper-${Date.now()}`,
      price: calculateHamperTotal(),
      salePrice: null,
      images: ['https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=400'],
      category: 'Gift Sets',
      stock: 1
    };

    await addToCart(bundleProduct, 1);
    setHamperSuccess(true);
    setHamperItems([]);
    setHamperGreeting('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      
      {/* Dynamic Header Tab Modes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F5EFE2] pb-6 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D5A27] flex items-center gap-2">
            DVYUG Mandir (Shop)
            {activeMode === 'quiz' && <span className="text-sm font-sans font-medium px-2 py-0.5 rounded bg-[#C9A227] text-white">AI Assistant</span>}
            {activeMode === 'hamper' && <span className="text-sm font-sans font-medium px-2 py-0.5 rounded bg-[#2D5A27] text-white">Custom Gifting</span>}
          </h1>
          <p className="text-xs text-[#2B2B2B]/60 font-light mt-1">Explore wellness and spiritual products prepared with devotion.</p>
        </div>
        <div className="flex bg-[#F5EFE2] p-1 rounded-full border border-[#dcd6c8] self-start sm:self-center">
          <button
            onClick={() => setActiveMode('shop')}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${activeMode === 'shop' ? 'bg-[#2D5A27] text-white' : 'text-[#2B2B2B]/85 hover:text-[#2D5A27]'}`}
          >
            Catalog
          </button>
          <button
            onClick={() => setActiveMode('quiz')}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-1 ${activeMode === 'quiz' ? 'bg-[#2D5A27] text-white' : 'text-[#2B2B2B]/85 hover:text-[#2D5A27]'}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
            AI Wellness Quiz
          </button>
          <button
            onClick={() => setActiveMode('hamper')}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-1 ${activeMode === 'hamper' ? 'bg-[#2D5A27] text-white' : 'text-[#2B2B2B]/85 hover:text-[#2D5A27]'}`}
          >
            <Box className="w-3.5 h-3.5" />
            Gift Hamper
          </button>
        </div>
      </div>

      {/* --- MODE 1: CATALOG SHOP GRID --- */}
      {activeMode === 'shop' && (
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 space-y-8 flex-shrink-0">
            <div className="bg-[#F5EFE2] rounded-2xl p-6 border border-[#e8e2d4] space-y-6">
              <div className="flex items-center justify-between border-b border-[#e0dacd] pb-3">
                <h3 className="text-sm font-bold text-[#2D5A27] uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </h3>
                <button 
                  onClick={() => { setSelectedCategory(''); setMaxPrice(2500); setSearch(''); }} 
                  className="text-[10px] font-semibold text-[#2D5A27] hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2B2B2B]">Search Keyword</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search e.g. Tulsi, Honey..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#ded8c9] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] pr-8 text-[#2B2B2B]"
                  />
                  <Search className="w-4 h-4 text-[#2B2B2B]/40 absolute right-2.5 top-3" />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#2B2B2B] block">Category</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left text-xs py-1 transition-colors flex items-center justify-between ${!selectedCategory ? 'text-[#2D5A27] font-semibold' : 'text-[#2B2B2B]/80 hover:text-[#2D5A27]'}`}
                  >
                    <span>All Categories</span>
                  </button>
                  {CATEGORIES_LIST.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left text-xs py-1 transition-colors flex items-center justify-between ${selectedCategory === cat ? 'text-[#2D5A27] font-semibold' : 'text-[#2B2B2B]/80 hover:text-[#2D5A27]'}`}
                    >
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-[#2B2B2B]">Max Price</label>
                  <span className="font-bold text-[#2D5A27]">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2500"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-[#2D5A27] h-1 bg-[#ded8c9] rounded"
                />
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2B2B2B]">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#ded8c9] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                >
                  <option value="newest">Newest Additions</option>
                  <option value="popularity">Popularity Ratings</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>

            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-grow space-y-6">
            <div className="flex justify-between items-center text-xs text-[#2B2B2B]/60 font-light bg-[#F5EFE2]/40 px-4 py-3 rounded-lg border border-[#FAF8F2]">
              <span>Showing {products.length} organic Vedic items</span>
              {search && <span>Filtered by: "{search}"</span>}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-3 text-sm text-[#2B2B2B]/60">
                <RefreshCw className="w-8 h-8 animate-spin text-[#2D5A27]" />
                <span>Reading Vedic scriptures...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-[#F5EFE2] space-y-3">
                <p className="text-sm font-medium text-[#2B2B2B]/60">No matching products found.</p>
                <button 
                  onClick={() => { setSelectedCategory(''); setMaxPrice(2500); setSearch(''); }}
                  className="text-xs font-semibold text-[#2D5A27] hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const activePrice = product.salePrice ? product.salePrice : product.price;
                  const hasDiscount = !!product.salePrice;
                  return (
                    <div 
                      key={product.id} 
                      className="group flex flex-col justify-between bg-white rounded-2xl border border-[#F5EFE2] p-4 shadow-sm hover:shadow-md transition-all duration-300 relative"
                    >
                      {/* Favorite Wishlist Trigger */}
                      <button 
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-6 right-6 z-10 p-2 rounded-full backdrop-blur-md transition-colors ${isInWishlist(product.id) ? 'bg-red-50 text-red-500' : 'bg-[#FAF8F2]/75 hover:bg-[#F5EFE2] text-[#2B2B2B]/60'}`}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>

                      <div className="space-y-3 cursor-pointer" onClick={() => setQuickViewProduct(product)}>
                        <div className="relative h-48 w-full bg-[#FAF8F2] rounded-xl overflow-hidden flex items-center justify-center">
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="object-cover h-full w-full transition-transform duration-500 group-hover:scale-105" 
                          />
                          {hasDiscount && (
                            <span className="absolute top-2 left-2 bg-[#C9A227] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                              Save
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-[#2D5A27] font-semibold uppercase tracking-wider">{product.category}</span>
                          <h3 className="text-sm font-serif font-semibold text-[#2B2B2B] group-hover:text-[#2D5A27] line-clamp-1 transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1 text-[#C9A227]">
                            <Star className="w-3.5 h-3.5 fill-[#C9A227]" />
                            <span className="text-xs font-semibold text-[#2B2B2B]">{product.ratings}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#F5EFE2] flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          {hasDiscount && (
                            <span className="text-[10px] text-[#2B2B2B]/40 line-through">₹{product.price}</span>
                          )}
                          <span className="text-sm font-bold text-[#2D5A27]">₹{activePrice}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setQuickViewProduct(product)}
                            className="px-3 py-1.5 text-[10px] font-semibold text-[#2D5A27] bg-[#F5EFE2] hover:bg-[#FAF8F2] rounded-full transition-colors border border-[#ded8c9]"
                          >
                            Quick View
                          </button>
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="p-2 rounded-full bg-[#2D5A27] text-white hover:bg-[#C9A227] transition-colors"
                            aria-label="Add to cart"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- MODE 2: AI RECOMMENDATION QUIZ --- */}
      {activeMode === 'quiz' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#F5EFE2] p-8 shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <Sparkles className="w-8 h-8 text-[#C9A227] mx-auto animate-pulse" />
            <h2 className="text-2xl font-serif font-bold text-[#2D5A27]">Vedic Body-Type Quiz</h2>
            <p className="text-xs text-[#2B2B2B]/60 font-light">Let our AI match herbal properties with your current health constitution.</p>
          </div>

          <div className="h-1 bg-[#F5EFE2] rounded overflow-hidden">
            <div className="h-full bg-[#2D5A27] transition-all duration-300" style={{ width: `${quizStep * 20}%` }} />
          </div>

          {/* Step 1: Age */}
          {quizStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[#2B2B2B] text-center">Select your age group:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { value: 'youth', label: '18 - 35 years', sub: 'Active cellular growth' },
                  { value: 'adult', label: '36 - 55 years', sub: 'Metabolism maintenance' },
                  { value: 'senior', label: '56+ years', sub: 'Tissue restoration (Rasayana)' }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => { setQuizAge(item.value); setQuizStep(2); }}
                    className={`p-4 rounded-xl border text-center transition-all ${quizAge === item.value ? 'bg-[#2D5A27] border-[#2D5A27] text-white shadow-md' : 'bg-[#FAF8F2] border-[#F5EFE2] text-[#2B2B2B] hover:border-[#2D5A27]/30'}`}
                  >
                    <span className="block text-xs font-bold">{item.label}</span>
                    <span className="block text-[10px] opacity-70 mt-1 font-light">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Lifestyle */}
          {quizStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[#2B2B2B] text-center">Describe your active daily lifestyle:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: 'sedentary', label: 'Desk Job / Sedentary', sub: 'Prone to Kapha stiffness' },
                  { value: 'active', label: 'High Physical / Athlete', sub: 'Prone to Vata joint dry-out' },
                  { value: 'stressful', label: 'High Mental / Stressful', sub: 'Prone to Pitta hyperacidity' },
                  { value: 'spiritual', label: 'Meditation / Spiritual', sub: 'Calm and steady' }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => { setQuizLifestyle(item.value); setQuizStep(3); }}
                    className={`p-4 rounded-xl border text-left transition-all ${quizLifestyle === item.value ? 'bg-[#2D5A27] border-[#2D5A27] text-white' : 'bg-[#FAF8F2] border-[#F5EFE2] text-[#2B2B2B] hover:border-[#2D5A27]/30'}`}
                  >
                    <span className="block text-xs font-bold">{item.label}</span>
                    <span className="block text-[10px] opacity-70 mt-0.5 font-light">{item.sub}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setQuizStep(1)} className="text-xs text-[#2B2B2B]/60 hover:underline">Go Back</button>
            </div>
          )}

          {/* Step 3: Goal */}
          {quizStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[#2B2B2B] text-center">What is your primary wellness goal?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: 'immunity', label: 'Better Immunity', sub: 'Build defense power (Ojas)' },
                  { value: 'stress relief', label: 'Stress Relief & Sleep', sub: 'Calm hyperactive nervous system' },
                  { value: 'digestion', label: 'Better Digestion', sub: 'Boost metabolic fire (Agni)' },
                  { value: 'skincare', label: 'Natural Glow & Skincare', sub: 'Purify lymphatic blood stream' },
                  { value: 'spiritual energy', label: 'Spiritual Energy', sub: 'Aromas & tools for puja dhyana' }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => { setQuizGoal(item.value); setQuizStep(4); }}
                    className={`p-4 rounded-xl border text-left transition-all ${quizGoal === item.value ? 'bg-[#2D5A27] border-[#2D5A27] text-white' : 'bg-[#FAF8F2] border-[#F5EFE2] text-[#2B2B2B] hover:border-[#2D5A27]/30'}`}
                  >
                    <span className="block text-xs font-bold">{item.label}</span>
                    <span className="block text-[10px] opacity-70 mt-0.5 font-light">{item.sub}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setQuizStep(2)} className="text-xs text-[#2B2B2B]/60 hover:underline">Go Back</button>
            </div>
          )}

          {/* Step 4: Health Concerns */}
          {quizStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-[#2B2B2B] text-center">Select secondary areas of concern (Optional):</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Fatigue', 'Joint Pain', 'Acne', 'Anxiety', 'Indigestion', 'Insomnia'].map((item) => {
                  const isSel = quizInterests.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => {
                        setQuizInterests(prev => isSel ? prev.filter(x => x !== item) : [...prev, item]);
                      }}
                      className={`p-3 rounded-lg border text-xs font-semibold text-center transition-all ${isSel ? 'bg-[#C9A227] border-[#C9A227] text-white' : 'bg-[#FAF8F2] border-[#F5EFE2] text-[#2B2B2B]'}`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              <div className="pt-4 flex justify-between">
                <button onClick={() => setQuizStep(3)} className="text-xs text-[#2B2B2B]/60 hover:underline">Go Back</button>
                <button
                  onClick={handleQuizSubmit}
                  className="px-6 py-2.5 bg-[#2D5A27] text-white text-xs font-bold uppercase rounded-full hover:bg-[#2D5A27]/95"
                >
                  Generate Recommendation
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Results */}
          {quizStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              {quizLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-sm text-[#2B2B2B]/60">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#2D5A27]" />
                  <span>AI is comparing properties...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Explanation card */}
                  <div className="bg-[#F5EFE2] p-5 rounded-2xl border border-[#ded8c9] space-y-2">
                    <h4 className="text-sm font-bold text-[#2D5A27] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-[#C9A227]" />
                      Vedic Rationale
                    </h4>
                    <p className="text-xs text-[#2B2B2B] leading-relaxed font-light">{quizExplanation}</p>
                  </div>

                  <h3 className="text-sm font-bold text-[#2B2B2B]">Recommended Ayurvedic Products:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quizResults.map((product) => {
                      const activePrice = product.salePrice ? product.salePrice : product.price;
                      return (
                        <div key={product.id} className="bg-white rounded-xl border border-[#F5EFE2] p-3 flex gap-3 shadow-sm justify-between">
                          <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-[#FAF8F2] flex-shrink-0" />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-[#2B2B2B] line-clamp-1">{product.name}</h4>
                              <span className="text-[10px] text-[#2D5A27]">{product.category}</span>
                            </div>
                            <span className="text-xs font-bold text-[#2D5A27] mt-1">₹{activePrice}</span>
                          </div>
                          <button
                            onClick={() => { addToCart(product, 1); alert(`${product.name} added to cart!`); }}
                            className="self-center p-2 rounded-full bg-[#FAF8F2] hover:bg-[#2D5A27] hover:text-white transition-colors text-[#2D5A27] border border-[#e0dacd]"
                            aria-label="Add to cart"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button onClick={resetQuiz} className="text-xs text-[#2D5A27] font-semibold hover:underline">Retake Quiz</button>
                    <button onClick={() => setActiveMode('shop')} className="text-xs text-[#2B2B2B]/60 hover:underline">Return to Shop</button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* --- MODE 3: GIFT HAMPER CUSTOM BUILDER --- */}
      {activeMode === 'hamper' && (
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left panel: configure box & choose items */}
          <div className="flex-1 space-y-8">
            
            {/* Box Size */}
            <div className="bg-white rounded-2xl border border-[#F5EFE2] p-6 shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-[#2D5A27]">Step 1: Choose Gift Box Size</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'small', label: 'Small Vedic Box', desc: 'Fits up to 3 items', price: '₹150', discount: '5% off bundle' },
                  { id: 'medium', label: 'Medium Divine Box', desc: 'Fits up to 5 items', price: '₹250', discount: '10% off bundle' },
                  { id: 'large', label: 'Large Imperial Box', desc: 'Fits up to 8 items', price: '₹350', discount: '15% off bundle' }
                ].map((box) => (
                  <button
                    key={box.id}
                    onClick={() => {
                      setHamperBoxSize(box.id as any);
                      setHamperItems([]); // Reset items if size changes to prevent overflow
                    }}
                    className={`p-4 rounded-xl border text-center transition-all ${hamperBoxSize === box.id ? 'bg-[#2D5A27] border-[#2D5A27] text-white shadow-md' : 'bg-[#FAF8F2] border-[#F5EFE2] text-[#2B2B2B] hover:border-[#2D5A27]/30'}`}
                  >
                    <span className="block text-xs font-bold">{box.label}</span>
                    <span className="block text-[10px] opacity-75 mt-1">{box.desc}</span>
                    <span className="block text-xs font-bold text-[#C9A227] mt-2 group-hover:text-white">{box.price} &bull; {box.discount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Select items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#F5EFE2] pb-2">
                <h3 className="text-base font-serif font-bold text-[#2D5A27]">Step 2: Pick Products to Fill</h3>
                <span className="text-xs text-[#2B2B2B]/60 font-light">Maximum capacity: {getHamperLimit()} items</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.filter(p => p.category !== 'Gift Sets').map((product) => {
                  const isAdded = hamperItems.some((item) => item.id === product.id);
                  const price = product.salePrice || product.price;
                  return (
                    <div 
                      key={product.id} 
                      className={`p-3 rounded-xl border flex justify-between items-center transition-all ${isAdded ? 'bg-[#FAF8F2] border-[#2D5A27] shadow-sm' : 'bg-white border-[#F5EFE2]'}`}
                    >
                      <div className="flex gap-3 items-center min-w-0">
                        <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg bg-[#FAF8F2] flex-shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#2B2B2B] truncate">{product.name}</h4>
                          <span className="text-[10px] text-[#2B2B2B]/50 block">₹{price}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleHamperItem(product)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${isAdded ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#2D5A27] hover:bg-[#C9A227] text-white'}`}
                      >
                        {isAdded ? 'Remove' : 'Select'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right panel: Hamper checkout preview summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-[#F5EFE2] border border-[#e2dccf] rounded-3xl p-6 sticky top-24 space-y-6 shadow-md">
              <h3 className="text-sm font-bold text-[#2D5A27] uppercase tracking-wider border-b border-[#dad4c6] pb-3">Hamper Summary</h3>
              
              {hamperSuccess ? (
                <div className="space-y-4 text-center py-6 animate-fade-in">
                  <Box className="w-12 h-12 text-[#C9A227] mx-auto animate-bounce" />
                  <p className="text-xs font-semibold text-[#2D5A27]">Hamper added to your shopping cart successfully!</p>
                  <button 
                    onClick={() => setHamperSuccess(false)}
                    className="text-xs font-semibold text-[#2B2B2B]/60 underline hover:text-[#2D5A27]"
                  >
                    Build another hamper
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs font-light">
                  <div className="flex justify-between items-center text-[#2B2B2B]/75">
                    <span>Selected Box Size</span>
                    <span className="font-bold uppercase text-[#2B2B2B]">{hamperBoxSize}</span>
                  </div>
                  
                  {/* Selected Items List */}
                  <div className="space-y-2 border-y border-[#dcd6c8] py-3 max-h-40 overflow-y-auto">
                    {hamperItems.length === 0 ? (
                      <p className="text-[10px] italic text-[#2B2B2B]/40 text-center py-3">No products added yet.</p>
                    ) : (
                      hamperItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[#2B2B2B]/85">
                          <span className="truncate pr-4">{item.name}</span>
                          <span className="font-semibold flex-shrink-0">₹{item.salePrice || item.price}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Box Base Price</span>
                    <span>₹{getHamperBasePrice()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#2D5A27] font-semibold">
                    <span>Bundle discount ({(getHamperDiscount() * 100)}%)</span>
                    <span>-₹{Math.round((hamperItems.reduce((sum, item) => sum + (item.salePrice || item.price), 0) * getHamperDiscount()) * 100) / 100}</span>
                  </div>

                  {/* Custom Message Card */}
                  <div className="space-y-1 pt-2">
                    <label className="text-[10px] font-bold text-[#2B2B2B] block">Gift Card Message (Optional)</label>
                    <textarea
                      placeholder="Type blessings or greeting message..."
                      value={hamperGreeting}
                      onChange={(e) => setHamperGreeting(e.target.value)}
                      className="w-full bg-[#FAF8F2] text-[10px] px-3 py-2 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] h-16 text-[#2B2B2B]"
                    />
                  </div>

                  <div className="border-t border-[#dcd6c8] pt-3 flex justify-between items-center text-sm font-bold text-[#2D5A27]">
                    <span>Total Bundle Price</span>
                    <span>₹{calculateHamperTotal()}</span>
                  </div>

                  <button
                    onClick={addHamperToCart}
                    className="w-full bg-[#2D5A27] hover:bg-[#C9A227] text-white py-3 rounded-full font-bold uppercase tracking-wider text-[10px] shadow-md transition-colors"
                  >
                    Add Gift Bundle to Cart
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* --- QUICK VIEW PRODUCT MODAL --- */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-[#2B2B2B]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F2] rounded-3xl border border-[#F5EFE2] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-6 sm:p-8 animate-slide-up">
            
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-6 right-6 p-1 rounded-full hover:bg-[#F5EFE2] text-[#2B2B2B]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <img 
                src={quickViewProduct.images[0]} 
                alt={quickViewProduct.name} 
                className="w-full md:w-56 h-56 object-cover rounded-2xl bg-white border border-[#F5EFE2] flex-shrink-0"
              />
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#2D5A27] font-bold uppercase tracking-widest">{quickViewProduct.category}</span>
                  <h2 className="text-xl font-serif font-bold text-[#2B2B2B]">{quickViewProduct.name}</h2>
                  <div className="flex items-center gap-1 text-[#C9A227]">
                    <Star className="w-4 h-4 fill-[#C9A227]" />
                    <span className="text-xs font-semibold text-[#2B2B2B]">{quickViewProduct.ratings}</span>
                  </div>
                </div>

                <p className="text-xs text-[#2B2B2B]/75 leading-relaxed font-light">{quickViewProduct.description}</p>

                {quickViewProduct.ayurvedicProperties && (
                  <div className="text-[10px] bg-[#F5EFE2] border border-[#ded8c9] rounded-lg p-3 text-[#2D5A27] font-medium leading-relaxed">
                    <strong>Ayurvedic Properties:</strong> {quickViewProduct.ayurvedicProperties}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-[#F5EFE2]">
                  <span className="text-lg font-bold text-[#2D5A27]">₹{quickViewProduct.salePrice || quickViewProduct.price}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { addToCart(quickViewProduct, 1); setQuickViewProduct(null); }}
                      className="px-6 py-2.5 bg-[#2D5A27] hover:bg-[#C9A227] text-white text-xs font-bold uppercase rounded-full shadow-md transition-colors"
                    >
                      Add To Cart
                    </button>
                    <Link
                      href={`/shop/${quickViewProduct.slug}`}
                      className="px-4 py-2.5 bg-transparent border border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27]/5 text-xs font-semibold rounded-full"
                    >
                      Full Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
