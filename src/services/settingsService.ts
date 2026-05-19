import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SiteSettings {
  storeName: string;
  logo: string;
  brandColor: string;
  accentColor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  announcement: {
    show: boolean;
    text: string;
    link?: string;
  };
  contactEmail: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    behance?: string;
  };
}

const DEFAULT_SETTINGS: SiteSettings = {
  storeName: 'NEXUS',
  logo: '',
  brandColor: '#000000',
  accentColor: '#666666',
  heroTitle: 'Redefining Minimal.',
  heroSubtitle: 'Experience the nexus of technology and elevated aesthetics.',
  heroImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000',
  announcement: {
    show: true,
    text: 'Free shipping on all orders over $250 — Shop now',
    link: '/products'
  },
  contactEmail: 'concierge@nexus.com',
  socialLinks: {
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
    behance: 'https://behance.net'
  }
};

const SETTINGS_ID = 'global';

export const settingsService = {
  async getSettings(): Promise<SiteSettings> {
    const docRef = doc(db, 'settings', SETTINGS_ID);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return snap.data() as SiteSettings;
  },

  async updateSettings(settings: Partial<SiteSettings>) {
    const docRef = doc(db, 'settings', SETTINGS_ID);
    await setDoc(docRef, settings, { merge: true });
  },

  subscribeToSettings(callback: (settings: SiteSettings) => void) {
    return onSnapshot(doc(db, 'settings', SETTINGS_ID), (doc) => {
      if (doc.exists()) {
        callback(doc.data() as SiteSettings);
      } else {
        callback(DEFAULT_SETTINGS);
      }
    });
  }
};
