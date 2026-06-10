'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, Sparkles, Calendar, User, ArrowRight, RefreshCw } from 'lucide-react';

const FALLBACK_POSTS = [
  {
    id: 'post1',
    title: 'The Three Doshas: Understanding Your Ayurvedic Body Type',
    slug: 'the-three-doshas-understanding-your-ayurvedic-body-type',
    content: 'Ayurveda, the ancient Indian science of life, states that our bodies are governed by three vital energies...',
    category: 'Ayurveda',
    author: 'DVYUG Acharya',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600',
    createdAt: '2026-06-08T12:00:00.000Z'
  },
  {
    id: 'post2',
    title: 'Integrating Yoga and Ayurveda for Daily Spiritual Vitality',
    slug: 'integrating-yoga-and-ayurveda-for-daily-spiritual-vitality',
    content: 'Yoga and Ayurveda are sister sciences that originated from the Vedic tradition thousands of years ago...',
    category: 'Yoga',
    author: 'DVYUG Acharya',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600',
    createdAt: '2026-06-07T12:00:00.000Z'
  },
  {
    id: 'post3',
    title: 'Why A2 Bilona Ghee is Considered Elixir in Vedic Texts',
    slug: 'why-a2-bilona-ghee-is-considered-elixir-in-vedic-texts',
    content: 'In Charaka Samhita and other classical Vedic texts, Ghee (specifically Indian breed Gir cow milk fat) is described...',
    category: 'Organic Living',
    author: 'DVYUG Acharya',
    image: 'https://images.unsplash.com/photo-1589733901241-5e3a676a04a3?q=80&w=600',
    createdAt: '2026-06-06T12:00:00.000Z'
  }
];

const BLOG_CATEGORIES = [
  'Ayurveda',
  'Organic Living',
  'Spirituality',
  'Yoga',
  'Herbal Remedies'
];

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await api.blogs.getAll();
      if (data.success) {
        setPosts(data.posts || []);
      } else {
        setPosts(FALLBACK_POSTS);
      }
    } catch (err) {
      setPosts(FALLBACK_POSTS);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadBlogs();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || 
                          post.content.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] font-bold text-[#C9A227] tracking-widest uppercase flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          The DVYUG Journal
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D5A27]">Vedic Wellness Lore</h1>
        <div className="h-0.5 w-16 bg-[#C9A227] mx-auto" />
        <p className="text-xs text-[#2B2B2B]/60 font-light leading-relaxed">
          Deepen your understanding of traditional Indian medicine, yoga practices, and sustainable living guidelines.
        </p>
      </div>

      {/* Filters & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F5EFE2] pb-6">
        
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${!selectedCategory ? 'bg-[#2D5A27] text-white' : 'bg-[#F5EFE2] text-[#2B2B2B]'}`}
          >
            All Lore
          </button>
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-[#2D5A27] text-white' : 'bg-[#F5EFE2] text-[#2B2B2B]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-full border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] pl-8 text-[#2B2B2B]"
          />
          <Search className="w-4 h-4 text-[#2B2B2B]/40 absolute left-2.5 top-3" />
        </div>

      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xs text-[#2B2B2B]/50 italic">No articles found matching filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article 
              key={post.id} 
              className="bg-white rounded-3xl overflow-hidden border border-[#F5EFE2] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url('${post.image}')` }}
                />
                <div className="p-6 space-y-3">
                  <span className="text-[10px] text-[#C9A227] font-bold uppercase tracking-wider block">{post.category}</span>
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-lg font-serif font-bold text-[#2b2b2b] hover:text-[#2D5A27] line-clamp-2 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-xs text-[#2B2B2B]/75 leading-relaxed font-light line-clamp-3">
                    {post.content}
                  </p>
                </div>
              </div>

              {/* Bottom footer */}
              <div className="p-6 pt-0 border-t border-[#FAF8F2] flex items-center justify-between text-[10px] text-[#2B2B2B]/60 font-light mt-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <Link 
                  href={`/blog/${post.slug}`} 
                  className="text-[#2D5A27] font-bold hover:text-[#C9A227] flex items-center gap-0.5"
                >
                  Read Article
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

    </div>
  );
}
