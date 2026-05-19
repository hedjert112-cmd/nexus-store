import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storeService, Product } from '../services/storeService';
import { formatPrice, cn } from '../lib/utils';
import { useCart } from './CartContext';
import { useAuth } from './FirebaseContext';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowLeft, Star, Shield, Truck, RotateCcw, Heart, Loader2, Send, Plus } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { toast } from 'sonner';
import { Skeleton } from './Skeleton';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const prodData = await storeService.getProduct(id);
        
        if (prodData) {
          setProduct(prodData);
          
          // Fetch related products and reviews in parallel
          const [reviewsData, allProducts] = await Promise.all([
            storeService.getReviews(id),
            storeService.getProducts()
          ]);
          
          setReviews(reviewsData);
          setRelatedProducts(
            allProducts
              .filter(p => p.category === prodData.category && p.id !== id)
              .slice(0, 4)
          );
          
          if (user) {
            const wishlist = await storeService.getWishlist(user.uid);
            setIsWishlisted(wishlist.includes(id));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product as any);
      toast.success(`Acquired ${product.name}`, {
        description: "Added to your personal vault.",
        icon: <Plus className="w-4 h-4" />
      });
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to use wishlist');
      return;
    }
    if (!id) return;
    try {
      const added = await storeService.toggleWishlist(user.uid, id);
      setIsWishlisted(added);
      toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }
    if (!id || !product) return;
    
    setSubmittingReview(true);
    try {
      await storeService.addReview(
        id, 
        user.uid, 
        user.displayName || user.email?.split('@')[0] || 'User', 
        rating, 
        comment
      );
      setComment('');
      setRating(5);
      toast.success('Review submitted successfully');
      
      // Refresh reviews
      const freshReviews = await storeService.getReviews(id);
      setReviews(freshReviews);
      
      // Refresh product for updated rating
      const freshProduct = await storeService.getProduct(id);
      if (freshProduct) setProduct(freshProduct);
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col gap-12">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24">
          <Skeleton className="aspect-[4/5] rounded-[40px]" />
          <div className="flex flex-col gap-8">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-16 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 px-6 h-screen flex flex-col items-center justify-center gap-6">
        <h2 className="text-2xl font-light">Product not found</h2>
        <button onClick={() => navigate('/products')} className="text-sm underline">Return to store</button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <button 
        onClick={() => navigate('/products')}
        className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#9e9e9e] hover:text-black transition-colors mb-12"
      >
        <ArrowLeft size={16} /> Back to Collection
      </button>

      <div className="grid lg:grid-cols-2 gap-16 xl:gap-24">
        {/* Images */}
        <div className="flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[4/5] bg-[#f9f9f9] rounded-[40px] overflow-hidden"
          >
            <img 
              src={product.images[selectedImage]} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-8 py-4">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#9e9e9e]">{product.category}</span>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl font-light tracking-tight text-black">{product.name}</h1>
              <button 
                onClick={handleToggleWishlist}
                className={cn(
                  "p-3 rounded-full border transition-all",
                  isWishlisted ? "bg-red-50 border-red-100 text-red-500" : "bg-white border-[#f0f0f0] text-[#9e9e9e] hover:border-black hover:text-black"
                )}
              >
                <Heart size={20} className={isWishlisted ? "fill-red-500" : ""} />
              </button>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={cn("fill-black", i < Math.floor(product.rating) ? "text-black" : "text-[#e5e5e5]")} 
                  />
                ))}
              </div>
              <span className="text-xs text-[#9e9e9e] font-mono">{product.reviews || 0} Reviews</span>
            </div>
          </div>

          <div className="text-2xl font-mono text-black">
            {formatPrice(product.price)}
          </div>

          <p className="text-[#9e9e9e] leading-relaxed">
            {product.description}
          </p>

          <div className="flex flex-col gap-4 pt-4">
            <button 
              onClick={handleAddToCart}
              className="w-full py-5 bg-black text-white rounded-full font-medium text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98]"
            >
              <ShoppingBag size={20} /> Add to Cart
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12 pt-12 border-t border-[#f0f0f0] mt-4">
            <div className="flex gap-4">
              <Truck size={20} className="text-black shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium">Free Shipping</span>
                <p className="text-[11px] text-[#9e9e9e]">On all orders over $150. Delivering globally with carbon-neutral transit.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <RotateCcw size={20} className="text-black shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium">30-Day Returns</span>
                <p className="text-[11px] text-[#9e9e9e]">Hassle-free returns and exchanges for up to 30 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-40">
          <div className="flex flex-col gap-6 mb-16">
            <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-[#9e9e9e]">Synergistic Assets</span>
            <h2 className="text-4xl font-light tracking-tighter italic serif text-black">Complete the Collection</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-32 pt-24 border-t border-[#f0f0f0]">
        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-light">Customer Reviews</h2>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-mono">{product.rating}</span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={cn("fill-black", i < Math.floor(product.rating) ? "text-black" : "text-[#e5e5e5]")} />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-[#9e9e9e] uppercase">Based on {product.reviews} reviews</span>
                </div>
              </div>
            </div>

            {user ? (
               <form onSubmit={handleSubmitReview} className="bg-[#f9f9f9] p-8 rounded-[32px] flex flex-col gap-6">
                 <h3 className="text-lg font-medium">Write a review</h3>
                 <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Rating</label>
                   <div className="flex items-center gap-2">
                     {[1, 2, 3, 4, 5].map((star) => (
                       <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="hover:scale-110 transition-transform"
                       >
                         <Star 
                          size={24} 
                          className={cn(star <= rating ? "text-black fill-black" : "text-[#d1d1d1]")} 
                         />
                       </button>
                     ))}
                   </div>
                 </div>
                 <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Review</label>
                   <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Share your experience..."
                    className="w-full px-4 py-3 bg-white border border-[#f0f0f0] rounded-xl text-sm outline-none focus:border-black min-h-[100px] resize-none"
                   />
                 </div>
                 <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-4 bg-black text-white rounded-full text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {submittingReview ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Post Review</>}
                 </button>
               </form>
            ) : (
              <div className="bg-[#f9f9f9] p-8 rounded-[32px] text-center flex flex-col gap-4">
                <p className="text-sm text-[#9e9e9e]">Please sign in to leave a review.</p>
                <button onClick={() => navigate('/login')} className="text-xs font-mono underline uppercase tracking-widest">Login</button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 flex flex-col gap-12">
            {reviews.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-[#f0f0f0] rounded-[32px]">
                <p className="text-sm text-[#9e9e9e] italic">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
               <div className="flex flex-col gap-12">
                 {reviews.map((review) => (
                   <div key={review.id} className="flex flex-col gap-4">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-[#f0f0f0] rounded-full flex items-center justify-center font-mono text-xs">
                           {review.userName[0].toUpperCase()}
                         </div>
                         <div className="flex flex-col">
                           <span className="text-sm font-medium">{review.userName}</span>
                           <div className="flex items-center gap-1">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={10} className={cn("fill-black", i < review.rating ? "text-black" : "text-[#e5e5e5]")} />
                             ))}
                           </div>
                         </div>
                       </div>
                       <span className="text-[10px] font-mono text-[#9e9e9e]">
                         {new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
                       </span>
                     </div>
                     <p className="text-sm text-[#9e9e9e] leading-relaxed pl-14">
                       {review.comment}
                     </p>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
