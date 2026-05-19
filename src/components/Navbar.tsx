import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, LogOut, Search, BarChart3 } from 'lucide-react';
import { useAuth } from './FirebaseContext';
import { useCart } from './CartContext';
import { useSettings } from './SettingsContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (!settings) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {settings.announcement.show && (
        <div className="bg-black text-white py-2 px-6 text-center overflow-hidden">
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-[10px] font-mono uppercase tracking-[0.3em]"
          >
            {settings.announcement.link ? (
              <Link to={settings.announcement.link} className="hover:opacity-80">
                {settings.announcement.text}
              </Link>
            ) : (
              settings.announcement.text
            )}
          </motion.div>
        </div>
      )}
      <nav className="bg-white/80 backdrop-blur-md border-b border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-medium tracking-tight flex items-center gap-3">
            {settings.logo ? (
              <img src={settings.logo} alt={settings.storeName} className="h-8 w-auto" />
            ) : (
              <div className="w-8 h-8 bg-black rounded-lg" style={{ backgroundColor: settings.brandColor }} />
            )}
            <span className="tracking-tighter">{settings.storeName}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <Link to="/products" className="text-sm text-[#9e9e9e] hover:text-black transition-colors">Store</Link>
            <Link to="/products?category=audio" className="text-sm text-[#9e9e9e] hover:text-black transition-colors">Audio</Link>
            <Link to="/products?category=wearables" className="text-sm text-[#9e9e9e] hover:text-black transition-colors">Wearables</Link>
          </div>

          <div className="flex items-center gap-6">
            <button className="hidden sm:block text-[#9e9e9e] hover:text-black transition-colors" aria-label="Search">
              <Search size={20} />
            </button>
            
            <Link to="/cart" className="relative group" aria-label={`Cart with ${cartCount} items`}>
              <ShoppingBag size={22} className="text-[#9e9e9e] group-hover:text-black transition-colors" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center font-mono"
                  style={{ backgroundColor: settings.brandColor }}
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-6">
                <Link to="/dashboard" aria-label="Dashboard">
                  <User size={22} className="text-[#9e9e9e] hover:text-black transition-colors" />
                </Link>
                {user.email === 'hedjertoumi112@gmail.com' && (
                   <Link to="/admin" className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9e9e9e] hover:text-black border border-[#f0f0f0] px-3 py-1 rounded-full hover:border-black transition-all">Admin</Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-[#9e9e9e] hover:text-black transition-colors"
                  aria-label="Log out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="hidden sm:block text-xs font-mono uppercase tracking-[0.2em] text-[#9e9e9e] hover:text-black transition-colors"
              >
                Entrance
              </Link>
            )}

            <button 
              className="md:hidden p-2 hover:bg-[#f9f9f9] rounded-full transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[#f0f0f0] bg-white overflow-hidden"
            >
              <div className="px-6 py-10 flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  <Link 
                    to="/products" 
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-light tracking-tight hover:italic serif transition-all"
                  >
                    Collection
                  </Link>
                  <Link 
                    to="/products?category=audio" 
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-light tracking-tight hover:italic serif transition-all"
                  >
                    Audio
                  </Link>
                  <Link 
                    to="/products?category=wearables" 
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-light tracking-tight hover:italic serif transition-all"
                  >
                    Wearables
                  </Link>
                </div>

                <div className="h-px bg-[#f0f0f0] w-full" />

                <div className="flex flex-col gap-6">
                  {user ? (
                    <>
                      <Link 
                        to="/dashboard" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 text-sm font-light text-[#666]"
                      >
                        <User size={18} /> Profile Dashboard
                      </Link>
                      {user.email === 'hedjertoumi112@gmail.com' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 text-sm font-light text-[#666]"
                        >
                          <BarChart3 size={18} /> Admin Panel
                        </Link>
                      )}
                      <button 
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 text-sm font-light text-red-500"
                      >
                        <LogOut size={18} /> Terminate Session
                      </button>
                    </>
                  ) : (
                    <Link 
                      to="/login" 
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-mono uppercase tracking-[0.3em]"
                    >
                      Member Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
};
