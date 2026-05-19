import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from './FirebaseContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const StripeSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const confirmOrder = async () => {
      if (!user || !sessionId || cart.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Handle demo sessions
        const isDemo = sessionId.startsWith('demo_');
        const idToCheck = isDemo ? sessionId.replace('demo_', '') : sessionId;

        // For demo sessions, we already created the order in CheckoutPage
        // We just need to find it and confirm
        const existingOrderQuery = query(
          collection(db, 'orders'), 
          where(isDemo ? '__name__' : 'stripeSessionId', '==', idToCheck)
        );
        const existingDocs = await getDocs(existingOrderQuery);
        
        if (!existingDocs.empty) {
          setOrderId(existingDocs.docs[0].id);
          clearCart();
          setLoading(false);
          return;
        }

        // Only create new order here if it's a real Stripe session that hasn't been saved yet
        if (!isDemo) {
          const orderRef = await addDoc(collection(db, 'orders'), {
            userId: user.uid,
            items: cart,
            total: cartTotal,
            status: 'processing',
            paymentStatus: 'paid',
            stripeSessionId: sessionId,
            createdAt: serverTimestamp(),
          });
          setOrderId(orderRef.id);
        }
        
        clearCart();
      } catch (err) {
        console.error('Error confirming order:', err);
      } finally {
        setLoading(false);
      }
    };

    confirmOrder();
  }, [user, sessionId, cart, cartTotal, clearCart]);

  if (!sessionId) return <Navigate to="/" />;

  return (
    <div className="pt-40 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
      {loading ? (
        <div className="flex flex-col items-center gap-6">
          <Loader2 size={48} className="animate-spin text-black" />
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#9e9e9e]">Verifying Transaction...</span>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-12 text-center"
        >
          <div className="w-32 h-32 bg-black text-white rounded-full flex items-center justify-center shadow-2xl">
            <CheckCircle2 size={64} />
          </div>
          
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl font-light tracking-tight italic serif">Order Secured.</h1>
            <p className="text-[#9e9e9e] max-w-md mx-auto leading-relaxed">
              Acquisition confirmed. Your order <span className="text-black font-mono">#{orderId?.slice(-8).toUpperCase()}</span> is currently being prepared in our lab.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
            <Link 
              to="/dashboard"
              className="px-10 py-5 bg-black text-white rounded-full text-xs font-mono uppercase tracking-widest hover:opacity-80 transition-all"
            >
              Track Order
            </Link>
            <Link 
              to="/"
              className="text-xs font-mono uppercase tracking-widest flex items-center gap-2 group"
            >
              Continue Exploring <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};
