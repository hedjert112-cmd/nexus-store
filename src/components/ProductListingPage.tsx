import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storeService, Product, Category } from '../services/storeService';
import { ProductCard } from './ProductCard';
import { cn } from '../lib/utils';
import { ProductCardSkeleton } from './Skeleton';
import { Search, SlidersHorizontal } from 'lucide-react';

export const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          storeService.getProducts(),
          storeService.getCategories()
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by category
    if (category !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by search query
    if (query) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by price range
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Filter by rating
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // Sort
    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
       result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [category, query, products, sortBy, priceRange, minRating]);

  const setCategory = (slug: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value) {
      newParams.set('q', e.target.value);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#9e9e9e]">Shop Store</span>
            <h1 className="text-5xl font-light tracking-tight">Our Collection</h1>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9e9e9e] group-focus-within:text-black transition-colors" />
            <input 
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={handleSearch}
              className="w-full pl-11 pr-4 py-3 bg-[#f9f9f9] border border-transparent rounded-xl focus:bg-white focus:border-black outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Category & Filters */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCategory('all')}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-medium transition-all duration-300 border",
                category === 'all' 
                  ? "bg-black border-black text-white" 
                  : "bg-white border-[#f0f0f0] text-[#9e9e9e] hover:border-black hover:text-black"
              )}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.slug)}
                className={cn(
                  "px-6 py-2 rounded-full text-xs font-medium transition-all duration-300 border",
                  category === cat.slug 
                    ? "bg-black border-black text-white" 
                    : "bg-white border-[#f0f0f0] text-[#9e9e9e] hover:border-black hover:text-black"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-8 py-6 border-y border-[#f0f0f0]">
            <div className="flex flex-col gap-3 min-w-[200px]">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Price Range</span>
                <span className="text-[10px] font-mono text-black">${priceRange[0]} - ${priceRange[1]}+</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2000" 
                step="50"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-1 bg-[#f0f0f0] rounded-full appearance-none cursor-pointer accent-black" 
              />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9e9e9e]">Min Rating</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setMinRating(minRating === star ? 0 : star)}
                    className={cn(
                      "text-sm transition-colors",
                      star <= minRating ? "text-black" : "text-[#d1d1d1]"
                    )}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#f0f0f0] pb-6 gap-4">
          <p className="text-xs font-mono text-[#9e9e9e] uppercase tracking-widest">
            {loading ? 'Gathering products...' : `Showing ${filteredProducts.length} items`}
          </p>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <SlidersHorizontal size={14} className="text-[#9e9e9e]" />
                <span className="text-xs font-mono text-[#9e9e9e] uppercase tracking-widest">Sort By</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-medium outline-none cursor-pointer border-none p-0 focus:ring-0"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
             </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        {!loading && filteredProducts.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center gap-4">
            <p className="text-[#9e9e9e] font-light">No products found for your criteria.</p>
            <button 
              onClick={() => {
                setSearchParams({});
              }}
              className="text-sm font-medium underline underline-offset-4"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
