import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { AuthLayout } from './AuthLayout';
import { handleFirestoreError, OperationType } from './FirebaseContext';
import { Loader2 } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create doc in users collection
      try {
        const isAdminEmail = user.email === 'hedjertoumi112@gmail.com';
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          uid: user.uid,
          role: isAdminEmail ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }

      await signOut(auth);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Google Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create user document in Firestore
      try {
        const isAdminEmail = user.email === 'hedjertoumi112@gmail.com';
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          uid: user.uid,
          role: isAdminEmail ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }

      // 3. Significance of request: "When creating a new account, redirect the user to the login page."
      await signOut(auth); // Sign them out first so they have to log back in
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password signup is currently disabled in Firebase. Please use Google Login instead.');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="New Account">
      <div className="flex flex-col gap-6">
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[#f0f0f0] rounded-xl text-sm font-medium hover:bg-[#f9f9f9] transition-all"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
          Sign up with Google
        </button>

        <div className="flex items-center gap-4 text-[#d1d1d1]">
          <div className="h-[1px] flex-1 bg-[#f0f0f0]" />
          <span className="text-[10px] font-mono uppercase tracking-widest">Or email</span>
          <div className="h-[1px] flex-1 bg-[#f0f0f0]" />
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 italic">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9e9e9e] px-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              className="w-full px-4 py-3 bg-[#f9f9f9] border border-transparent rounded-xl focus:bg-white focus:border-[#1a1a1a] transition-all outline-none text-sm placeholder:text-[#d1d1d1]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9e9e9e] px-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#f9f9f9] border border-transparent rounded-xl focus:bg-white focus:border-[#1a1a1a] transition-all outline-none text-sm placeholder:text-[#d1d1d1]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9e9e9e] px-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#f9f9f9] border border-transparent rounded-xl focus:bg-white focus:border-[#1a1a1a] transition-all outline-none text-sm placeholder:text-[#d1d1d1]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-[#1a1a1a] text-white rounded-xl font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
          </button>

          <div className="text-center mt-2">
            <p className="text-xs text-[#9e9e9e]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#1a1a1a] font-medium underline underline-offset-4"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
