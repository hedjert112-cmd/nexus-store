import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  increment,
  limit,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MOCK_PRODUCTS as mockProducts } from '../data/mockProducts';

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  reviewsCount: number;
  features?: string[];
  isFeatured?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
}

export const storeService = {
  // --- Products ---
  async getProducts() {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  },

  async getFeaturedProducts() {
    const q = query(
      collection(db, 'products'), 
      where('isFeatured', '==', true),
      limit(8)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  },

  async getProduct(id: string) {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  },

  async addProduct(product: Omit<Product, 'id'>) {
    return await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  async updateProduct(id: string, product: Partial<Product>) {
    const docRef = doc(db, 'products', id);
    return await updateDoc(docRef, {
      ...product,
      updatedAt: serverTimestamp()
    });
  },

  async deleteProduct(id: string) {
    const docRef = doc(db, 'products', id);
    return await deleteDoc(docRef);
  },

  // --- Categories ---
  async getCategories() {
    const snapshot = await getDocs(collection(db, 'categories'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  },

  // --- Wishlist ---
  async toggleWishlist(userId: string, productId: string) {
    const wishlistRef = doc(db, 'wishlists', userId);
    const wishlistSnap = await getDoc(wishlistRef);
    
    if (!wishlistSnap.exists()) {
      await setDoc(wishlistRef, { productIds: [productId] });
      return true;
    } else {
      const data = wishlistSnap.data();
      const productIds = data.productIds || [];
      const index = productIds.indexOf(productId);
      
      let newProductIds;
      if (index === -1) {
        newProductIds = [...productIds, productId];
      } else {
        newProductIds = productIds.filter((id: string) => id !== productId);
      }
      
      await updateDoc(wishlistRef, { productIds: newProductIds });
      return index === -1; // returns true if added
    }
  },

  async getWishlist(userId: string) {
    const wishlistRef = doc(db, 'wishlists', userId);
    const wishlistSnap = await getDoc(wishlistRef);
    if (wishlistSnap.exists()) {
      return (wishlistSnap.data().productIds || []) as string[];
    }
    return [];
  },

  // --- Reviews ---
  async addReview(productId: string, userId: string, userName: string, rating: number, comment: string) {
    const reviewData = {
      productId,
      userId,
      userName,
      rating,
      comment,
      createdAt: serverTimestamp()
    };
    
    await addDoc(collection(db, 'reviews'), reviewData);
    
    // Update product rating (simple averaging for demo, ideally cloud function)
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      const p = productSnap.data();
      const newReviewsCount = (p.reviewsCount || 0) + 1;
      const newRating = ((p.rating || 0) * (p.reviewsCount || 0) + rating) / newReviewsCount;
      
      await updateDoc(productRef, {
        rating: Math.round(newRating * 10) / 10,
        reviewsCount: newReviewsCount
      });
    }
  },

  async getReviews(productId: string) {
    const q = query(
      collection(db, 'reviews'), 
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // --- Seeding ---
  async seedStore() {
    try {
      const prodSnap = await getDocs(collection(db, 'products'));
      if (prodSnap.empty) {
        console.log('Seeding products...');
        for (const p of mockProducts) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...prodData } = p;
          await addDoc(collection(db, 'products'), {
            ...prodData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }

      const catSnap = await getDocs(collection(db, 'categories'));
      if (catSnap.empty) {
        console.log('Seeding categories...');
        const categories = [
          { name: 'Audio', slug: 'audio' },
          { name: 'Wearables', slug: 'wearables' },
          { name: 'Computing', slug: 'computing' },
          { name: 'Home', slug: 'home' }
        ];
        for (const c of categories) {
          await addDoc(collection(db, 'categories'), c);
        }
      }
    } catch (err: any) {
      // Permission denied is expected if not logged in or not admin
      if (err.code === 'permission-denied') {
        console.log('Seeding skipped (insufficient permissions)');
      } else {
        console.error('Seeding error:', err);
      }
    }
  }
};
