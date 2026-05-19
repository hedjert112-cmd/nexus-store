import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { storeService, Product, Category } from '../services/storeService';
import { storageService } from '../services/storageService';
import { settingsService } from '../services/settingsService';
import { useAuth } from './FirebaseContext';
import { formatPrice, cn } from '../lib/utils';
import { 
  BarChart3, 
  Package, 
  Users, 
  Settings, 
  Plus, 
  Loader2,
  Trash2,
  Edit2,
  X,
  Upload,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Mail,
  Globe,
  Instagram,
  Twitter,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const dummyData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

export const AdminDashboard: React.FC = () => {
  const { isAdmin, user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'settings'>('overview');
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    images: [] as string[],
    features: [] as string[],
    isFeatured: false
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!isAdmin && !authLoading) {
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodData, catData, orderSnap, settingsData] = await Promise.all([
          storeService.getProducts(),
          storeService.getCategories(),
          getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50))),
          settingsService.getSettings()
        ]);
        setProducts(prodData);
        setCategories(catData);
        const orderList = orderSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setOrders(orderList);
        setSiteSettings(settingsData);

        // Derive unique customers from orders
        const customerMap = new Map();
        orderList.forEach((order: any) => {
          if (order.userId && !customerMap.has(order.userId)) {
            customerMap.set(order.userId, {
              id: order.userId,
              name: `${order.shippingInfo?.firstName} ${order.shippingInfo?.lastName}`,
              email: order.shippingInfo?.email,
              totalOrders: orderList.filter((o: any) => o.userId === order.userId).length,
              totalSpent: orderList.filter((o: any) => o.userId === order.userId).reduce((acc: number, o: any) => acc + o.total, 0),
              lastOrder: order.createdAt
            });
          }
        });
        setCustomers(Array.from(customerMap.values()));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin, authLoading]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      await settingsService.updateSettings(siteSettings);
      toast.success('Site settings synchronized');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSettingsLoading(true);
      // Brief delay to show feedback
      setTimeout(() => setSettingsLoading(false), 500);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      images: [],
      features: [],
      isFeatured: false
    });
    setImageFiles([]);
    setEditingProduct(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: product.images,
      features: product.features || [],
      isFeatured: !!product.isFeatured
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await storeService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let finalImages = [...formData.images];
      
      // Upload new images
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => storageService.uploadProductImage(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        finalImages = [...finalImages, ...uploadedUrls];
      }

      const productData = {
        ...formData,
        images: finalImages,
        price: Number(formData.price),
        stock: Number(formData.stock),
        isFeatured: Boolean(formData.isFeatured),
        rating: editingProduct?.rating || 4.5,
        reviewsCount: editingProduct?.reviewsCount || 0
      };

      if (editingProduct?.id) {
        await storeService.updateProduct(editingProduct.id, productData);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
        toast.success('Product updated');
      } else {
        const newDoc = await storeService.addProduct(productData);
        setProducts([{ id: newDoc.id, ...productData } as Product, ...products]);
        toast.success('Product added');
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  // Stats calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (!isAdmin && !authLoading) {
    return (
      <div className="pt-32 px-6 h-screen flex flex-col items-center justify-center gap-6 text-center">
        <X size={48} className="text-red-500" />
        <h2 className="text-2xl font-light">Access Denied</h2>
        <p className="text-[#9e9e9e] max-w-sm">You do not have administrative privileges to access this area.</p>
        <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-black text-white rounded-full text-xs font-mono uppercase tracking-widest">Return Home</button>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-[#f9f9f9] flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-[#f0f0f0] hidden lg:flex flex-col p-6 sticky top-20 h-[calc(100vh-80px)]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1 px-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Management Console</span>
            <h2 className="text-xl font-medium">Administrator</h2>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              { id: 'overview', label: 'Dashboard', icon: BarChart3 },
              { id: 'products', label: 'Inventory', icon: Package },
              { id: 'orders', label: 'Orders', icon: ShoppingBag },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item: any) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  activeTab === item.id 
                    ? 'bg-black text-white' 
                    : 'text-[#9e9e9e] hover:bg-[#f9f9f9] hover:text-black'
                }`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto pt-6 border-t border-[#f0f0f0]">
          <div className="flex items-center gap-3 px-2 py-4">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[10px] text-white font-mono">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium truncate max-w-[120px]">{user?.email}</span>
              <span className="text-[10px] text-green-500 font-mono uppercase tracking-widest">Active session</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
               <h1 className="text-4xl font-light tracking-tight capitalize">{activeTab}</h1>
               <p className="text-sm text-[#9e9e9e]">Monitor store performance and manage operational flows.</p>
            </div>
            {activeTab === 'products' && (
              <button 
                onClick={handleOpenAdd}
                className="px-8 py-4 bg-black text-white rounded-full text-xs font-mono uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-all active:scale-[0.98]"
              >
                <Plus size={18} /> New Product
              </button>
            )}
          </header>

          {activeTab === 'overview' && (
            <div className="flex flex-col gap-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { label: 'Revenue Ledger', value: formatPrice(totalRevenue), change: '+14.2%', icon: TrendingUp },
                  { label: 'Active Sessions', value: totalOrders, change: '+5', icon: ShoppingBag },
                  { label: 'Asset Inventory', value: products.length, change: '-2', icon: Package },
                  { label: 'Retail Value', value: formatPrice(products.reduce((acc, p) => acc + (p.price * p.stock), 0)), change: '+8.1%', icon: BarChart3 },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[40px] border border-[#f0f0f0] flex flex-col gap-8 shadow-sm hover:shadow-xl transition-all duration-500 group">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-[#fcfcfc] rounded-2xl flex items-center justify-center border border-[#f0f0f0] group-hover:bg-black group-hover:text-white transition-all">
                        <stat.icon size={20} />
                      </div>
                      <span className="text-[10px] font-mono text-green-500 font-medium px-2 py-1 bg-green-50 rounded-full">{stat.change}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">{stat.label}</span>
                      <span className="text-3xl font-light tracking-tighter">{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-12 rounded-[48px] border border-[#f0f0f0] flex flex-col gap-10 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl font-light italic serif text-black">Revenue Analytics</h3>
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9e9e9e]">Weekly Synchronization Overview</p>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dummyData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={siteSettings?.brandColor || '#000'} stopOpacity={0.15}/>
                            <stop offset="95%" stopColor={siteSettings?.brandColor || '#000'} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#9e9e9e' }}
                          dy={10}
                        />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '24px', 
                            border: '1px solid #f0f0f0', 
                            boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            padding: '12px 20px'
                          }} 
                        />
                        {/* Note: revenue analytics is currently using synthesized data for visualization. 
                            In a full production environment, this would be derived from the 'orders' collection time-series. */}
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke={siteSettings?.brandColor || '#000'} 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill="url(#colorRev)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-12 rounded-[48px] border border-[#f0f0f0] flex flex-col gap-10 shadow-sm overflow-hidden">
                   <div className="flex flex-col gap-2 border-b border-[#f0f0f0] pb-6">
                    <h3 className="text-xl font-light italic serif text-black">System Alerts</h3>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9e9e9e]">Inventory Criticality Report</p>
                  </div>
                  <div className="flex flex-col gap-8">
                    {products.filter(p => p.stock <= 5).slice(0, 5).map((p, i) => (
                      <div key={p.id} className="flex items-center gap-5 group">
                        <div className="w-14 h-14 bg-[#fcfcfc] rounded-2xl overflow-hidden border border-[#f0f0f0] shrink-0">
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-xs font-medium truncate text-black">{p.name}</span>
                          <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest">{p.stock} Units Remaining</span>
                        </div>
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                      </div>
                    ))}
                    {products.filter(p => p.stock <= 5).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                        <CheckCircle2 size={40} className="text-slate-100" />
                        <span className="text-[10px] font-mono text-[#9e9e9e] uppercase tracking-widest leading-relaxed">Inventory levels are currently synchronized.</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setActiveTab('products')}
                    className="mt-auto py-5 bg-[#fcfcfc] border border-black/5 rounded-full text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all shadow-sm"
                  >
                    Inventory Archive
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-[40px] border border-[#f0f0f0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#fcfcfc] border-b border-[#f0f0f0]">
                      <th className="px-10 py-6 text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Product</th>
                      <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Category</th>
                      <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Price</th>
                      <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Stock</th>
                      <th className="px-10 py-6 text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-5">
                            <img src={p.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover bg-[#f9f9f9] border border-[#f0f0f0]" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{p.name}</span>
                              <span className="text-[10px] font-mono text-[#9e9e9e] uppercase tracking-widest">{p.id?.slice(-8)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-[#f9f9f9] border border-[#f0f0f0] rounded-full text-[10px] font-medium text-[#666]">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm font-mono font-medium">{formatPrice(p.price)}</td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1.5">
                            <span className={cn(
                              "text-sm font-medium",
                              p.stock <= 5 ? "text-orange-500" : p.stock === 0 ? "text-red-500" : "text-black"
                            )}>
                              {p.stock} units
                            </span>
                            <div className="w-16 h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full rounded-full", p.stock <= 5 ? "bg-orange-500" : p.stock === 0 ? "bg-red-500" : "bg-green-500")}
                                style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-6">
                            <button 
                              onClick={() => handleOpenEdit(p)}
                              className="text-[#9e9e9e] hover:text-black transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(p.id!)}
                              className="text-[#9e9e9e] hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                            <a 
                              href={`/products/${p.id}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[#9e9e9e] hover:text-black transition-colors"
                            >
                              <ExternalLink size={16} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="flex flex-col gap-8">
              <div className="bg-white rounded-[40px] border border-[#f0f0f0] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#fcfcfc] border-b border-[#f0f0f0]">
                        <th className="px-10 py-6 text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Order ID</th>
                        <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Customer</th>
                        <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Amount</th>
                        <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Status</th>
                        <th className="px-10 py-6 text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors">
                          <td className="px-10 py-6">
                            <span className="text-sm font-mono font-medium">#{order.id.slice(-8).toUpperCase()}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{order.shippingInfo?.firstName} {order.shippingInfo?.lastName}</span>
                              <span className="text-[10px] font-mono text-[#9e9e9e]">{order.userId?.slice(-6)}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-mono font-medium">{formatPrice(order.total)}</td>
                          <td className="px-8 py-6">
                            <select 
                              value={order.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                await updateDoc(doc(db, 'orders', order.id), { status: newStatus });
                                setOrders(orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                                toast.success('Order status updated');
                              }}
                              className={cn(
                                "text-[10px] font-mono uppercase px-3 py-1 rounded-full outline-none border transition-all cursor-pointer",
                                order.status === 'processing' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                order.status === 'shipped' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                order.status === 'delivered' ? "bg-green-50 text-green-600 border-green-100" :
                                "bg-gray-50 text-gray-600 border-gray-100"
                              )}
                            >
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-10 py-6">
                            <button className="text-[#9e9e9e] hover:text-black transition-colors">
                              <ExternalLink size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="flex flex-col gap-8">
              <div className="bg-white rounded-[40px] border border-[#f0f0f0] overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#fcfcfc] border-b border-[#f0f0f0]">
                      <th className="px-10 py-6 text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Identity</th>
                      <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Engagement</th>
                      <th className="px-8 py-6 text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Value</th>
                      <th className="px-10 py-6 text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-mono text-xs shadow-lg shadow-black/10">
                              {customer.name[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{customer.name}</span>
                              <span className="text-[10px] font-mono text-[#9e9e9e]">{customer.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex flex-col gap-1">
                             <span className="text-sm font-mono font-medium">{customer.totalOrders} Transactions</span>
                             <span className="text-[10px] text-[#9e9e9e] font-mono">Last: {new Date(customer.lastOrder?.seconds * 1000).toLocaleDateString()}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-sm font-mono font-medium text-green-600">{formatPrice(customer.totalSpent)}</span>
                        </td>
                        <td className="px-10 py-6">
                           <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-mono uppercase rounded-full">Synchronized</span>
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-10 py-32 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <Users size={48} className="text-[#eee]" />
                            <p className="text-sm text-[#9e9e9e] italic font-light">No customer synchronization data found.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && siteSettings && (
            <div className="max-w-4xl flex flex-col gap-12">
              <form onSubmit={handleUpdateSettings} className="space-y-12">
                <section className="space-y-8 bg-white p-12 rounded-[48px] border border-[#f0f0f0] shadow-sm">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-light italic serif text-black">Identity & Branding</h3>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9e9e9e]">Core visual identifiers</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1">Brand Recognition</label>
                      <input 
                        value={siteSettings.storeName}
                        onChange={(e) => setSiteSettings({...siteSettings, storeName: e.target.value})}
                        className="w-full px-6 py-5 bg-[#f9f9f9] border border-transparent rounded-[24px] focus:bg-white focus:border-black outline-none transition-all text-sm font-medium" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1">Visual Signature (Logo URL)</label>
                      <input 
                        value={siteSettings.logo}
                        onChange={(e) => setSiteSettings({...siteSettings, logo: e.target.value})}
                        placeholder="Leave blank for typography logo"
                        className="w-full px-6 py-5 bg-[#f9f9f9] border border-transparent rounded-[24px] focus:bg-white focus:border-black outline-none transition-all text-sm font-medium" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1">Primary Chroma</label>
                      <div className="flex gap-4">
                        <input 
                          type="color"
                          value={siteSettings.brandColor}
                          onChange={(e) => setSiteSettings({...siteSettings, brandColor: e.target.value})}
                          className="w-16 h-16 rounded-[20px] cursor-pointer bg-transparent border-0 clip-path" 
                        />
                        <input 
                          value={siteSettings.brandColor}
                          onChange={(e) => setSiteSettings({...siteSettings, brandColor: e.target.value})}
                          className="flex-1 px-6 py-5 bg-[#f9f9f9] border border-transparent rounded-[24px] focus:bg-white focus:border-black outline-none transition-all text-sm font-mono uppercase" 
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1">Accent Chroma</label>
                      <div className="flex gap-4">
                        <input 
                          type="color"
                          value={siteSettings.accentColor}
                          onChange={(e) => setSiteSettings({...siteSettings, accentColor: e.target.value})}
                          className="w-16 h-16 rounded-[20px] cursor-pointer bg-transparent border-0" 
                        />
                        <input 
                          value={siteSettings.accentColor}
                          onChange={(e) => setSiteSettings({...siteSettings, accentColor: e.target.value})}
                          className="flex-1 px-6 py-5 bg-[#f9f9f9] border border-transparent rounded-[24px] focus:bg-white focus:border-black outline-none transition-all text-sm font-mono uppercase" 
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-8 bg-white p-12 rounded-[48px] border border-[#f0f0f0] shadow-sm">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-light italic serif text-black">Homepage Experience</h3>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9e9e9e]">Cinematic hero & messaging</p>
                  </div>
                  <div className="grid gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1">Headline Narrative</label>
                      <input 
                        value={siteSettings.heroTitle}
                        onChange={(e) => setSiteSettings({...siteSettings, heroTitle: e.target.value})}
                        className="w-full px-6 py-5 bg-[#f9f9f9] border border-transparent rounded-[24px] focus:bg-white focus:border-black outline-none transition-all text-sm font-medium" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1">Secondary Narrative</label>
                      <textarea 
                        value={siteSettings.heroSubtitle}
                        onChange={(e) => setSiteSettings({...siteSettings, heroSubtitle: e.target.value})}
                        className="w-full px-6 py-5 bg-[#f9f9f9] border border-transparent rounded-[24px] focus:bg-white focus:border-black outline-none transition-all text-sm min-h-[120px] resize-none font-medium" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1">High-Impact Asset (Image URL)</label>
                      <input 
                        value={siteSettings.heroImage}
                        onChange={(e) => setSiteSettings({...siteSettings, heroImage: e.target.value})}
                        className="w-full px-6 py-5 bg-[#f9f9f9] border border-transparent rounded-[24px] focus:bg-white focus:border-black outline-none transition-all text-sm font-medium" 
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-8 bg-white p-12 rounded-[48px] border border-[#f0f0f0] shadow-sm">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-light italic serif text-black">Communications & Broadcast</h3>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9e9e9e]">Alerts & Contact protocol</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-6 p-8 bg-[#fcfcfc] rounded-[32px] border border-[#f0f0f0] md:col-span-2">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full", siteSettings.announcement.show ? "bg-green-500 animate-pulse" : "bg-[#ddd]")} />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-black">Broadcast Active</span>
                         </div>
                         <button 
                           type="button"
                           onClick={() => setSiteSettings({...siteSettings, announcement: {...siteSettings.announcement, show: !siteSettings.announcement.show}})}
                           className={cn(
                             "w-12 h-6 rounded-full transition-all relative flex items-center px-1",
                             siteSettings.announcement.show ? "bg-black" : "bg-[#eee]"
                           )}
                         >
                           <div className={cn("w-4 h-4 rounded-full bg-white transition-all shadow-sm", siteSettings.announcement.show ? "translate-x-6" : "translate-x-0")} />
                         </button>
                       </div>
                       <div className="flex flex-col gap-2">
                         <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1">Broadcast Message</label>
                         <input 
                           value={siteSettings.announcement.text}
                           onChange={(e) => setSiteSettings({...siteSettings, announcement: {...siteSettings.announcement, text: e.target.value}})}
                           className="w-full px-6 py-4 bg-white border border-[#f0f0f0] rounded-[20px] focus:border-black outline-none transition-all text-sm font-medium" 
                         />
                       </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1 flex items-center gap-2">
                         <Mail size={12} /> Contact Node (Email)
                       </label>
                       <input 
                         value={siteSettings.contactEmail}
                         onChange={(e) => setSiteSettings({...siteSettings, contactEmail: e.target.value})}
                         className="w-full px-6 py-5 bg-[#f9f9f9] border border-transparent rounded-[24px] focus:bg-white focus:border-black outline-none transition-all text-sm font-medium" 
                       />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1 flex items-center gap-2">
                         <Instagram size={12} /> Instagram Handle
                       </label>
                       <input 
                         value={siteSettings.socialLinks?.instagram || ''}
                         onChange={(e) => setSiteSettings({...siteSettings, socialLinks: {...siteSettings.socialLinks, instagram: e.target.value}})}
                         className="w-full px-6 py-5 bg-[#f9f9f9] border border-transparent rounded-[24px] focus:bg-white focus:border-black outline-none transition-all text-sm font-medium" 
                       />
                    </div>
                  </div>
                </section>

                <div className="flex justify-end pt-12 pb-24">
                  <button 
                    type="submit"
                    disabled={settingsLoading}
                    className="group relative px-16 py-6 bg-black text-white rounded-full text-[10px] font-mono uppercase tracking-[0.4em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                  >
                    <span className="relative z-10 flex items-center gap-4">
                      {settingsLoading ? <Loader2 size={18} className="animate-spin" /> : <>Finalize Configuration <ArrowUpRight size={18} /></>}
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
               <Loader2 size={32} className="animate-spin text-black" />
               <p className="text-sm font-mono text-[#9e9e9e] animate-pulse uppercase tracking-widest">Synchronizing Database</p>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !formLoading && setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-y-0 right-0 w-full max-w-xl bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-[#f0f0f0] flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-medium">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <p className="text-xs text-[#9e9e9e]">Fill in the details to update your store inventory.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-[#f9f9f9] rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form id="product-form" onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                
                {/* Basic Info */}
                <section className="space-y-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#9e9e9e]">Catalog Info</span>
                  <div className="grid gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1">Product Name</label>
                      <input 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-5 py-4 bg-[#f9f9f9] border border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all text-sm" 
                        placeholder="e.g. Nexus Pro X1"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1">Description</label>
                      <textarea 
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-5 py-4 bg-[#f9f9f9] border border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all text-sm min-h-[120px] resize-none" 
                        placeholder="Describe the product features and utility..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1">Price ($)</label>
                        <input 
                          type="number"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full px-5 py-4 bg-[#f9f9f9] border border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all text-sm" 
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1">Stock</label>
                        <input 
                          type="number"
                          required
                          value={formData.stock}
                          onChange={(e) => setFormData({...formData, stock: e.target.value})}
                          className="w-full px-5 py-4 bg-[#f9f9f9] border border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all text-sm" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] px-1">Category</label>
                      <select 
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-5 py-4 bg-[#f9f9f9] border border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all text-sm appearance-none cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center gap-3 px-1 pt-2">
                      <input 
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                        className="w-5 h-5 accent-black rounded cursor-pointer"
                      />
                      <label htmlFor="isFeatured" className="text-xs font-medium cursor-pointer">Feature on Homepage</label>
                    </div>
                  </div>
                </section>

                {/* Images */}
                <section className="space-y-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#9e9e9e]">Visual Assets</span>
                  <div className="grid gap-6">
                    <div className="grid grid-cols-4 gap-4">
                      {formData.images.map((url: string, i: number) => (
                        <div key={i} className="relative aspect-square bg-[#f9f9f9] rounded-xl overflow-hidden border border-[#f0f0f0]">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, images: formData.images.filter((_: any, idx: number) => idx !== i)})}
                            className="absolute top-1 right-1 p-1 bg-black text-white rounded-full opacity-80 hover:opacity-100"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {imageFiles.map((file, i) => (
                         <div key={`new-${i}`} className="relative aspect-square bg-[#f9f9f9] rounded-xl overflow-hidden border border-black border-dashed flex items-center justify-center">
                            <span className="text-[8px] font-mono uppercase text-black text-center px-1">New Sync</span>
                            <button 
                              type="button"
                              onClick={() => setImageFiles(imageFiles.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 p-1 bg-black text-white rounded-full opacity-80 hover:opacity-100"
                            >
                              <X size={10} />
                            </button>
                         </div>
                      ))}
                      <label className="aspect-square bg-[#f9f9f9] rounded-xl border border-dashed border-[#d1d1d1] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#f0f0f0] transition-colors group">
                        <Upload size={16} className="text-[#9e9e9e] group-hover:text-black transition-colors" />
                        <span className="text-[8px] font-mono uppercase tracking-widest text-[#9e9e9e]">Add Content</span>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files) {
                              setImageFiles([...imageFiles, ...Array.from(e.target.files)]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </section>
              </form>

              <div className="p-8 border-t border-[#f0f0f0] bg-[#fafafa]">
                 <button
                  type="submit"
                  form="product-form"
                  onClick={(e) => {
                    const form = document.querySelector('form') as HTMLFormElement;
                    if (form.checkValidity()) {
                      handleFormSubmit(e as any);
                    } else {
                      form.reportValidity();
                    }
                  }}
                  disabled={formLoading}
                  className="w-full py-5 bg-black text-white rounded-full text-xs font-mono uppercase tracking-[0.3em] font-medium flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {formLoading ? <Loader2 size={18} className="animate-spin" /> : 'Synchronize Product'}
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
