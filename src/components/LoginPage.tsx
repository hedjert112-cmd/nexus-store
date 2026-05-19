import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { AuthLayout } from './AuthLayout';
import { handleFirestoreError, OperationType } from './FirebaseContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in database
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const isAdminEmail = result.user.email === 'hedjertoumi112@gmail.com';
        await setDoc(userRef, {
          email: result.user.email,
          uid: result.user.uid,
          role: isAdminEmail ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        });
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Check if user exists in database
      const userRef = doc(db, 'users', user.uid);
      let userDoc;
      try {
        userDoc = await getDoc(userRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }

      if (!userDoc?.exists()) {
        await signOut(auth);
        setError('No account found in database. Please create a new account first.');
        setLoading(false);
        return;
      }

      // Success
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is currently disabled in Firebase. Please use Google Login instead.');
      } else {
        setError(err.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Login">
      <div className="flex flex-col gap-6">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[#f0f0f0] rounded-xl text-sm font-medium hover:bg-[#f9f9f9] transition-all"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="flex items-center gap-4 text-[#d1d1d1]">
          <div className="h-[1px] flex-1 bg-[#f0f0f0]" />
          <span className="text-[10px] font-mono uppercase tracking-widest">Or email</span>
          <div className="h-[1px] flex-1 bg-[#f0f0f0]" />
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#f9f9f9] border border-transparent rounded-xl focus:bg-white focus:border-[#1a1a1a] transition-all outline-none text-sm placeholder:text-[#d1d1d1]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d1d1d1] hover:text-[#1a1a1a] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-[#9e9e9e] hover:text-[#1a1a1a] transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-[#1a1a1a] text-white rounded-xl font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
          </button>

          <div className="text-center mt-2">
            <p className="text-xs text-[#9e9e9e]">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-[#1a1a1a] font-medium underline underline-offset-4"
              >
                Create Account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
