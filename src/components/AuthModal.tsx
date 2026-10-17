import { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { Logo } from './Logo';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign in cancelled.');
      } else {
        setErrorMessage(err.message || 'Could not complete Google Sign In. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-stone-200 p-6 sm:p-8 space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Branding header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-block">
            <Logo size="lg" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight pt-2">
            Welcome to Staywise
          </h2>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Find your place directly. Connect with owners, post properties, and manage inquiries.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Value pillars */}
        <div className="space-y-2.5 bg-stone-50 p-4 rounded-2xl border border-stone-100">
          <div className="flex items-center gap-2 text-xs text-stone-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>Post unlimited free property listings</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>Receive direct inquiries from buyers and tenants</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>Zero brokerage fees — deal directly</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 px-4 rounded-2xl border-2 border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 text-stone-800 font-bold text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-sm transition-all disabled:opacity-50"
          >
            {/* Google G logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
          <span>Protected by Firebase Authentication & Secure Cloud</span>
        </div>
      </div>
    </div>
  );
}
