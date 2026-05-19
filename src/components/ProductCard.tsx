import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Product } from '../services/storeService';
import { formatPrice, cn } from '../lib/utils';
import { useCart } from './CartContext';
import { Plus, Star, Heart } from 'lucide-react';
import { toast } from 'sonner';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product as any);
    toast.success(`Acquired ${product.name}`, {
      description: "Added to your personal vault.",
      icon: <Plus className="w-4 h-4" />
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link to={`/products/${product.id}`} className="flex flex-col gap-5">
        <div className="relative aspect-[4/5] bg-[#fcfcfc] rounded-[40px] overflow-hidden border border-[#f0f0f0]">
          <motion.img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute top-8 right-8 flex flex-col gap-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-[0.16,1,0.3,1]">
            <button className="p-4 bg-white/95 backdrop-blur-md rounded-full shadow-sm hover:bg-black hover:text-white transition-all scale-90 hover:scale-100">
              <Heart size={16} />
            </button>
            <button 
              onClick={handleAddToCart}
              className="p-4 bg-white/95 backdrop-blur-md rounded-full shadow-sm hover:bg-black hover:text-white transition-all scale-90 hover:scale-100"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="absolute bottom-8 left-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
             <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-mono uppercase tracking-[0.2em] border border-black/5">Quick View</span>
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-8 left-8">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full border border-orange-100">
                <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-mono text-orange-600 uppercase tracking-widest font-semibold">Low Inventory</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5 px-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] font-mono text-[#9e9e9e] uppercase tracking-[0.3em] overflow-hidden truncate">{product.category}</span>
              <h3 className="text-sm font-medium text-black group-hover:opacity-60 transition-opacity truncate">{product.name}</h3>
            </div>
            <p className="text-xs font-mono font-medium shrink-0">{formatPrice(product.price)}</p>
          </div>
          
          <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={8} 
                  className={cn(i < Math.floor(product.rating) ? "text-black fill-black" : "text-[#e5e5e5] fill-[#e5e5e5]")} 
                />
              ))}
            </div>
            <span className="text-[8px] font-mono text-[#9e9e9e] uppercase tracking-widest leading-none">Verified quality</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
