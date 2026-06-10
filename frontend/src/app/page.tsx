'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api';
import { Leaf, ShieldCheck, Sparkles, Award, Heart, HelpCircle, ArrowRight, Star, ShoppingCart, RefreshCw, MessageSquare } from 'lucide-react';

// Static mock fallback data matching database seed for out-of-the-box operation
const FALLBACK_PRODUCTS = [
  {
    id: 'prod-ashwa',
    name: 'Organic Ashwagandha Capsules',
    slug: 'organic-ashwagandha-capsules',
    description: 'Premium organic Ashwagandha root extract capsules to reduce stress, improve vitality, and boost cognitive function.',
    price: 499.0,
    salePrice: 449.0,
    ratings: 4.8,
    images: ['https://images.unsplash.com/photo-1611070973770-b1a672610041?q=80&w=600'],
    category: 'Herbal Products',
    isBestSeller: true,
    isFeatured: true
  },
  {
    id: 'prod-ghee',
    name: 'Vedic A2 Gir Cow Bilona Ghee',
    slug: 'vedic-a2-gir-cow-bilona-ghee',
    description: 'Authentic A2 Ghee made using the traditional Bilona method.',
    price: 1499.0,
    salePrice: 1399.0,
    ratings: 4.9,
    images: ['https://images.unsplash.com/photo-1589733901241-5e3a676a04a3?q=80&w=600'],
    category: 'Organic Food',
    isBestSeller: true,
    isFeatured: true
  },
  {
    id: 'prod-chandan',
    name: 'Sandalwood Incense Sticks',
    slug: 'sandalwood-chandan-incense-sticks',
    description: 'Hand-rolled, chemical-free incense sticks crafted with natural sandalwood powder.',
    price: 250.0,
    salePrice: 220.0,
    ratings: 4.7,
    images: ['https://images.unsplash.com/photo-1602847213180-50e43a80cef6?q=80&w=600'],
    category: 'Spiritual Essentials',
    isBestSeller: false,
    isFeatured: true
  },
  {
    id: 'prod-oil',
    name: 'Kumkumadi Radiance Face Oil',
    slug: 'kumkumadi-radiance-face-oil',
    description: 'A miraculous Ayurvedic formulation of 26 precious herbs, saffron, and goat milk.',
    price: 1899.0,
    salePrice: 1699.0,
    ratings: 4.9,
    images: ['https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600'],
    category: 'Personal Care',
    isBestSeller: true,
    isFeatured: true
  }
];

const FALLBACK_BLOGS = [
  {
    title: 'The Three Doshas: Understanding Your Ayurvedic Body Type',
    slug: 'the-three-doshas-understanding-your-ayurvedic-body-type',
    category: 'Ayurveda',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600',
    date: 'June 08, 2026'
  },
  {
    title: 'Integrating Yoga and Ayurveda for Daily Spiritual Vitality',
    slug: 'integrating-yoga-and-ayurveda-for-daily-spiritual-vitality',
    category: 'Yoga',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600',
    date: 'June 07, 2026'
  }
];

const CATEGORIES = [
  { name: 'Herbal Products', desc: 'Ancient remedies & adaptogenic extracts', count: '12 Items', img: 'https://images.unsplash.com/photo-1611070973770-b1a672610041?q=80&w=400', link: '/shop?category=Herbal+Products' },
  { name: 'Organic Food', desc: 'Raw honeys, Bilona A2 ghee & herbal infusions', count: '18 Items', img: 'https://images.unsplash.com/photo-1589733901241-5e3a676a04a3?q=80&w=400', link: '/shop?category=Organic+Food' },
  { name: 'Spiritual Essentials', desc: 'Mysore sandalwood powders & handrolled incense', count: '8 Items', img: 'https://images.unsplash.com/photo-1602847213180-50e43a80cef6?q=80&w=400', link: '/shop?category=Spiritual+Essentials' },
  { name: 'Personal Care', desc: 'Kesar oils, neem soaps & therapeutic gels', count: '14 Items', img: 'https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=400', link: '/shop?category=Personal+Care' },
  { name: 'Puja Essentials', desc: 'Bhimseni camphor & sacred copper diya sets', count: '6 Items', img: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=400', link: '/shop?category=Puja+Essentials' },
  { name: 'Gift Sets', desc: 'Vedic wellness bundles & custom festive boxes', count: '5 Items', img: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=400', link: '/shop?category=Gift+Sets' }
];

const VALUE_PROPS = [
  { title: '100% Organic', desc: 'Certified clean farming practices maintaining natural soil nutrients.', icon: Leaf },
  { title: 'Chemical Free', desc: 'Zero artificial preservatives, parabens, sulphates, or synthetic colors.', icon: ShieldCheck },
  { title: 'Authentic Vedic Products', desc: 'Formulated precisely according to Charaka and Sushruta Samhita guidelines.', icon: Sparkles },
  { title: 'Sustainable Packaging', desc: 'Plastic-free biodegradable wrapping protecting nature’s well-being.', icon: Award },
  { title: 'Cruelty Free', desc: 'Completely ethically sourced without testing on our animal companions.', icon: Heart },
  { title: 'Made in India', desc: 'Supporting local tribal herb collectors and Bilona cow gaushalas.', icon: HelpCircle }
];

export default function HomePage() {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>(FALLBACK_BLOGS);
  const [apiLoading, setApiLoading] = useState(true);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const res = await api.products.getFeatured();
        if (res.success) {
          setFeaturedProducts(res.featured || []);
          setBestSellers(res.bestSellers || []);
        } else {
          setFeaturedProducts(FALLBACK_PRODUCTS);
          setBestSellers(FALLBACK_PRODUCTS.filter(p => p.isBestSeller));
        }
      } catch (err) {
        console.warn('API connection failed. Reverting to premium local fallback data.');
        setFeaturedProducts(FALLBACK_PRODUCTS);
        setBestSellers(FALLBACK_PRODUCTS.filter(p => p.isBestSeller));
      } finally {
        setApiLoading(false);
      }
    };
    fetchHomepageData();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. Hero Banner Section */}
      <section className="relative min-h-[85vh] flex items-center bg-[#F5EFE2] overflow-hidden">
        {/* Background Image Overlay with Soft Vedic Blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 transform scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1602847213180-50e43a80cef6?q=80&w=1600')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F2] via-[#FAF8F2]/95 to-transparent z-0" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-16">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-[#2D5A27] bg-[#2D5A27]/10 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              Divine Vedic Formulations
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif font-bold text-[#2D5A27] leading-tight">
              Rooted in Tradition, <br />
              <span className="text-[#C9A227] italic">Crafted</span> for Well-Being
            </h1>
            <p className="text-base sm:text-lg text-[#2B2B2B]/90 font-light leading-relaxed">
              Discover organic, herbal, and spiritual essentials handpicked and prepared according to ancient Vedic wisdom. Restore balance to your mind, body, and soul.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link 
                href="/shop" 
                className="px-8 py-3.5 bg-[#2D5A27] hover:bg-[#2D5A27]/95 text-white font-semibold text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                Shop Our Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/about" 
                className="px-8 py-3.5 bg-transparent border border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27]/5 font-semibold text-sm rounded-full transition-all duration-300"
              >
                Explore Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2D5A27]">Sacred Collections</h2>
          <div className="h-0.5 w-16 bg-[#C9A227] mx-auto" />
          <p className="text-sm text-[#2B2B2B]/70 font-light">
            Browse our carefully curated categories structured to support physical health and spiritual grounding.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {CATEGORIES.map((cat, i) => (
            <Link 
              key={i} 
              href={cat.link}
              className="group relative h-72 rounded-2xl overflow-hidden shadow-md border border-[#F5EFE2] hover:shadow-xl transition-all duration-300"
            >
              {/* Image with hover zoom */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url('${cat.img}')` }}
              />
              {/* Overlay shading */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2B2B2B]/90 via-[#2B2B2B]/40 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
              
              {/* Details card details */}
              <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end text-white space-y-1">
                <span className="text-[10px] text-[#C9A227] font-semibold tracking-widest uppercase">{cat.count}</span>
                <h3 className="text-xl font-serif font-bold group-hover:text-[#FAF8F2] transition-colors">{cat.name}</h3>
                <p className="text-xs text-white/70 font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-h-0 group-hover:max-h-12 overflow-hidden leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#F5EFE2] pb-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-[#2D5A27]">Divine Best Sellers</h2>
            <p className="text-sm text-[#2B2B2B]/70 font-light">Efficacious formulations favored by our community of wellness practitioners.</p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-[#2D5A27] hover:text-[#C9A227] flex items-center gap-1 mt-2 sm:mt-0">
            View All Products
            <ArrowRight className="w-4.5 h-4.5" />
          </Link>
        </div>

        {apiLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-sm text-[#2B2B2B]/60">
            <RefreshCw className="w-8 h-8 animate-spin text-[#2D5A27]" />
            <span>Consulting current inventory...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 4).map((product) => {
              const activePrice = product.salePrice ? product.salePrice : product.price;
              const hasDiscount = !!product.salePrice;
              return (
                <div key={product.id} className="group flex flex-col justify-between bg-white rounded-2xl border border-[#F5EFE2] p-4 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="space-y-3">
                    {/* Image frame */}
                    <div className="relative h-48 w-full bg-[#FAF8F2] rounded-xl overflow-hidden flex items-center justify-center">
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="object-cover h-full w-full transition-transform duration-500 group-hover:scale-105" 
                      />
                      {product.isBestSeller && (
                        <span className="absolute top-2 left-2 bg-[#C9A227] text-white text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase">
                          Bestseller
                        </span>
                      )}
                    </div>

                    {/* Meta stats */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#2D5A27] font-semibold uppercase tracking-wider">{product.category}</span>
                      <Link href={`/shop/${product.slug}`}>
                        <h3 className="text-base font-serif font-semibold text-[#2B2B2B] hover:text-[#2D5A27] line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 text-[#C9A227]">
                        <Star className="w-3.5 h-3.5 fill-[#C9A227]" />
                        <span className="text-xs font-semibold text-[#2B2B2B]">{product.ratings}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & pricing */}
                  <div className="pt-4 border-t border-[#F5EFE2] flex items-center justify-between mt-4">
                    <div className="flex flex-col">
                      {hasDiscount && (
                        <span className="text-xs text-[#2B2B2B]/40 line-through">₹{product.price}</span>
                      )}
                      <span className="text-base font-bold text-[#2D5A27]">₹{activePrice}</span>
                    </div>
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="p-2.5 rounded-full bg-[#2D5A27] text-white hover:bg-[#C9A227] transition-colors shadow-sm"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Why Choose DVYUG Section */}
      <section className="bg-[#FAF8F2] border-y border-[#F5EFE2] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold text-[#2D5A27]">Our Vedic Promise</h2>
            <div className="h-0.5 w-16 bg-[#C9A227] mx-auto" />
            <p className="text-sm text-[#2B2B2B]/70 font-light">
              We believe in universal goodness (Loka Samasta) through pure actions and products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {VALUE_PROPS.map((prop, i) => {
              const IconComp = prop.icon;
              return (
                <div key={i} className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm border border-[#F5EFE2]">
                  <div className="flex-shrink-0 p-3 bg-[#FAF8F2] rounded-xl border border-[#F5EFE2] h-12 w-12 flex items-center justify-center text-[#C9A227]">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-serif font-bold text-[#2D5A27]">{prop.title}</h3>
                    <p className="text-xs text-[#2B2B2B]/85 leading-relaxed font-light">{prop.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Custom Hamper Teaser / Advanced Feature Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#2D5A27] rounded-3xl overflow-hidden shadow-xl flex flex-col lg:flex-row items-center justify-between text-white">
          <div className="p-8 sm:p-12 lg:max-w-xl space-y-6">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#C9A227]">Premium Gifting</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#FAF8F2]">Build A Custom Vedic Gift Hamper</h2>
            <p className="text-sm text-[#F5EFE2]/85 leading-relaxed font-light">
              Send blessings of good health. Select our premium handcarved boxes, select customized organic teas, essential oil soaps, pure ghee, and custom greeting cards. Gets automatically discounted based on items chosen!
            </p>
            <div>
              <Link 
                href="/shop?hamper=true" 
                className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#C9A227] hover:bg-[#C9A227]/90 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-colors"
              >
                Configure Custom Hamper
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div 
            className="w-full lg:w-[45%] h-80 lg:h-auto self-stretch bg-cover bg-center min-h-[320px]"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=800')" }}
          />
        </div>
      </section>

      {/* 6. Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-[#2D5A27]">Voice of Practitioners</h2>
          <div className="h-0.5 w-16 bg-[#C9A227] mx-auto" />
          <p className="text-sm text-[#2B2B2B]/70 font-light">Hear what members of our holistic community say about their health transformations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {[
            { name: 'Dr. Anjali Kapoor', role: 'Ayurvedic Consultant', text: 'I routinely suggest DVYUG Gir Cow Ghee to patients needing digestive strengthening. The bilona granularity is exactly what is written in standard shastras.', rating: 5 },
            { name: 'Sameer Mehta', role: 'Yoga Instructor', text: 'The Bhimseni Kapur and Mysore sandalwood incense make a holy difference during my morning dhyana yoga sessions. The aroma is chemical-free and extremely light.', rating: 5 },
            { name: 'Priya Nair', role: 'Vedic Practitioner', text: 'Kumkumadi oil has noticeably reduced skin pigmentation from heat. I love that they credit loyalty points back that I can spend on monthly subscriptions.', rating: 5 }
          ].map((t, i) => (
            <div key={i} className="bg-[#F5EFE2] rounded-2xl p-6 border border-[#e5dfd2]/80 space-y-4 flex flex-col justify-between">
              <p className="text-xs text-[#2B2B2B] leading-relaxed italic font-light">"{t.text}"</p>
              <div className="space-y-1 border-t border-[#d5cebf] pt-3 flex justify-between items-end">
                <div>
                  <h4 className="text-sm font-bold text-[#2D5A27]">{t.name}</h4>
                  <span className="text-[10px] text-[#2B2B2B]/60 font-light">{t.role}</span>
                </div>
                <div className="flex gap-0.5 text-[#C9A227]">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} className="w-3 h-3 fill-[#C9A227]" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Blog Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#F5EFE2] pb-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-[#2D5A27]">Sacred Lore (Blog)</h2>
            <p className="text-sm text-[#2B2B2B]/70 font-light">Explore articles covering Ayurveda basics, Yoga routines, and organic living.</p>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-[#2D5A27] hover:text-[#C9A227] flex items-center gap-1 mt-2 sm:mt-0">
            Read Our Journal
            <ArrowRight className="w-4.5 h-4.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.slice(0, 2).map((post, idx) => (
            <div key={idx} className="group flex flex-col sm:flex-row gap-6 bg-white rounded-2xl overflow-hidden border border-[#F5EFE2] p-4 shadow-sm hover:shadow-md transition-shadow">
              <div 
                className="w-full sm:w-44 h-44 flex-shrink-0 bg-cover bg-center rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                style={{ backgroundImage: `url('${post.image}')` }}
              />
              <div className="flex flex-col justify-between py-1 space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#C9A227] font-bold uppercase tracking-widest">{post.category}</span>
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-base font-serif font-semibold text-[#2B2B2B] hover:text-[#2D5A27] line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#2B2B2B]/60 font-light pt-2">
                  <span>{post.date}</span>
                  <Link href={`/blog/${post.slug}`} className="text-[#2D5A27] font-semibold hover:text-[#C9A227] flex items-center gap-0.5">
                    Read Article
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
