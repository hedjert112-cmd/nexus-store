import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { formatPrice } from '../lib/utils';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="pt-40 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center gap-8 text-center min-h-[60vh]">
        <div className="w-24 h-24 bg-[#f9f9f9] rounded-full flex items-center justify-center">
          <ShoppingBag size={40} className="text-[#d1d1d1]" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-light">Your cart is empty</h2>
          <p className="text-[#9e9e9e]">It looks like you haven't added anything to your cart yet.</p>
        </div>
        <Link 
          to="/products"
          className="px-10 py-4 bg-black text-white rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
        >
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-12">
        <h1 className="text-4xl font-light tracking-tight">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                  className="flex gap-6 pb-8 border-b border-[#f0f0f0]"
                >
                  <div className="w-24 h-32 bg-[#f9f9f9] rounded-2xl overflow-hidden shrink-0">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex flex-col justify-between flex-1 py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9e9e9e]">{item.category}</span>
                        <h3 className="text-base font-medium">{item.name}</h3>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 -mr-2 text-[#9e9e9e] hover:text-black hover:bg-[#f9f9f9] rounded-full transition-all"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-4 bg-[#f9f9f9] border border-[#f0f0f0] rounded-full px-3 py-1.5 opacity-80 hover:opacity-100 transition-all">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:text-black text-[#9e9e9e] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-mono min-w-[20px] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:text-black text-[#9e9e9e] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-mono font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="bg-[#f9f9f9] rounded-[32px] p-10 h-fit flex flex-col gap-8 sticky top-32">
            <h3 className="text-xl font-light">Order Summary</h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#9e9e9e]">Subtotal</span>
                <span className="font-mono">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#9e9e9e]">Shipping</span>
                <span className="font-mono">{cartTotal > 150 ? 'Free' : formatPrice(15)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#9e9e9e]">Tax (Estimated)</span>
                <span className="font-mono">{formatPrice(cartTotal * 0.08)}</span>
              </div>
            </div>

            <div className="h-[1px] bg-[#f0f0f0]" />

            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total</span>
              <span className="text-lg font-mono font-medium">
                {formatPrice(cartTotal + (cartTotal > 150 ? 0 : 15) + (cartTotal * 0.08))}
              </span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full py-5 bg-black text-white rounded-full font-medium text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-all"
            >
              Checkout <ArrowRight size={18} />
            </button>

            <p className="text-[10px] text-center text-[#9e9e9e] leading-relaxed">
              Taxes and shipping calculated at checkout. <br /> Secure payment processing provided by Nexus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
