'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Star, ShoppingCart, Heart, RefreshCw, CheckCircle, Leaf, MessageSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Local mock products database for offline support
const SEED_PRODUCTS: Record<string, any> = {
  'organic-ashwagandha-capsules': {
    id: '1',
    name: 'Organic Ashwagandha Capsules',
    slug: 'organic-ashwagandha-capsules',
    description: 'Premium organic Ashwagandha (Withania somnifera) root extract capsules to reduce stress, improve vitality, and boost cognitive function. Known as the king of Ayurvedic herbs.',
    price: 499.0,
    salePrice: 449.0,
    stock: 50,
    category: 'Herbal Products',
    ratings: 4.8,
    images: [
      'https://images.unsplash.com/photo-1611070973770-b1a672610041?q=80&w=600',
      'https://images.unsplash.com/photo-1607619056574-7b8d304a3734?q=80&w=600'
    ],
    ingredients: ['Organic Ashwagandha Root Extract (500mg)', 'Vegetarian Capsule Shell'],
    benefits: ['Reduces cortisol and anxiety levels', 'Improves muscle strength and recovery', 'Enhances mental focus and memory booster'],
    usageInstructions: 'Take 1-2 capsules daily with warm milk or water, preferably after meals, or as directed by a healthcare practitioner.',
    ayurvedicProperties: 'Doshas: Balances Vata and Kapha, can slightly increase Pitta in excess. Rasa: Tikta (Bitter), Katu (Pungent), Madhura (Sweet).'
  },
  'vedic-a2-gir-cow-bilona-ghee': {
    id: '2',
    name: 'Vedic A2 Gir Cow Bilona Ghee',
    slug: 'vedic-a2-gir-cow-bilona-ghee',
    description: 'Authentic A2 Ghee made using the traditional Bilona method (churning curd made from Gir Cow A2 milk). Handcrafted in clay pots, rich in nutrients, granular, and aromatic.',
    price: 1499.0,
    salePrice: 1399.0,
    stock: 25,
    category: 'Organic Food',
    ratings: 4.9,
    images: [
      'https://images.unsplash.com/photo-1589733901241-5e3a676a04a3?q=80&w=600',
      'https://images.unsplash.com/photo-1589733901741-2a13cc7e7c9f?q=80&w=600'
    ],
    ingredients: ['100% Pure Gir Cow A2 Milk Fat'],
    benefits: ['Improves digestion and gut health', 'Lubricates joints and improves skin glow', 'High smoke point, ideal for cooking and spiritual rituals'],
    usageInstructions: 'Consume 1-2 teaspoons daily on empty stomach, add to chapatis, or use in cooking.',
    ayurvedicProperties: 'Doshas: Pacifies Vata and Pitta. Promotes Ojas (vital energy). Agni (digestive fire) booster.'
  },
  'sandalwood-chandan-incense-sticks': {
    id: '3',
    name: 'Sandalwood (Chandan) Incense Sticks',
    slug: 'sandalwood-chandan-incense-sticks',
    description: 'Hand-rolled, chemical-free incense sticks crafted with natural sandalwood powder and essential oils. Perfect for meditation, puja, and creating a serene spiritual ambiance.',
    price: 250.0,
    salePrice: 220.0,
    stock: 100,
    category: 'Spiritual Essentials',
    ratings: 4.7,
    images: [
      'https://images.unsplash.com/photo-1602847213180-50e43a80cef6?q=80&w=600'
    ],
    ingredients: ['Pure Mysore Sandalwood Powder', 'Natural Charcoal-free Wood Powder', 'Essential Oils'],
    benefits: ['Purifies the atmosphere', 'Calms the mind for meditation and prayer', 'Long-lasting natural woody aroma'],
    usageInstructions: 'Light the tip of the incense stick, allow it to catch fire, then gently blow out the flame.',
    ayurvedicProperties: 'Rasa: Cools Pitta energy, calms emotional turbulence, opens the heart and crown chakras.'
  },
  'kumkumadi-radiance-face-oil': {
    id: '4',
    name: 'Kumkumadi Radiance Face Oil',
    slug: 'kumkumadi-radiance-face-oil',
    description: 'A miraculous Ayurvedic formulation of 26 precious herbs, saffron, and goat milk, designed to brighten skin, reduce dark circles, and prevent fine lines.',
    price: 1899.0,
    salePrice: 1699.0,
    stock: 30,
    category: 'Personal Care',
    ratings: 4.9,
    images: [
      'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600'
    ],
    ingredients: ['Kesar (Saffron)', 'Chandan (Sandalwood)', 'Manjistha', 'Yashtimadhu', 'Pure Sesame Oil', 'Goat Milk'],
    benefits: ['Illuminates skin complexion', 'Fades pigmentation and dark spots', 'Hydrates and rejuvenates skin overnight'],
    usageInstructions: 'Cleanse face, apply 3-4 drops of oil onto face and neck, gently massage in upward strokes. Leave overnight.',
    ayurvedicProperties: 'Varnya (Skin tone improver). Balances Pitta and Vata on the skin surface.'
  }
};

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  
  const slug = params.slug as string;

  // States
  const [product, setProduct] = useState<any | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  
  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const loadProductData = async () => {
    setLoading(true);
    try {
      const res = await api.products.getBySlug(slug);
      if (res.success && res.product) {
        setProduct(res.product);
        setRelatedProducts(res.related || []);
        setSelectedImage(res.product.images[0]);
      } else {
        fallbackToSeed();
      }
    } catch (err) {
      console.warn('API connection failed. Loading local database copy.');
      fallbackToSeed();
    } finally {
      setLoading(false);
    }
  };

  const fallbackToSeed = () => {
    const seed = SEED_PRODUCTS[slug];
    if (seed) {
      setProduct(seed);
      setSelectedImage(seed.images[0]);
      
      // Pull some related items
      const related = Object.values(SEED_PRODUCTS)
        .filter((p: any) => p.slug !== slug && p.category === seed.category)
        .slice(0, 3);
      setRelatedProducts(related);
    } else {
      // General fallback to first seed item
      const first = Object.values(SEED_PRODUCTS)[0];
      setProduct(first);
      setSelectedImage(first.images[0]);
    }
  };

  useEffect(() => {
    if (slug) {
      loadProductData();
    }
  }, [slug]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to write a product review!');
      return;
    }
    if (!comment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.products.submitReview({
        productId: product.id,
        rating,
        comment
      });
      if (res.success) {
        setReviewSuccess(true);
        setComment('');
        await loadProductData(); // reload details to see new review
      }
    } catch (err: any) {
      // Mock review insertion on client if API fails
      const mockReview = {
        id: `mock_rev_${Date.now()}`,
        rating,
        comment,
        createdAt: new Date().toISOString(),
        user: { name: user.name }
      };
      setProduct((prev: any) => ({
        ...prev,
        reviews: [mockReview, ...(prev.reviews || [])]
      }));
      setReviewSuccess(true);
      setComment('');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3 text-sm text-[#2B2B2B]/60 font-sans">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2D5A27]" />
        <span>Reading botanical properties...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center font-sans space-y-4">
        <h2 className="text-xl font-bold text-[#2D5A27]">Product Not Found</h2>
        <Link href="/shop" className="text-xs font-semibold text-[#C9A227] underline">Return to Shop</Link>
      </div>
    );
  }

  const activePrice = product.salePrice ? product.salePrice : product.price;
  const hasDiscount = !!product.salePrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 font-sans">
      
      {/* 1. Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Side: Images selectors with zoom */}
        <div className="space-y-4">
          <div className="relative h-96 w-full bg-white rounded-3xl border border-[#F5EFE2] overflow-hidden flex items-center justify-center group shadow-sm">
            <img 
              src={selectedImage} 
              alt={product.name} 
              className="object-cover h-full w-full transition-transform duration-700 ease-out group-hover:scale-110 cursor-zoom-in"
            />
            {product.stock === 0 && (
              <span className="absolute inset-0 bg-[#2B2B2B]/50 flex items-center justify-center text-white font-bold text-sm tracking-wider uppercase">
                Out of Stock
              </span>
            )}
          </div>
          
          {/* Thumbnails list */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border flex-shrink-0 bg-white ${selectedImage === img ? 'border-[#2D5A27] ring-1 ring-[#2D5A27]' : 'border-[#F5EFE2]'}`}
                >
                  <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Description details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs text-[#2D5A27] font-semibold uppercase tracking-wider">{product.category}</span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D5A27]">{product.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex text-[#C9A227]">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(product.ratings) ? 'fill-[#C9A227]' : 'text-[#c3bdad]'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-[#2B2B2B]">{product.ratings} Ratings</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            {hasDiscount && (
              <span className="text-sm text-[#2B2B2B]/40 line-through">₹{product.price}</span>
            )}
            <span className="text-2xl font-bold text-[#2D5A27]">₹{activePrice}</span>
          </div>

          <p className="text-sm text-[#2B2B2B]/85 leading-relaxed font-light">{product.description}</p>

          {/* Key ingredients tag layout */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#2B2B2B] block uppercase tracking-wider">Key Ingredients</span>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ing: string, i: number) => (
                  <span key={i} className="text-xs bg-[#F5EFE2] text-[#2D5A27] border border-[#ded8c9] px-3.5 py-1.5 rounded-full font-medium flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 border-t border-[#F5EFE2] flex flex-wrap gap-4 items-center">
            <button
              onClick={() => addToCart(product, 1)}
              disabled={product.stock === 0}
              className="flex-1 min-w-[150px] py-4 bg-[#2D5A27] hover:bg-[#C9A227] text-white font-bold uppercase tracking-wider text-xs rounded-full shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-[#2D5A27]"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
            <button
              onClick={() => { addToCart(product, 1); router.push('/cart'); }}
              disabled={product.stock === 0}
              className="flex-1 min-w-[150px] py-4 bg-[#C9A227] hover:bg-[#C9A227]/90 text-white font-bold uppercase tracking-wider text-xs rounded-full shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Buy Now
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3.5 rounded-full border border-[#FAF8F2] shadow-sm transition-colors ${isInWishlist(product.id) ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white hover:bg-[#FAF8F2] text-[#2B2B2B]/60'}`}
              aria-label="Add to wishlist"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
          </div>

        </div>

      </div>

      {/* 2. Ayurvedic Specs Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-[#F5EFE2]">
        
        {product.ayurvedicProperties && (
          <div className="bg-[#F5EFE2] rounded-2xl p-6 border border-[#e2dccf] space-y-3 shadow-inner">
            <h3 className="text-sm font-bold text-[#2D5A27] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C9A227]" />
              Ayurvedic Properties
            </h3>
            <p className="text-xs text-[#2B2B2B]/90 font-light leading-relaxed whitespace-pre-line">{product.ayurvedicProperties}</p>
          </div>
        )}

        {product.benefits && product.benefits.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-[#F5EFE2] space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-[#2D5A27] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#C9A227]" />
              Wellness Benefits
            </h3>
            <ul className="space-y-2 text-xs font-light text-[#2B2B2B] list-disc list-inside">
              {product.benefits.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        )}

        {product.usageInstructions && (
          <div className="bg-white rounded-2xl p-6 border border-[#F5EFE2] space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-[#2D5A27] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#C9A227]" />
              Usage Instructions
            </h3>
            <p className="text-xs text-[#2B2B2B]/85 font-light leading-relaxed">{product.usageInstructions}</p>
          </div>
        )}

      </div>

      {/* 3. Review Submission & Reviews Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-10 border-t border-[#F5EFE2]">
        
        {/* Write a Review Form */}
        <div className="space-y-6">
          <h3 className="text-xl font-serif font-bold text-[#2D5A27]">Submit Your Review</h3>
          {user ? (
            reviewSuccess ? (
              <div className="bg-[#FAF8F2] border border-[#2D5A27]/30 rounded-2xl p-6 text-center text-xs text-[#2D5A27] font-semibold">
                Dhanyavaad! Your review has been recorded.
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 bg-[#F5EFE2]/50 p-6 rounded-2xl border border-[#FAF8F2]">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2B2B2B] block">Product Rating</label>
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                  >
                    <option value={5}>5 Stars - Divine</option>
                    <option value={4}>4 Stars - Great</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Poor</option>
                    <option value={1}>1 Star - Unsatisfactory</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2B2B2B] block">Write Comments</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Share your botanical experience with this item..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 bg-[#2D5A27] hover:bg-[#C9A227] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            )
          ) : (
            <div className="bg-[#FAF8F2] border border-[#e2dccf] rounded-2xl p-6 text-center space-y-3 shadow-inner">
              <p className="text-xs text-[#2B2B2B]/60 font-light">Please register or sign in to write reviews for our Vedic products.</p>
              <Link 
                href="/login" 
                className="inline-block px-5 py-2 bg-[#2D5A27] text-white text-xs font-bold rounded-full hover:bg-[#2D5A27]/90"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Reviews scrolling area */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-serif font-bold text-[#2D5A27]">Customer Reviews ({product.reviews?.length || 0})</h3>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {!product.reviews || product.reviews.length === 0 ? (
              <p className="text-xs text-[#2B2B2B]/50 italic font-light py-4">No reviews yet. Be the first to share your experience!</p>
            ) : (
              product.reviews.map((rev: any) => (
                <div key={rev.id} className="bg-white rounded-2xl p-4 border border-[#F5EFE2] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#2B2B2B]">{rev.user.name}</span>
                    <div className="flex text-[#C9A227]">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < rev.rating ? 'fill-[#C9A227]' : 'text-[#c3bdad]'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#2B2B2B]/80 font-light leading-relaxed">{rev.comment}</p>
                  <span className="text-[10px] text-[#2B2B2B]/40 font-light block">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 4. Related Products Feed */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-[#F5EFE2]">
          <h3 className="text-2xl font-serif font-bold text-[#2D5A27]">Related Sacred Items</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.slice(0, 3).map((item) => {
              const price = item.salePrice || item.price;
              return (
                <div key={item.id} className="group bg-white border border-[#F5EFE2] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="space-y-3">
                    <img src={item.images[0]} alt={item.name} className="w-full h-36 object-cover rounded-xl bg-[#FAF8F2]" />
                    <div>
                      <span className="text-[9px] uppercase text-[#2D5A27] font-semibold">{item.category}</span>
                      <Link href={`/shop/${item.slug}`}>
                        <h4 className="text-xs font-serif font-bold text-[#2B2B2B] hover:text-[#2D5A27] line-clamp-1">{item.name}</h4>
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#FAF8F2] pt-3 mt-3">
                    <span className="text-xs font-bold text-[#2D5A27]">₹{price}</span>
                    <button
                      onClick={() => addToCart(item, 1)}
                      className="p-1.5 rounded-full bg-[#FAF8F2] hover:bg-[#2D5A27] text-[#2D5A27] hover:text-white border border-[#ded8c9] transition-colors"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
