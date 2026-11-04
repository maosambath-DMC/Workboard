import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Cloud, 
  CheckCircle, 
  LogOut, 
  Sparkles,
  Smartphone,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    currentUser, 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    signIn, 
    signUp, 
    signInWithGoogle, 
    signOut,
    syncStatus 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (mode === 'signup') {
      if (!email || !password || !displayName) {
        setErrorMessage('Please fill in all fields.');
        setLoading(false);
        return;
      }
      const res = await signUp(email.trim(), password, displayName.trim());
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to sign up.');
      } else {
        setIsAuthModalOpen(false);
      }
    } else {
      if (!email || !password) {
        setErrorMessage('Please enter email and password.');
        setLoading(false);
        return;
      }
      const res = await signIn(email.trim(), password);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid credentials.');
      } else {
        setIsAuthModalOpen(false);
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setLoading(true);
    const res = await signInWithGoogle();
    if (!res.success) {
      setErrorMessage(res.error || 'Google sign-in was not completed.');
    } else {
      setIsAuthModalOpen(false);
    }
    setLoading(false);
  };

  const isUserLoggedIn = currentUser && !currentUser.isGuest;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden relative animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* If Already Logged In: Show Account Details */}
        {isUserLoggedIn ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xl font-black shadow-inner">
                {currentUser.avatar || '✨'}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {currentUser.displayName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentUser.email}
                </p>
              </div>
            </div>

            {/* Cloud Sync Status Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span>Cloud Sync Active</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your whiteboards and canvas ideas are automatically saved. Log into this account on your iPhone, iPad, or laptop to access your projects anywhere!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-md transition-all"
              >
                Continue Working
              </button>
              <button
                onClick={async () => {
                  await signOut();
                  setIsAuthModalOpen(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/20">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                {mode === 'signin' ? 'Sign In to Kitsune' : 'Create an Account'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Save your progress on the web & continue seamlessly on iPad, iPhone, and Mac
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-5">
              <button
                onClick={() => { setMode('signin'); setErrorMessage(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setErrorMessage(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign Up Free
              </button>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs border border-red-200 dark:border-red-900">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Your Name / Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In & Sync' : 'Create Free Account'}
              </button>
            </form>

            {/* Cross Device Perks */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-center text-[10px] text-slate-500 dark:text-slate-400">
              <div className="flex flex-col items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-purple-500" />
                <span>iPhone & iPad</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-sky-500" />
                <span>Auto Cloud Sync</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Free Spark</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
