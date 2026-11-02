import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, ShieldCheck, ArrowRight, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/auth';

export function EmailVerificationModal({ 
  isOpen, 
  onClose, 
  email, 
  initialOtpCode, 
  onVerificationSuccess 
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpCodePreview, setOtpCodePreview] = useState(initialOtpCode || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (initialOtpCode) {
      setOtpCodePreview(initialOtpCode);
    }
  }, [initialOtpCode]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const res = await authService.verifyOTP(email, fullOtp);
    setIsLoading(false);

    if (res.success) {
      onVerificationSuccess(res.user);
      onClose();
    } else {
      setErrorMessage(res.error);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setErrorMessage('');
    const res = await authService.resendOTP(email);
    if (res.success) {
      if (res.otpCode) setOtpCodePreview(res.otpCode);
      setTimer(30);
    } else {
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg overflow-y-auto font-sans">
      <div className="bg-[#0B0F19] rounded-3xl max-w-md w-full border border-[#1E2638] shadow-2xl overflow-hidden transform transition-all text-slate-100 p-6 lg:p-7 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2638] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white font-jakarta tracking-tight">
                Verify Your Account
              </h2>
              <p className="text-xs text-slate-400">
                Security OTP sent to <span className="text-[#38BDF8] font-bold">{email}</span>
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

        {/* SIMULATED VERIFICATION EMAIL NOTIFICATION BANNER */}
        {otpCodePreview && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#10B981]/15 via-[#111726] to-[#38BDF8]/15 border border-[#10B981]/40 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#10B981] flex items-center space-x-1.5 font-jakarta">
                <Mail className="w-3.5 h-3.5" />
                <span>INBOX VERIFICATION CODE</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] text-[10px] font-bold font-mono">
                REAL TIME
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-300">Your 6-digit code:</span>
              <span className="text-2xl font-extrabold font-mono tracking-widest text-emerald-400 bg-[#0B0F19] px-3 py-1 rounded-xl border border-[#10B981]/30">
                {otpCodePreview}
              </span>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2">
            <span className="shrink-0 font-bold">⚠️ Error:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 6-Digit OTP Inputs */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-center text-xs font-bold text-slate-400">
              Enter 6-Digit Security Code
            </label>

            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => inputRefs.current[idx] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  className="w-11 h-12 text-center text-xl font-extrabold font-mono bg-[#111726] text-[#38BDF8] border border-[#1E2638] rounded-xl focus:outline-none focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20 transition shadow-inner"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join('').length < 6}
            className="w-full py-3 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Activate Account</span>
              </>
            )}
          </button>
        </form>

        {/* Resend Code Footer */}
        <div className="pt-3 border-t border-[#1E2638] flex items-center justify-between text-xs text-slate-400">
          <span>Didn't receive the email?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0}
            className="text-[#38BDF8] font-bold hover:underline disabled:text-slate-600 disabled:no-underline flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
