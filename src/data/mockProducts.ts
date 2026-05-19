export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Nexus Alpha Headphones',
    description: 'Studio-grade wireless headphones with hybrid active noise cancellation and 40-hour battery life.',
    price: 349.99,
    category: 'Audio',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000'],
    stock: 15,
    rating: 4.8,
    reviewsCount: 124,
    isFeatured: true
  },
  {
    id: '2',
    name: 'Chronos Minimalist Watch',
    description: 'A timeless timepiece featuring a brushed stainless steel case and genuine leather strap.',
    price: 189.00,
    category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000'],
    stock: 24,
    rating: 4.9,
    reviewsCount: 89,
    isFeatured: true
  },
  {
    id: '3',
    name: 'Prism Smart Lens',
    description: 'Compact 4K smart lens with instant wireless sync and advanced optical stabilization.',
    price: 599.00,
    category: 'Tech',
    images: ['https://images.unsplash.com/photo-1526170315873-3a561628203d?q=80&w=1000'],
    stock: 8,
    rating: 4.7,
    reviewsCount: 45
  },
  {
    id: '4',
    name: 'Aether Mechanical Keyboard',
    description: 'Precision mechanical keyboard with programmable hot-swap switches and aluminum frame.',
    price: 159.00,
    category: 'Tech',
    images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1000'],
    stock: 30,
    rating: 4.9,
    reviewsCount: 230,
    isFeatured: true
  },
  {
    id: '5',
    name: 'Vantage Backpack',
    description: 'Water-resistant commuter backpack with modular compartments and magnetic buckles.',
    price: 120.00,
    category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000'],
    stock: 50,
    rating: 4.6,
    reviewsCount: 67
  }
];

export const CATEGORIES = [
  { name: 'All', slug: 'all' },
  { name: 'Tech', slug: 'tech' },
  { name: 'Audio', slug: 'audio' },
  { name: 'Accessories', slug: 'accessories' }
];
