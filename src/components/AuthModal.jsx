import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Zap, 
  Loader2, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  AtSign
} from 'lucide-react';
import { authService, evaluatePasswordStrength } from '../services/auth';
import { EmailVerificationModal } from './EmailVerificationModal';

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP Verification Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [initialOtpCode, setInitialOtpCode] = useState('');

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const passwordStrength = evaluatePasswordStrength(password);

  const resetMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    try {
      const res = await authService.login(email, password);
      if (res.success) {
        onAuthSuccess(res.user);
        onClose();
      } else if (res.requiresVerification) {
        setPendingVerificationEmail(res.email);
        setInitialOtpCode(res.otpCode || '');
        setIsOtpModalOpen(true);
      } else {
        setErrorMessage(res.error);
      }
    } catch (err) {
      setErrorMessage('Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms & Conditions to create an account.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password fields.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.signup(fullName, username, email, password);
      if (res.success) {
        setPendingVerificationEmail(res.email);
        setInitialOtpCode(res.otpCode || '');
        setIsOtpModalOpen(true);
      } else {
        setErrorMessage(res.error);
      }
    } catch (err) {
      setErrorMessage('Registration error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    resetMessages();
    const res = await authService.resetPassword(email);
    setIsLoading(false);
    if (res.success) {
      setSuccessMessage('If an account exists for that email, a password reset link has been sent.');
    } else {
      setErrorMessage(res.error || 'Unable to send password reset email.');
    }
  };

  const handleSocialAuth = async (provider) => {
    resetMessages();
    setIsLoading(true);
    const res = await authService.signInWithOAuth(provider.toLowerCase());
    if (res.success && res.user) {
      onAuthSuccess(res.user);
      onClose();
      setIsLoading(false);
    } else if (res.success) {
      // Browser is redirecting to the OAuth consent page
    } else {
      setErrorMessage(res.error || 'Social sign-in is unavailable.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    resetMessages();
    setIsLoading(true);
    const res = await authService.loginDemo();
    if (res.success && res.user) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setErrorMessage(res.error || 'Failed to initialize demo account.');
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg overflow-y-auto font-sans">
        <div className="bg-[#0B0F19] rounded-3xl max-w-md w-full border border-[#1E2638] shadow-2xl overflow-hidden transform transition-all text-slate-100 p-6 lg:p-7 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
                <BrandLogo className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#0284C7] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#38BDF8] dark:to-[#0284C7] font-brand tracking-tight">
                  Trading Journal
                </h2>
                <p className="text-xs text-slate-400">
                  {mode === 'login' 
                    ? 'Welcome back to your trading terminal' 
                    : mode === 'signup' 
                    ? 'Create your $20,000 professional account' 
                    : 'Reset your terminal password'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#111726] border border-[#1E2638] text-slate-400 hover:text-white hover:bg-[#1E2638] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Segmented Controls (Log In / Sign Up) */}
          {mode !== 'forgot' && (
            <div className="p-1 bg-[#111726] rounded-2xl border border-[#1E2638] grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => { setMode('login'); resetMessages(); }}
                className={`py-2.5 text-xs font-extrabold rounded-xl transition font-jakarta ${
                  mode === 'login'
                    ? 'bg-[#38BDF8] text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Log In
              </button>

              <button
                type="button"
                onClick={() => { setMode('signup'); resetMessages(); }}
                className={`py-2.5 text-xs font-extrabold rounded-xl transition font-jakarta ${
                  mode === 'signup'
                    ? 'bg-[#38BDF8] text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2">
              <span className="shrink-0 font-bold">⚠️ Error:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Email */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Username@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#111726] text-[#38BDF8] text-xs rounded-xl border border-[#1E2638] font-bold focus:outline-none focus:border-[#38BDF8]"
                    required
                  />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8]">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); resetMessages(); }}
                    className="text-[11px] font-bold text-[#38BDF8] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#111726] text-white text-xs rounded-xl border border-[#1E2638] font-bold focus:outline-none focus:border-[#38BDF8]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-[#38BDF8] focus:ring-0"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-400 cursor-pointer select-none font-medium">
                  Remember me on this browser session
                </label>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#111726] text-white text-xs rounded-xl border border-[#1E2638] font-bold focus:outline-none focus:border-[#38BDF8]"
                    required
                  />
                </div>
              </div>

              {/* Unique Username */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8] mb-1">
                  Username * (Unique Trader Handle)
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="trader_pro"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#111726] text-white text-xs rounded-xl border border-[#1E2638] font-bold focus:outline-none focus:border-[#38BDF8] font-mono"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Username@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#111726] text-white text-xs rounded-xl border border-[#1E2638] font-bold focus:outline-none focus:border-[#38BDF8]"
                    required
                  />
                </div>
              </div>

              {/* Password & Password Strength Indicator */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8] mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#111726] text-white text-xs rounded-xl border border-[#1E2638] font-bold focus:outline-none focus:border-[#38BDF8]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength Meter Bar & Rules Checklist */}
                {password.length > 0 && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-[#111726] border border-[#1E2638] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-bold">Password Strength:</span>
                      <span className="font-extrabold font-mono" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>

                    {/* Meter Bar */}
                    <div className="w-full h-1.5 bg-[#0B0F19] rounded-full overflow-hidden flex space-x-1">
                      {[1, 2, 3, 4, 5].map(step => (
                        <div
                          key={step}
                          className="flex-1 h-full rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: step <= passwordStrength.score ? passwordStrength.color : '#1E2638'
                          }}
                        />
                      ))}
                    </div>

                    {/* Requirements Grid */}
                    <div className="grid grid-cols-2 gap-1 text-[10px] pt-1">
                      <span className={passwordStrength.checks.length ? 'text-[#10B981]' : 'text-slate-500'}>
                        {passwordStrength.checks.length ? '✓' : '•'} 8+ Characters
                      </span>
                      <span className={passwordStrength.checks.uppercase ? 'text-[#10B981]' : 'text-slate-500'}>
                        {passwordStrength.checks.uppercase ? '✓' : '•'} Uppercase Letter
                      </span>
                      <span className={passwordStrength.checks.lowercase ? 'text-[#10B981]' : 'text-slate-500'}>
                        {passwordStrength.checks.lowercase ? '✓' : '•'} Lowercase Letter
                      </span>
                      <span className={passwordStrength.checks.number ? 'text-[#10B981]' : 'text-slate-500'}>
                        {passwordStrength.checks.number ? '✓' : '•'} Number (0-9)
                      </span>
                      <span className={`col-span-2 ${passwordStrength.checks.special ? 'text-[#10B981]' : 'text-slate-500'}`}>
                        {passwordStrength.checks.special ? '✓' : '•'} Special Character (@$!%*?&#)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8] mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#111726] text-white text-xs rounded-xl border border-[#1E2638] font-bold focus:outline-none focus:border-[#38BDF8]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded bg-slate-800 border-slate-700 text-[#38BDF8] focus:ring-0"
                  required
                />
                <label htmlFor="agreeTerms" className="text-xs text-slate-400 leading-normal select-none">
                  I agree to the <span className="text-[#38BDF8] font-bold">Terms of Service</span> and <span className="text-[#38BDF8] font-bold">Privacy Policy</span>.
                </label>
              </div>

              {/* Create Account CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Create Account & Verify</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8] mb-1">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Username@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#111726] text-white text-xs rounded-xl border border-[#1E2638] font-bold focus:outline-none focus:border-[#38BDF8]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#38BDF8] to-[#0284C7] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition"
              >
                Send Password Reset Link
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); resetMessages(); }}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-white"
              >
                ← Back to Login
              </button>
            </form>
          )}

          {/* Social Logins Divider (Google & GitHub) */}
          {mode !== 'forgot' && (
            <div className="space-y-4 pt-2">
              <div className="relative flex items-center">
                <div className="h-[1px] bg-[#1E2638] w-full" />
                <span className="px-3 bg-[#0B0F19] text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
                  Or Continue With
                </span>
                <div className="h-[1px] bg-[#1E2638] w-full" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Google')}
                  className="py-2.5 px-4 bg-[#111726] hover:bg-[#1E2638] text-slate-200 font-bold text-xs rounded-xl border border-[#1E2638] transition flex items-center justify-center space-x-2 hover:border-[#38BDF8]/40"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialAuth('GitHub')}
                  className="py-2.5 px-4 bg-[#111726] hover:bg-[#1E2638] text-slate-200 font-bold text-xs rounded-xl border border-[#1E2638] transition flex items-center justify-center space-x-2 hover:border-[#38BDF8]/40"
                >
                  <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* 1-Click Demo / Offline Access */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-sky-500/10 hover:from-emerald-500/20 hover:to-sky-500/20 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>⚡ 1-Click Demo Access (varmavegesna093@gmail.com)</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Interactive OTP Email Verification Dialog Modal */}
      <EmailVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={pendingVerificationEmail}
        initialOtpCode={initialOtpCode}
        onVerificationSuccess={(verifiedUser) => {
          onAuthSuccess(verifiedUser);
          onClose();
        }}
      />
    </>
  );
}
