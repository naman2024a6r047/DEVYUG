'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sparkles, Calendar, User, ArrowLeft, RefreshCw, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

// Mock DB for offline fallback
const SEED_POSTS: Record<string, any> = {
  'the-three-doshas-understanding-your-ayurvedic-body-type': {
    title: 'The Three Doshas: Understanding Your Ayurvedic Body Type',
    category: 'Ayurveda',
    author: 'DVYUG Acharya',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800',
    createdAt: '2026-06-08T12:00:00.000Z',
    content: 'Ayurveda, the ancient Indian science of life, states that our bodies are governed by three vital energies or Doshas: Vata, Pitta, and Kapha. Vata is associated with air and space, representing movement and creativity. Pitta is linked to fire and water, governing digestion and intellect. Kapha is grounded in water and earth, bringing structure, stability, and immunity. \n\nIn this article, we explain how to identify your dominant dosha and how to balance it with organic foods and traditional herbs like Ashwagandha and Triphala. Consuming wholesome A2 cow ghee helps maintain digestion fire (Agni) and pacifies excessive Pitta or Vata. Balancing these elements reduces metabolic fatigue and promotes deep prana cellular restoration.',
    comments: [
      { id: '1', authorName: 'Dr. Ramesh Kumar', content: 'Very accurate explanation of Doshas. Using Gir cow ghee is indeed an excellent carrier for pacifying Vata.', createdAt: '2026-06-08T14:00:00Z' }
    ]
  },
  'integrating-yoga-and-ayurveda-for-daily-spiritual-vitality': {
    title: 'Integrating Yoga and Ayurveda for Daily Spiritual Vitality',
    category: 'Yoga',
    author: 'DVYUG Acharya',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800',
    createdAt: '2026-06-07T12:00:00.000Z',
    content: 'Yoga and Ayurveda are sister sciences that originated from the Vedic tradition thousands of years ago. While Yoga focuses on union with the divine, mental control, and spiritual liberation, Ayurveda focuses on physical health and body harmony. When practiced together, they create a complete blueprint for healthy living. \n\nStarting your morning with Sun Salutations (Surya Namaskar) followed by lighting pure Bhimseni Camphor or Sandalwood incense sets a pure, high-vibration atmosphere. Follow this with a warm cup of Tulsi herbal tea to ignite your metabolism and clear accumulated toxins.',
    comments: []
  },
  'why-a2-bilona-ghee-is-considered-elixir-in-vedic-texts': {
    title: 'Why A2 Bilona Ghee is Considered Elixir in Vedic Texts',
    category: 'Organic Living',
    author: 'DVYUG Acharya',
    image: 'https://images.unsplash.com/photo-1589733901241-5e3a676a04a3?q=80&w=800',
    createdAt: '2026-06-06T12:00:00.000Z',
    content: 'In Charaka Samhita and other classical Vedic texts, Ghee (specifically from Indian breed cows) is described as "Amrit" or nectar. However, modern commercial processes extract ghee using heat and centrifugal machines directly from cream. Vedic Bilona Ghee, on the other hand, is made by boiling milk, turning it to curd, and then churning it slowly with a wooden churner (Bilona). This process retains crucial fat-soluble vitamins (A, D, E, K), CLA (Conjugated Linoleic Acid), and butyric acid. Regular consumption enhances memory, improves skin elasticity, supports joint lubrication, and acts as an excellent carrier (Anupana) for consuming herbal powders.',
    comments: []
  }
};

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // States
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      try {
        const data = await api.blogs.getBySlug(slug);
        if (data.success && data.post) {
          setPost(data.post);
        } else {
          fallbackToSeed();
        }
      } catch (err) {
        fallbackToSeed();
      } finally {
        setLoading(false);
      }
    };

    const fallbackToSeed = () => {
      const seed = SEED_POSTS[slug];
      if (seed) {
        setPost(seed);
      } else {
        setPost(SEED_POSTS['the-three-doshas-understanding-your-ayurvedic-body-type']);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentContent.trim()) return;

    try {
      const data = await api.blogs.submitComment(slug, {
        authorName,
        content: commentContent
      });
      if (data.success && data.comment) {
        setPost((prev: any) => ({
          ...prev,
          comments: [data.comment, ...(prev.comments || [])]
        }));
      }
      setAuthorName('');
      setCommentContent('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (err) {
      // Mock local fallback
      const newComment = {
        id: `comm_${Date.now()}`,
        authorName,
        content: commentContent,
        createdAt: new Date().toISOString()
      };
      setPost((prev: any) => ({
        ...prev,
        comments: [newComment, ...(prev.comments || [])]
      }));
      setAuthorName('');
      setCommentContent('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3000);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3 text-sm text-[#2B2B2B]/60 font-sans">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2D5A27]" />
        <span>Reading Vedic leaves...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans space-y-4">
        <h2 className="text-xl font-bold text-[#2D5A27]">Article Not Found</h2>
        <Link href="/blog" className="text-xs font-semibold text-[#C9A227] underline">Return to Lore</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10 font-sans">
      
      {/* Return button */}
      <div>
        <Link href="/blog" className="text-xs font-semibold text-[#2D5A27] hover:text-[#C9A227] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Wellness Journal
        </Link>
      </div>

      {/* Main post layout */}
      <article className="space-y-6">
        <div className="space-y-2">
          <span className="text-xs text-[#C9A227] font-bold uppercase tracking-wider">{post.category}</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D5A27] leading-tight">
            {post.title}
          </h1>
          
          <div className="flex gap-4 text-[10px] text-[#2B2B2B]/50 font-light pt-2">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#C9A227]" />
              {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#C9A227]" />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Banner image */}
        <div className="h-80 sm:h-96 rounded-3xl overflow-hidden border border-[#F5EFE2] shadow-sm">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>

        {/* Text paragraph */}
        <div className="text-sm text-[#2B2B2B]/90 font-light leading-relaxed whitespace-pre-wrap pt-4">
          {post.content}
        </div>
      </article>

      {/* Comments section */}
      <div className="border-t border-[#F5EFE2] pt-10 space-y-8">
        <h3 className="text-xl font-serif font-bold text-[#2D5A27] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#C9A227]" />
          Comments ({post.comments?.length || 0})
        </h3>

        {/* Form */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-[#2B2B2B] uppercase">Share your reflection</h4>
          {commentSuccess && (
            <div className="bg-[#FAF8F2] border border-[#2D5A27]/30 text-[#2D5A27] text-xs rounded-xl p-3">
              Comment posted successfully!
            </div>
          )}
          <form onSubmit={handlePostComment} className="space-y-3 bg-[#F5EFE2]/30 p-5 rounded-2xl border border-[#F5EFE2]">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#2B2B2B] uppercase block">Your Name</label>
              <input
                type="text"
                required
                placeholder="Name..."
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-white text-xs px-3 py-2 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#2B2B2B] uppercase block">Comment</label>
              <textarea
                required
                rows={3}
                placeholder="Type your reflection..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="w-full bg-white text-xs px-3 py-2 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-[#2D5A27] hover:bg-[#C9A227] text-white text-xs font-bold uppercase rounded-full shadow-sm"
            >
              Post Comment
            </button>
          </form>
        </div>

        {/* List */}
        <div className="space-y-4">
          {!post.comments || post.comments.length === 0 ? (
            <p className="text-xs text-[#2B2B2B]/40 italic">No comments posted yet.</p>
          ) : (
            post.comments.map((comm: any) => (
              <div key={comm.id} className="bg-white rounded-2xl p-4 border border-[#F5EFE2] space-y-1">
                <div className="flex justify-between items-center text-[10px] text-[#2B2B2B]/60">
                  <span className="font-bold text-[#2B2B2B] text-xs">{comm.authorName}</span>
                  <span>{new Date(comm.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-[#2B2B2B]/85 font-light leading-relaxed pt-1">{comm.content}</p>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
