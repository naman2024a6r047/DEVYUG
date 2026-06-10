'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, BarChart3, Package, ShoppingBag, Users, BookOpen,
  RefreshCw, Plus, Edit2, Trash2, Check, X, Download, TrendingUp 
} from 'lucide-react';
import Link from 'next/link';

// Mock values for fallback local database operation
const MOCK_ANALYTICS = {
  summary: {
    totalRevenue: 4896.0,
    totalOrders: 3,
    totalUsers: 25,
    totalProducts: 8
  },
  salesTimeline: [
    { date: 'Jun 02', sales: 400 },
    { date: 'Jun 03', sales: 600 },
    { date: 'Jun 04', sales: 800 },
    { date: 'Jun 05', sales: 500 },
    { date: 'Jun 06', sales: 1200 },
    { date: 'Jun 07', sales: 900 },
    { date: 'Jun 08', sales: 1800 }
  ],
  productSales: [
    { name: 'Gir Cow Bilona Ghee', quantity: 2, revenue: 2798 },
    { name: 'Ashwagandha Capsules', quantity: 3, revenue: 1347 },
    { name: 'Sandalwood Incense', quantity: 2, revenue: 440 }
  ]
};

const MOCK_PRODUCTS = [
  { id: '1', name: 'Organic Ashwagandha Capsules', price: 499, salePrice: 449, stock: 50, category: 'Herbal Products', slug: 'organic-ashwagandha-capsules' },
  { id: '2', name: 'Vedic A2 Gir Cow Bilona Ghee', price: 1499, salePrice: 1399, stock: 25, category: 'Organic Food', slug: 'vedic-a2-gir-cow-bilona-ghee' },
  { id: '3', name: 'Sandalwood Incense Sticks', price: 250, salePrice: 220, stock: 100, category: 'Spiritual Essentials', slug: 'sandalwood-incense-sticks' },
  { id: '4', name: 'Kumkumadi Radiance Face Oil', price: 1899, salePrice: 1699, stock: 30, category: 'Personal Care', slug: 'kumkumadi-radiance-face-oil' }
];

const MOCK_ORDERS = [
  { id: 'ord_1', user: { name: 'Rohan Sharma' }, totalAmount: 1848, status: 'PENDING', paymentMethod: 'Razorpay', createdAt: '2026-06-08T12:00:00Z' },
  { id: 'ord_2', user: { name: 'Kunal Singh' }, totalAmount: 449, status: 'DELIVERED', paymentMethod: 'COD', createdAt: '2026-06-07T12:00:00Z' }
];

const MOCK_CUSTOMERS = [
  { id: 'u_1', name: 'Rohan Sharma', email: 'rohan@gmail.com', profile: { phone: '+919999988888', loyaltyPoints: 120 } },
  { id: 'u_2', name: 'Kunal Singh', email: 'kunal@gmail.com', profile: { phone: '+918888877777', loyaltyPoints: 40 } }
];

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
  }
];

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Route protection
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user]);

  // Tab control
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'customers' | 'blogs'>('analytics');
  
  // States
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(MOCK_ANALYTICS);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  // CRUD product form states (Expanded fields)
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodSalePrice, setProdSalePrice] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [prodCategory, setProdCategory] = useState('Herbal Products');
  const [prodSubCategory, setProdSubCategory] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImages, setProdImages] = useState('');
  const [prodVideoUrl, setProdVideoUrl] = useState('');
  const [prodIngredients, setProdIngredients] = useState('');
  const [prodBenefits, setProdBenefits] = useState('');
  const [prodUsageInstructions, setProdUsageInstructions] = useState('');
  const [prodAyurvedicProperties, setProdAyurvedicProperties] = useState('');
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);
  const [prodIsFeatured, setProdIsFeatured] = useState(false);

  // CRUD blog form states
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCategory, setBlogCategory] = useState('Ayurveda');
  const [blogAuthor, setBlogAuthor] = useState('');
  const [blogImage, setBlogImage] = useState('');

  // Fetch admin panels data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Fetch analytics
      const analyticsRes = await api.admin.getAnalytics();
      if (analyticsRes.success) {
        setAnalytics(analyticsRes);
      }
      
      // Fetch products list
      const productsRes = await api.products.getAll({ limit: 100 });
      if (productsRes.success) {
        setProducts(productsRes.data || []);
      } else {
        setProducts(MOCK_PRODUCTS);
      }

      // Fetch orders list
      const ordersRes = await api.admin.getOrders();
      if (ordersRes.success) {
        setOrders(ordersRes.orders || []);
      } else {
        setOrders(MOCK_ORDERS);
      }

      // Fetch customers list
      const customersRes = await api.admin.getCustomers();
      if (customersRes.success) {
        setCustomers(customersRes.customers || []);
      } else {
        setCustomers(MOCK_CUSTOMERS);
      }

      // Fetch blogs list
      const blogsRes = await api.blogs.getAll();
      if (blogsRes.success) {
        setBlogs(blogsRes.posts || []);
      } else {
        setBlogs(FALLBACK_POSTS);
      }

    } catch (err) {
      console.warn('REST API error. Running in local simulated sandbox mode.');
      setProducts(MOCK_PRODUCTS);
      setOrders(MOCK_ORDERS);
      setCustomers(MOCK_CUSTOMERS);
      setAnalytics(MOCK_ANALYTICS);
      setBlogs(FALLBACK_POSTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadAdminData();
    }
  }, [user]);

  // --- PRODUCT CRUD ACTIONS ---

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const productPayload = {
      name: prodName,
      price: parseFloat(prodPrice),
      salePrice: prodSalePrice ? parseFloat(prodSalePrice) : null,
      stock: parseInt(prodStock, 10),
      category: prodCategory,
      subCategory: prodSubCategory || null,
      description: prodDesc,
      images: prodImages ? prodImages.split(',').map(img => img.trim()) : ['https://images.unsplash.com/photo-1611070973770-b1a672610041?q=80&w=200'],
      videoUrl: prodVideoUrl || null,
      ingredients: prodIngredients ? prodIngredients.split(',').map(i => i.trim()) : [],
      benefits: prodBenefits ? prodBenefits.split(',').map(b => b.trim()) : [],
      usageInstructions: prodUsageInstructions || null,
      ayurvedicProperties: prodAyurvedicProperties || null,
      isBestSeller: prodIsBestSeller,
      isFeatured: prodIsFeatured
    };

    try {
      if (editingProductId) {
        // Edit product
        const res = await api.admin.updateProduct(editingProductId, productPayload);
        if (res.success) {
          alert('Product details updated!');
        }
      } else {
        // Add product
        const res = await api.admin.addProduct(productPayload);
        if (res.success) {
          alert('Product created and catalog updated!');
        }
      }
      setShowProductForm(false);
      resetProductForm();
      await loadAdminData();
    } catch (err: any) {
      // Mock local update fallback
      if (editingProductId) {
        setProducts(prev => prev.map(p => p.id === editingProductId ? { ...p, ...productPayload, slug: p.slug } : p));
      } else {
        const mockNew = {
          id: `prod_${Date.now()}`,
          ...productPayload,
          slug: prodName.toLowerCase().replace(/\s+/g, '-'),
          ratings: 5.0
        };
        setProducts(prev => [mockNew, ...prev]);
      }
      setShowProductForm(false);
      resetProductForm();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setLoading(true);
    try {
      await api.admin.deleteProduct(id);
      await loadAdminData();
    } catch (err) {
      setProducts(prev => prev.filter(p => p.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product: any) => {
    setEditingProductId(product.id);
    setProdName(product.name);
    setProdPrice(product.price.toString());
    setProdSalePrice(product.salePrice ? product.salePrice.toString() : '');
    setProdStock(product.stock.toString());
    setProdCategory(product.category);
    setProdSubCategory(product.subCategory || '');
    setProdDesc(product.description || '');

    // Safely parse JSON or display CSV format
    let imgs = '';
    if (product.images) {
      const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      imgs = Array.isArray(parsed) ? parsed.join(', ') : '';
    }
    setProdImages(imgs);

    setProdVideoUrl(product.videoUrl || '');

    let ingr = '';
    if (product.ingredients) {
      const parsed = typeof product.ingredients === 'string' ? JSON.parse(product.ingredients) : product.ingredients;
      ingr = Array.isArray(parsed) ? parsed.join(', ') : '';
    }
    setProdIngredients(ingr);

    let bene = '';
    if (product.benefits) {
      const parsed = typeof product.benefits === 'string' ? JSON.parse(product.benefits) : product.benefits;
      bene = Array.isArray(parsed) ? parsed.join(', ') : '';
    }
    setProdBenefits(bene);

    setProdUsageInstructions(product.usageInstructions || '');
    setProdAyurvedicProperties(product.ayurvedicProperties || '');
    setProdIsBestSeller(!!product.isBestSeller);
    setProdIsFeatured(!!product.isFeatured);

    setShowProductForm(true);
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProdName('');
    setProdPrice('');
    setProdSalePrice('');
    setProdStock('10');
    setProdCategory('Herbal Products');
    setProdSubCategory('');
    setProdDesc('');
    setProdImages('');
    setProdVideoUrl('');
    setProdIngredients('');
    setProdBenefits('');
    setProdUsageInstructions('');
    setProdAyurvedicProperties('');
    setProdIsBestSeller(false);
    setProdIsFeatured(false);
  };

  // --- BLOG CRUD ACTIONS ---

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const blogPayload = {
      title: blogTitle,
      content: blogContent,
      category: blogCategory,
      author: blogAuthor || 'DVYUG Acharya',
      image: blogImage || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600'
    };

    try {
      if (editingBlogId) {
        await api.admin.updateBlog(editingBlogId, blogPayload);
        alert('Blog article updated successfully!');
      } else {
        await api.admin.addBlog(blogPayload);
        alert('Blog article created and published!');
      }
      setShowBlogForm(false);
      resetBlogForm();
      await loadAdminData();
    } catch (err: any) {
      // Mock local fallback
      if (editingBlogId) {
        setBlogs(prev => prev.map(b => b.id === editingBlogId ? { ...b, ...blogPayload } : b));
      } else {
        const mockNew = {
          id: `blog_${Date.now()}`,
          ...blogPayload,
          slug: blogTitle.toLowerCase().replace(/\s+/g, '-'),
          createdAt: new Date().toISOString()
        };
        setBlogs(prev => [mockNew, ...prev]);
      }
      setShowBlogForm(false);
      resetBlogForm();
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlogClick = (blog: any) => {
    setEditingBlogId(blog.id);
    setBlogTitle(blog.title);
    setBlogContent(blog.content);
    setBlogCategory(blog.category);
    setBlogAuthor(blog.author || '');
    setBlogImage(blog.image || '');
    setShowBlogForm(true);
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    setLoading(true);
    try {
      await api.admin.deleteBlog(id);
      await loadAdminData();
      alert('Blog post deleted!');
    } catch (err) {
      setBlogs(prev => prev.filter(b => b.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const resetBlogForm = () => {
    setEditingBlogId(null);
    setBlogTitle('');
    setBlogContent('');
    setBlogCategory('Ayurveda');
    setBlogAuthor('');
    setBlogImage('');
  };

  // --- ORDER UPDATE STATUS ---

  const handleUpdateOrderStatus = async (id: string, currentStatus: string) => {
    const statuses = ['PENDING', 'SHIPPED', 'DELIVERED', 'RETURNED'];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    setLoading(true);
    try {
      await api.admin.updateOrderStatus(id, nextStatus);
      await loadAdminData();
    } catch (err) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));
    } finally {
      setLoading(false);
    }
  };

  // --- EXPORT TO CSV REPORT ---
  const handleExportCSV = () => {
    alert('Simulating report export: DVYUG_Customers_Sales_Report.csv downloaded successfully!');
  };

  // Auth Guard display
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-20 px-4 text-center font-sans space-y-4">
        <ShieldCheck className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-[#2D5A27]">Access Denied</h2>
        <p className="text-xs text-[#2B2B2B]/60 font-light">Only administrators of DVYUG can inspect this panel.</p>
        <Link href="/" className="inline-block px-6 py-2.5 bg-[#2D5A27] text-white text-xs font-bold rounded-full">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-8">
      
      {/* Admin Title Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F5EFE2] pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D5A27] flex items-center gap-2">
            DVYUG Admin Panel
            <ShieldCheck className="w-6 h-6 text-[#C9A227] fill-[#C9A227]" />
          </h1>
          <p className="text-xs text-[#2B2B2B]/60 font-light mt-0.5">Manage products, post wellness lore, track orders, and analyze aggregate metrics.</p>
        </div>
        <div className="flex bg-[#F5EFE2] p-1 rounded-full border border-[#dcd6c8] overflow-x-auto max-w-full scrollbar-none self-start md:self-center">
          <button
            onClick={() => { setActiveTab('analytics'); setShowProductForm(false); setShowBlogForm(false); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-[#2D5A27] text-white' : 'text-[#2B2B2B]/85'}`}
          >
            Analytics
          </button>
          <button
            onClick={() => { setActiveTab('products'); setShowProductForm(false); setShowBlogForm(false); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-[#2D5A27] text-white' : 'text-[#2B2B2B]/85'}`}
          >
            Products
          </button>
          <button
            onClick={() => { setActiveTab('blogs'); setShowProductForm(false); setShowBlogForm(false); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${activeTab === 'blogs' ? 'bg-[#2D5A27] text-white' : 'text-[#2B2B2B]/85'}`}
          >
            Blogs
          </button>
          <button
            onClick={() => { setActiveTab('orders'); setShowProductForm(false); setShowBlogForm(false); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-[#2D5A27] text-white' : 'text-[#2B2B2B]/85'}`}
          >
            Orders
          </button>
          <button
            onClick={() => { setActiveTab('customers'); setShowProductForm(false); setShowBlogForm(false); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${activeTab === 'customers' ? 'bg-[#2D5A27] text-white' : 'text-[#2B2B2B]/85'}`}
          >
            Customers
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
        </div>
      )}

      {/* --- TAB 1: ANALYTICS SUMMARY & CHARTS --- */}
      {!loading && activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#F5EFE2] border border-[#e2dccf] rounded-2xl p-5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#2B2B2B]/50 block">Total Revenue</span>
              <h3 className="text-2xl font-bold text-[#2D5A27]">₹{analytics.summary.totalRevenue}</h3>
            </div>
            <div className="bg-white border border-[#F5EFE2] rounded-2xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#2B2B2B]/50 block">Paid Orders</span>
              <h3 className="text-2xl font-bold text-[#2B2B2B]">{analytics.summary.totalOrders}</h3>
            </div>
            <div className="bg-white border border-[#F5EFE2] rounded-2xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#2B2B2B]/50 block">Registered Customers</span>
              <h3 className="text-2xl font-bold text-[#2B2B2B]">{analytics.summary.totalUsers}</h3>
            </div>
            <div className="bg-white border border-[#F5EFE2] rounded-2xl p-5 space-y-1 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-[#2B2B2B]/50 block">Catalog Products</span>
              <h3 className="text-2xl font-bold text-[#2B2B2B]">{analytics.summary.totalProducts}</h3>
            </div>
          </div>

          {/* Sales Timeline visual chart */}
          <div className="bg-white border border-[#F5EFE2] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-[#F5EFE2] pb-3">
              <h3 className="text-sm font-bold text-[#2D5A27] uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                Revenue Progress Timeline
              </h3>
              <span className="text-[10px] text-[#2B2B2B]/50 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                +18% Growth
              </span>
            </div>

            {/* Custom CSS Bar chart */}
            <div className="h-48 flex items-end gap-3 sm:gap-6 border-b border-l border-[#dcd6c8] pb-1 pl-4 pt-4">
              {analytics.salesTimeline.map((day: any, i: number) => {
                const maxVal = Math.max(...analytics.salesTimeline.map((x: any) => x.sales));
                const pct = (day.sales / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <span className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-[#2B2B2B] text-white text-[9px] px-2 py-0.5 rounded shadow transition-opacity z-10 whitespace-nowrap">
                      ₹{Math.round(day.sales)}
                    </span>
                    <div 
                      className="w-full bg-[#2D5A27] rounded-t-md hover:bg-[#C9A227] transition-all cursor-pointer"
                      style={{ height: `${pct || 1}%`, minHeight: '4px' }}
                    />
                    <span className="text-[8px] sm:text-[9px] text-[#2B2B2B]/65 font-medium">{day.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: INVENTORY PRODUCT CRUD LIST --- */}
      {!loading && activeTab === 'products' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif font-bold text-[#2D5A27]">Catalog Inventory</h2>
            {!showProductForm && (
              <button
                onClick={() => { resetProductForm(); setShowProductForm(true); }}
                className="px-4 py-2 bg-[#2D5A27] hover:bg-[#C9A227] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            )}
          </div>

          {/* Product Creation Form (Expanded fields) */}
          {showProductForm && (
            <form onSubmit={handleSaveProduct} className="bg-[#F5EFE2]/50 border border-[#e2dccf] rounded-3xl p-6 space-y-4 max-w-4xl animate-slide-up">
              <div className="flex justify-between items-center border-b border-[#dcd6c8] pb-2">
                <h3 className="text-sm font-bold text-[#2D5A27] uppercase tracking-wider">
                  {editingProductId ? 'Edit Product Parameters' : 'Add New Vedic Product'}
                </h3>
                <button type="button" onClick={() => { setShowProductForm(false); resetProductForm(); }} className="text-[#2B2B2B] hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Product Name</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                    placeholder="e.g. Pure Triphala Churna"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                  >
                    <option value="Herbal Products">Herbal Products</option>
                    <option value="Organic Food">Organic Food</option>
                    <option value="Spiritual Essentials">Spiritual Essentials</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Puja Essentials">Puja Essentials</option>
                    <option value="Gift Sets">Gift Sets</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Sub-Category</label>
                  <input
                    type="text"
                    value={prodSubCategory}
                    onChange={(e) => setProdSubCategory(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                    placeholder="e.g. Digestive Care, Ghee"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Sale Price (Optional)</label>
                  <input
                    type="number"
                    value={prodSalePrice}
                    onChange={(e) => setProdSalePrice(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Stock Available</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                  />
                </div>
                <div className="space-y-1 md:col-span-3">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Image URLs (comma separated)</label>
                  <input
                    type="text"
                    value={prodImages}
                    onChange={(e) => setProdImages(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                    placeholder="https://domain.com/img1.jpg, https://domain.com/img2.jpg"
                  />
                </div>
                <div className="space-y-1 md:col-span-3">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Video URL (Optional)</label>
                  <input
                    type="text"
                    value={prodVideoUrl}
                    onChange={(e) => setProdVideoUrl(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                    placeholder="https://youtube.com/embed/..."
                  />
                </div>
                <div className="space-y-1 md:col-span-3">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Ingredients (comma separated)</label>
                  <input
                    type="text"
                    value={prodIngredients}
                    onChange={(e) => setProdIngredients(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                    placeholder="Amla, Haritaki, Bibhitaki"
                  />
                </div>
                <div className="space-y-1 md:col-span-3">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Benefits (comma separated)</label>
                  <input
                    type="text"
                    value={prodBenefits}
                    onChange={(e) => setProdBenefits(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                    placeholder="Aids Digestion, Detoxifies, Cleanses Colon"
                  />
                </div>
                <div className="space-y-1 md:col-span-3">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Usage Instructions</label>
                  <input
                    type="text"
                    value={prodUsageInstructions}
                    onChange={(e) => setProdUsageInstructions(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                    placeholder="e.g. Consume 1-2 capsules daily after meals with lukewarm water."
                  />
                </div>
                <div className="space-y-1 md:col-span-3">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Ayurvedic Properties (Dosha, Guna, Virya)</label>
                  <input
                    type="text"
                    value={prodAyurvedicProperties}
                    onChange={(e) => setProdAyurvedicProperties(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                    placeholder="e.g. Pacifies Vata & Pitta, increases Agni digest."
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isBestSeller"
                    checked={prodIsBestSeller}
                    onChange={(e) => setProdIsBestSeller(e.target.checked)}
                    className="accent-[#2D5A27] w-4 h-4"
                  />
                  <label htmlFor="isBestSeller" className="text-[10px] font-bold text-[#2B2B2B] uppercase select-none">Mark Best Seller</label>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={prodIsFeatured}
                    onChange={(e) => setProdIsFeatured(e.target.checked)}
                    className="accent-[#2D5A27] w-4 h-4"
                  />
                  <label htmlFor="isFeatured" className="text-[10px] font-bold text-[#2B2B2B] uppercase select-none">Mark Featured</label>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Description</label>
                <textarea
                  rows={4}
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#dcd6c8]">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2D5A27] hover:bg-[#C9A227] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md"
                >
                  Save Product
                </button>
                <button
                  type="button"
                  onClick={() => { setShowProductForm(false); resetProductForm(); }}
                  className="px-6 py-2.5 border border-[#c3bdad] text-[#2B2B2B]/70 text-xs font-bold uppercase tracking-wider rounded-full hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Table Products listing */}
          <div className="bg-white border border-[#F5EFE2] rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-light text-[#2B2B2B]">
                <thead className="bg-[#FAF8F2] border-b border-[#F5EFE2] text-[10px] font-bold uppercase tracking-wider text-[#2D5A27]">
                  <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Stock</th>
                    <th className="px-6 py-4 text-right">Price</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFE2]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF8F2]/30">
                      <td className="px-6 py-4 font-semibold">
                        <div className="flex flex-col">
                          <span>{p.name}</span>
                          <span className="text-[9px] text-[#2B2B2B]/40">/{p.slug}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#2D5A27]">{p.category}</td>
                      <td className="px-6 py-4 text-center font-bold">{p.stock}</td>
                      <td className="px-6 py-4 text-right font-bold">
                        {p.salePrice ? (
                          <span className="flex flex-col text-right">
                            <span className="text-[10px] text-[#2B2B2B]/40 line-through">₹{p.price}</span>
                            <span>₹{p.salePrice}</span>
                          </span>
                        ) : (
                          <span>₹{p.price}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => handleEditClick(p)} className="p-1.5 text-[#C9A227] hover:bg-[#FAF8F2] rounded" aria-label="Edit">
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" aria-label="Delete">
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* --- TAB 3: BLOGS MANAGEMENT TAB --- */}
      {!loading && activeTab === 'blogs' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif font-bold text-[#2D5A27]">DVYUG Lore & Articles</h2>
            {!showBlogForm && (
              <button
                onClick={() => { resetBlogForm(); setShowBlogForm(true); }}
                className="px-4 py-2 bg-[#2D5A27] hover:bg-[#C9A227] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Article
              </button>
            )}
          </div>

          {/* Blog CRUD Form */}
          {showBlogForm && (
            <form onSubmit={handleSaveBlog} className="bg-[#F5EFE2]/50 border border-[#e2dccf] rounded-3xl p-6 space-y-4 max-w-3xl animate-slide-up">
              <div className="flex justify-between items-center border-b border-[#dcd6c8] pb-2">
                <h3 className="text-sm font-bold text-[#2D5A27] uppercase tracking-wider">
                  {editingBlogId ? 'Edit Blog Article' : 'Compose New Vedic Article'}
                </h3>
                <button type="button" onClick={() => { setShowBlogForm(false); resetBlogForm(); }} className="text-[#2B2B2B] hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Article Title</label>
                  <input
                    type="text"
                    required
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                    placeholder="e.g. Benefits of lighting pure Bhimseni Camphor"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Category</label>
                  <select
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                  >
                    <option value="Ayurveda">Ayurveda</option>
                    <option value="Organic Living">Organic Living</option>
                    <option value="Spirituality">Spirituality</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Herbal Remedies">Herbal Remedies</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Author Name (Defaults to Acharya)</label>
                  <input
                    type="text"
                    value={blogAuthor}
                    onChange={(e) => setBlogAuthor(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                    placeholder="DVYUG Acharya"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Banner Image URL</label>
                  <input
                    type="text"
                    required
                    value={blogImage}
                    onChange={(e) => setBlogImage(e.target.value)}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B]"
                    placeholder="https://domain.com/banner.jpg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Article Body Content</label>
                <textarea
                  rows={10}
                  required
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="w-full bg-white text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] text-[#2B2B2B] font-light leading-relaxed"
                  placeholder="Draft your spiritual/wellness lore paragraphs here..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#dcd6c8]">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2D5A27] hover:bg-[#C9A227] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md"
                >
                  Publish Article
                </button>
                <button
                  type="button"
                  onClick={() => { setShowBlogForm(false); resetBlogForm(); }}
                  className="px-6 py-2.5 border border-[#c3bdad] text-[#2B2B2B]/70 text-xs font-bold uppercase tracking-wider rounded-full hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Blogs list Table */}
          <div className="bg-white border border-[#F5EFE2] rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-light text-[#2B2B2B]">
                <thead className="bg-[#FAF8F2] border-b border-[#F5EFE2] text-[10px] font-bold uppercase tracking-wider text-[#2D5A27]">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Published Date</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFE2]">
                  {blogs.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FAF8F2]/30">
                      <td className="px-6 py-4 font-semibold">
                        <div className="flex flex-col">
                          <span>{b.title}</span>
                          <span className="text-[9px] text-[#2B2B2B]/40">/{b.slug}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#2D5A27]">{b.category}</td>
                      <td className="px-6 py-4 font-medium">{b.author || 'DVYUG Acharya'}</td>
                      <td className="px-6 py-4 text-[#2B2B2B]/70">{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => handleEditBlogClick(b)} className="p-1.5 text-[#C9A227] hover:bg-[#FAF8F2] rounded" aria-label="Edit Blog">
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>
                          <button onClick={() => handleDeleteBlog(b.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" aria-label="Delete Blog">
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* --- TAB 4: ORDER LIST & STATUS UPDATER --- */}
      {!loading && activeTab === 'orders' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-xl font-serif font-bold text-[#2D5A27]">Order Registry Management</h2>
          
          <div className="bg-white border border-[#F5EFE2] rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-light text-[#2B2B2B]">
                <thead className="bg-[#FAF8F2] border-b border-[#F5EFE2] text-[10px] font-bold uppercase tracking-wider text-[#2D5A27]">
                  <tr>
                    <th className="px-6 py-4">Order Reference</th>
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Date placed</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Total Billing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFE2]">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#FAF8F2]/30">
                      <td className="px-6 py-4 font-bold uppercase">{o.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 font-medium">{o.user?.name}</td>
                      <td className="px-6 py-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, o.status)}
                          className="px-3 py-1 rounded-full text-[9px] font-bold tracking-wider text-white uppercase bg-[#2D5A27] hover:bg-[#C9A227] transition-colors"
                        >
                          {o.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right font-bold">₹{o.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: CUSTOMERS & EXPORT --- */}
      {!loading && activeTab === 'customers' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b border-[#F5EFE2] pb-4">
            <h2 className="text-xl font-serif font-bold text-[#2D5A27]">Customer Management</h2>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 border border-[#2D5A27] hover:bg-[#2D5A27]/5 text-[#2D5A27] text-xs font-semibold rounded-full flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Export CSV Report
            </button>
          </div>

          <div className="bg-white border border-[#F5EFE2] rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-light text-[#2B2B2B]">
                <thead className="bg-[#FAF8F2] border-b border-[#F5EFE2] text-[10px] font-bold uppercase tracking-wider text-[#2D5A27]">
                  <tr>
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4 text-center">Phone Line</th>
                    <th className="px-6 py-4 text-center">Loyalty Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFE2]">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF8F2]/30">
                      <td className="px-6 py-4 font-semibold">{c.name}</td>
                      <td className="px-6 py-4">{c.email}</td>
                      <td className="px-6 py-4 text-center">{c.profile?.phone || 'Not provided'}</td>
                      <td className="px-6 py-4 text-center font-bold text-[#2D5A27]">{c.profile?.loyaltyPoints || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
