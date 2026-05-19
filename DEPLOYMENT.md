# Production Deployment Guide

This document outlines the steps required to deploy the **NEXUS** application to a production environment (Vercel, Netlify, or Cloud Run).

## 1. Environment Variables

Ensure the following environment variables are configured in your deployment platform's dashboard:

### Required
- `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_`).
- `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key (starts with `pk_`).
- `GEMINI_API_KEY`: Your Google Gemini API key.
- `APP_URL`: The production URL of your application (e.g., `https://nexus.vercel.app`).

### Automatic (AI Studio handled)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_API_KEY`
- (And other Firebase config found in `firebase-applet-config.json`)

## 2. Stripe Configuration

1. Log in to the [Stripe Dashboard](https://dashboard.stripe.com/).
2. In Developers > API Keys, collect your keys.
3. In Developers > Webhooks (optional but recommended for production):
   - Add an endpoint pointing to `https://your-domain.com/api/webhook`.
   - Listen for `checkout.session.completed` events.

## 3. Firebase Security Rules

Before going live, ensure your Firestore rules are deployed:
1. Copy the contents of `firestore.rules`.
2. Go to the [Firebase Console](https://console.firebase.google.com/).
3. Navigate to Build > Firestore Database > Rules.
4. Paste the content and click **Publish**.

## 4. Vercel Deployment

If deploying to Vercel:
1. Connect your GitHub repository.
2. The `vercel.json` file is already configured for the full-stack architecture.
3. Ensure the **Build Command** is set to `npm run build`.
4. Ensure the **Output Directory** is `dist`.

## 5. Mobile & Performance Optimization

- All images are loaded with `referrerPolicy="no-referrer"` to prevent external referer leaks.
- Tailwind CSS is compiled using the latest `@tailwindcss/vite` plugin for maximum performance.
- Icons are tree-shaken from `lucide-react`.

---
*NEXUS — Minimalist Future Design Retail*
