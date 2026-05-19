import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { AuthLayout } from './AuthLayout';
import { Loader2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Recover Access">
      <div className="flex flex-col gap-6">
        <Link 
          to="/login" 
          className="flex items-center gap-2 text-xs text-[#9e9e9e] hover:text-[#1a1a1a] transition-colors w-fit"
        >
          <ArrowLeft size={14} /> Back to Login
        </Link>

        <p className="text-sm text-[#9e9e9e] leading-relaxed">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleReset} className="flex flex-col gap-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 italic">
              {error}
            </div>
          )}
          {message && (
            <div className="p-4 bg-green-50 text-green-600 text-sm rounded-xl border border-green-100 italic">
              {message}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#1a1a1a] text-white rounded-xl font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};
