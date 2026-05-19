import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { storeService, Product } from '../services/storeService';
import { useSettings } from './SettingsContext';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './Skeleton';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, ShieldCheck, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export const HomePage: React.FC = () => {
  const { settings } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const featured = await storeService.getFeaturedProducts();
        if (featured.length > 0) {
          setFeaturedProducts(featured);
        } else {
          const all = await storeService.getProducts();
          setFeaturedProducts(all.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (!settings) return null;

  return (
    <div className={cn("overflow-x-hidden", settings.announcement.show ? "pt-28" : "pt-20")}>
      {/* Cinematic Hero Section */}
      <section className="relative h-[92vh] min-h-[700px] flex items-center bg-white">
        <div className="absolute inset-0 z-0 bg-[#f8f8f8]">
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ 
                 backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', 
                 backgroundSize: '24px 24px' 
               }} 
          />
        </div>
        
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-12"
          >
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-4">
                <span className="w-10 h-px bg-black" />
                <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-black/40">Established MMXXVI</span>
              </div>
              <h1 className="text-[clamp(3.5rem,8vw,120px)] leading-[0.85] font-light tracking-tighter text-black">
                {settings.heroTitle.split(' ').map((word, i) => (
                   <span key={i} className={cn("block", i % 2 !== 0 ? "italic serif pl-8 md:pl-20" : "")}>
                     {word}
                   </span>
                ))}
              </h1>
              <p className="max-w-md text-[#666] text-sm md:text-lg leading-relaxed font-light mt-4">
                {settings.heroSubtitle}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-10">
              <Link 
                to="/products"
                className="group relative px-12 py-5 bg-black text-white rounded-full text-[10px] font-mono uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-black/20"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Shop Collection <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-mono overflow-hidden">
                       <img src={`https://images.unsplash.com/photo-${1500 + i}?auto=format&fit=crop&q=80&w=100`} alt="" />
                     </div>
                   ))}
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-mono uppercase tracking-widest text-black">5.2k+ Members</span>
                   <span className="text-[9px] font-mono uppercase tracking-widest text-[#9e9e9e]">Elite Circle</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: 5 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[4/5] hidden lg:block rounded-[60px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-[#f0f0f0]"
          >
            <img 
              src={settings.heroImage} 
              alt={settings.storeName}
              className="w-full h-full object-cover grayscale-[0.1] hover:scale-110 transition-all duration-2000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-12 left-12 right-12 p-10 bg-white/10 backdrop-blur-3xl rounded-[40px] border border-white/20 flex items-center justify-between">
               <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/60">Featured Asset</span>
                 <span className="text-lg text-white font-light tracking-tight">Studio Archive III</span>
               </div>
               <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-all">
                 <Plus size={18} />
               </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brand Values / Narrative */}
      <section className="py-40 bg-[#0a0a0a] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            <div className="flex flex-col gap-16">
              <div className="flex flex-col gap-6">
                 <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-[#444]">The Philosophy</span>
                 <h2 className="text-6xl font-light leading-[1] tracking-tighter serif italic">
                   Minimalism <br /> as a standard.
                 </h2>
              </div>
              
              <div className="grid gap-12">
                {[
                  { icon: ShieldCheck, title: "Artisan Quality", desc: "Each piece is vetted by our master curators for absolute perfection." },
                  { icon: Sparkles, title: "Unmatched Rarity", desc: "Limited run productions that prioritize exclusivity over volume." },
                  { icon: Zap, title: "Rapid Fulfillment", desc: "Global logistics network optimized for white-glove delivery speeds." }
                ].map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    key={i} 
                    className="flex gap-8 group"
                  >
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-all duration-500">
                      <item.icon size={20} />
                    </div>
                    <div className="flex flex-col gap-2">
                       <h4 className="text-lg font-medium">{item.title}</h4>
                       <p className="text-sm text-[#888] leading-relaxed max-w-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <motion.div 
                whileHover={{ scale: 0.98 }}
                className="aspect-square bg-gradient-to-br from-[#111] to-[#000] rounded-[60px] p-1 border border-white/10 flex items-center justify-center group overflow-hidden"
              >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512446813935-45091cead667?auto=format&fit=crop&q=80&w=800')] bg-cover opacity-20 group-hover:scale-110 transition-all duration-2000 grayscale" />
                <div className="relative z-10 flex flex-col items-center gap-8 text-center p-20">
                   <div className="w-24 h-24 border border-white/20 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                      <div className="w-2 h-2 bg-white rounded-full" />
                   </div>
                   <p className="text-2xl font-light italic serif leading-snug">
                     "We don't just sell products; we curate a lifestyle of intentional simplicity and functional elegance."
                   </p>
                   <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#555]">Studio Manifesto</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex flex-col gap-4">
               <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-[#9e9e9e]">Shop by Department</span>
               <h2 className="text-5xl font-light tracking-tighter italic serif text-black">Curated Archives</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Audio Design', tag: 'Acoustic Mastery', img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800' },
              { name: 'Digital Tools', tag: 'Silicon Valley Standards', img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800' },
              { name: 'Essentials', tag: 'Everyday Heritage', img: 'https://images.unsplash.com/photo-1491933382434-500286820ff5?auto=format&fit=crop&q=80&w=800' }
            ].map((cat, i) => (
              <motion.div 
                whileHover={{ y: -15 }}
                key={i} 
                className="group relative aspect-[3/4] bg-slate-100 rounded-[48px] overflow-hidden"
              >
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />
                <div className="absolute inset-0 p-12 flex flex-col justify-end gap-2">
                   <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/60">{cat.tag}</span>
                   <h3 className="text-3xl text-white font-light tracking-tight">{cat.name}</h3>
                   <Link to={`/products?category=${cat.name.split(' ')[0].toLowerCase()}`} className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white mt-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                     Explore <ArrowRight size={14} />
                   </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-40 border-t border-[#f0f0f0] bg-[#fcfcfc]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Sparkles size={14} className="text-black" />
                <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-[#9e9e9e]">Quarterly Highlights</span>
              </div>
              <h2 className="text-6xl font-light tracking-tighter leading-tight text-black">The Core <br /> <span className="italic serif">Selection</span></h2>
            </div>
            <Link 
              to="/products" 
              className="px-10 py-4 bg-white border border-black/5 rounded-full text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all shadow-sm flex items-center gap-3"
            >
              Full Catalogue <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
            {loading ? (
               Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Social / IG Grid */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-20 items-center">
           <div className="grid grid-cols-2 gap-6">
              {[
                'https://images.unsplash.com/photo-1542382257-80dee27001db',
                'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
                'https://images.unsplash.com/photo-1497215728101-856f4ea42174'
              ].map((img, i) => (
                <div key={i} className={cn("aspect-square rounded-[40px] overflow-hidden border border-[#f0f0f0]", i % 2 !== 0 ? "mt-12" : "")}>
                   <img src={`${img}?auto=format&fit=crop&q=80&w=400`} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                </div>
              ))}
           </div>
           <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-6">
                 <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-[#9e9e9e]">@studio.archive</span>
                 <h2 className="text-5xl font-light tracking-tighter serif italic leading-tight">Visualizing <br /> the Studio Lifestyle</h2>
                 <p className="text-lg text-[#666] leading-relaxed font-light max-w-sm">
                   Join our collective of over 50,000 minimalists sharing their curated environments.
                 </p>
              </div>
              <button className="self-start px-12 py-5 border border-black rounded-full text-[10px] font-mono uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all">
                 Join the Collective
              </button>
           </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-[#0a0a0a] text-white pt-32 pb-12 px-6 md:px-12 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/5" />
        
        <div className="max-w-7xl mx-auto flex flex-col gap-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-5 flex flex-col gap-10">
               <h3 className="text-4xl font-light tracking-tighter italic serif">{settings.storeName}</h3>
               <p className="text-[#666] text-lg leading-relaxed font-light max-w-sm">
                 A sanctuary for precision-engineered essentials. Designed in Stockholm, appreciated globally.
               </p>
               <div className="flex flex-col gap-4">
                 <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#444]">Intellectual Property</span>
                 <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#666]">Built by the Antigravity Agent • 2026</p>
               </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-10">
               <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-[#444]">Archive</span>
               <div className="flex flex-col gap-4">
                 {['All Assets', 'Newly Released', 'Audio', 'Digital', 'Physical'].map(link => (
                   <Link key={link} to="/products" className="text-sm font-light text-[#888] hover:text-white transition-colors">{link}</Link>
                 ))}
               </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-10">
               <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-[#444]">Concierge</span>
               <div className="flex flex-col gap-4">
                 {['Private Session', 'Track Shipment', 'Vault Security', 'Legal', 'Contact'].map(link => (
                   <Link key={link} to="/" className="text-sm font-light text-[#888] hover:text-white transition-colors">{link}</Link>
                 ))}
               </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-10 bg-white/5 p-12 rounded-[50px] border border-white/5">
                <div className="flex flex-col gap-4">
                   <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-white/40">The Dossier</span>
                   <p className="text-sm text-[#888] leading-relaxed">Early access to limited drops and technical updates.</p>
                </div>
                <div className="flex flex-col gap-5 border-b border-white/10 pb-4">
                   <input type="email" placeholder="Your Digital Address" className="bg-transparent border-none outline-none text-sm placeholder:text-[#333] italic" />
                   <button className="self-end text-[10px] font-mono uppercase tracking-widest text-white hover:text-[#9e9e9e] transition-colors">Authorize Subscription</button>
                </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-16 border-t border-white/5">
            <div className="flex items-center gap-8 text-[9px] font-mono uppercase tracking-[0.5em] text-[#444]">
               <span>©2026 {settings.storeName}</span>
               <span className="hidden md:block">•</span>
               <span className="hidden md:block">Privacy & Discretion</span>
            </div>
            <div className="flex items-center gap-6">
              {['Insta', 'Twit', 'Behance', 'Link'].map(social => (
                <span key={social} className="text-[9px] font-mono uppercase tracking-[0.4em] text-[#666] hover:text-white cursor-pointer transition-colors">{social}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
