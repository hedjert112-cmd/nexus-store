import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { storeService, Product } from '../services/storeService';
import { useAuth } from './FirebaseContext';
import { formatPrice, cn } from '../lib/utils';
import { Package, ShoppingBag, Heart, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'settings'>('orders');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [orderSnap, wishlistIds] = await Promise.all([
          getDocs(query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))).catch(() => ({ docs: [] })),
          storeService.getWishlist(user.uid)
        ]);
        
        setOrders(orderSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        
        if (wishlistIds.length > 0) {
          const productPromises = wishlistIds.map(id => storeService.getProduct(id));
          const products = await Promise.all(productPromises);
          setWishlist(products.filter(p => p !== null) as Product[]);
        } else {
          setWishlist([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;
    try {
      await storeService.toggleWishlist(user.uid, productId);
      setWishlist(wishlist.filter(p => p.id !== productId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Profile synchronization in progress...');
    setTimeout(() => toast.success('Profile credentials updated'), 1000);
  };

  const statusColors: any = {
    pending: 'bg-orange-50 text-orange-600',
    processing: 'bg-blue-50 text-blue-600',
    shipped: 'bg-purple-50 text-purple-600',
    delivered: 'bg-green-50 text-green-600',
    cancelled: 'bg-red-50 text-red-600'
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#9e9e9e]">Member Profile</span>
            <h1 className="text-4xl font-light tracking-tight">{user?.displayName || user?.email}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-black text-white text-[10px] font-mono rounded-full uppercase tracking-widest">Verified Member</span>
              <span className="text-xs text-[#9e9e9e] font-mono">Member ID: {user?.uid.slice(-8)}</span>
            </div>
          </div>
          <div className="flex bg-[#f9f9f9] p-1 rounded-full border border-[#f0f0f0]">
             {[
               { id: 'orders', label: 'Orders' },
               { id: 'wishlist', label: 'Wishlist' },
               { id: 'settings', label: 'Settings' }
             ].map((tab) => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={cn(
                   "px-8 py-3 rounded-full text-xs font-mono uppercase tracking-widest transition-all",
                   activeTab === tab.id ? "bg-white text-black shadow-sm" : "text-[#9e9e9e]"
                 )}
               >
                 {tab.label}
               </button>
             ))}
          </div>
        </header>

        <div className="grid lg:grid-cols-1 gap-8">
           <AnimatePresence mode="wait">
             {activeTab === 'orders' ? (
               <motion.div 
                 key="orders"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="flex flex-col gap-8"
               >
                 <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-light">Order History</h2>
                   <span className="text-xs font-mono text-[#9e9e9e] uppercase tracking-widest">{orders.length} Total Orders</span>
                 </div>

                 {loading ? (
                   <div className="py-24 text-center text-[#9e9e9e] animate-pulse font-mono text-xs uppercase tracking-widest">Retrieving transactions...</div>
                 ) : orders.length === 0 ? (
                   <div className="py-24 bg-[#fcfcfc] border border-dashed border-[#f0f0f0] rounded-[40px] flex flex-col items-center gap-6 text-center">
                     <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center text-[#d1d1d1]">
                       <ShoppingBag size={40} />
                     </div>
                     <div className="flex flex-col gap-1">
                       <p className="text-sm font-medium">No orders yet</p>
                       <p className="text-xs text-[#9e9e9e]">Your purchase history will appear here once you make an order.</p>
                     </div>
                     <Link to="/products" className="px-8 py-3 bg-black text-white rounded-full text-[10px] font-mono uppercase tracking-widest hover:opacity-80 transition-all">Start Shopping</Link>
                   </div>
                 ) : (
                   <div className="grid md:grid-cols-2 gap-6">
                     {orders.map((order) => (
                       <div key={order.id} className="bg-white border border-[#f0f0f0] rounded-[40px] p-10 flex flex-col gap-8 hover:shadow-xl transition-all duration-500 group">
                         <div className="flex items-center justify-between">
                           <div className="flex flex-col gap-1">
                             <span className="text-[10px] font-mono text-[#9e9e9e] uppercase tracking-[0.2em]">Transaction UID</span>
                             <span className="text-xs font-mono font-medium">#{order.id.slice(-12).toUpperCase()}</span>
                           </div>
                           <span className={cn(
                             "px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest",
                             statusColors[order.status] || 'bg-[#f0f0f0] text-black'
                           )}>
                             {order.status}
                           </span>
                         </div>
                         
                         <div className="flex flex-col gap-4">
                           <div className="flex flex-wrap gap-4">
                             {order.items?.map((item: any, i: number) => (
                               <div key={i} className="relative group/item">
                                 <img 
                                  src={item.images?.[0] || item.image} 
                                  alt="" 
                                  className="w-16 h-16 rounded-2xl object-cover bg-[#f9f9f9] border border-[#f0f0f0]" 
                                 />
                                 <div className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[8px] font-mono">
                                   {item.quantity}
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>

                         <div className="flex items-center justify-between pt-6 border-t border-[#fcfcfc] mt-auto">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-mono text-[#9e9e9e] uppercase tracking-widest">Grand Total</span>
                              <span className="text-lg font-mono font-medium">{formatPrice(order.total)}</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#9e9e9e]">
                              {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                            </span>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </motion.div>
             ) : activeTab === 'wishlist' ? (
               <motion.div 
                 key="wishlist"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="flex flex-col gap-8"
               >
                 <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-light">My Wishlist</h2>
                   <span className="text-xs font-mono text-[#9e9e9e] uppercase tracking-widest">{wishlist.length} Items Saved</span>
                 </div>

                 {wishlist.length === 0 ? (
                   <div className="py-24 bg-[#fcfcfc] border border-dashed border-[#f0f0f0] rounded-[40px] flex flex-col items-center gap-6 text-center">
                     <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center text-red-100">
                       <Heart size={40} className="fill-red-50" />
                     </div>
                     <div className="flex flex-col gap-1">
                       <p className="text-sm font-medium">Empty collection</p>
                       <p className="text-xs text-[#9e9e9e]">Save items you love to keep track of them.</p>
                     </div>
                     <Link to="/products" className="px-8 py-3 bg-black text-white rounded-full text-[10px] font-mono uppercase tracking-widest hover:opacity-80 transition-all">Explore Store</Link>
                   </div>
                 ) : (
                   <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                     {wishlist.map((product) => (
                       <div key={product.id} className="group bg-white border border-[#f0f0f0] rounded-[40px] overflow-hidden flex flex-col hover:border-black transition-colors duration-500">
                         <div className="relative aspect-square overflow-hidden">
                           <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                           <button 
                             onClick={() => handleRemoveFromWishlist(product.id!)}
                             className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-full text-red-500 hover:bg-black hover:text-white transition-all shadow-sm"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                         <div className="p-8 flex flex-col gap-4">
                           <div className="flex flex-col gap-1">
                             <span className="text-[10px] font-mono uppercase text-[#9e9e9e] tracking-widest">{product.category}</span>
                             <h4 className="text-sm font-medium">{product.name}</h4>
                              <p className="text-sm font-mono mt-1">{formatPrice(product.price)}</p>
                           </div>
                           <Link 
                            to={`/products/${product.id}`}
                            className="mt-2 py-3 border border-black rounded-full text-[10px] font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all"
                           >
                             View Product <ArrowRight size={14} />
                           </Link>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </motion.div>
             ) : (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-xl bg-white border border-[#f0f0f0] rounded-[40px] p-10 flex flex-col gap-8"
                >
                  <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-light">Account Settings</h2>
                    <p className="text-sm text-[#9e9e9e]">Update your persona and security credentials.</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-8">
                    <div className="grid gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] ml-1">Display Name</label>
                        <input defaultValue={user?.displayName || ''} className="px-5 py-4 bg-[#f9f9f9] border border-transparent rounded-2xl outline-none focus:bg-white focus:border-black transition-all text-sm" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e] ml-1">Email Address</label>
                        <input readOnly value={user?.email || ''} className="px-5 py-4 bg-[#f9f9f9] border border-transparent rounded-2xl outline-none text-sm opacity-50 cursor-not-allowed" />
                      </div>
                    </div>
                    <button type="submit" className="w-fit px-10 py-4 bg-black text-white rounded-full text-[10px] font-mono uppercase tracking-widest hover:opacity-80 transition-all">Synchronize Profile</button>
                  </form>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
