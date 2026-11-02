// $20,000 Professional Authentication Engine
// Primary Authority: Supabase Auth (Registration, Passwords, Sessions & JWT Tokens)

import { supabaseAuthService } from './supabase';
import { DJANGO_AUTH_LOGIN_URL } from './apiConfig';

const AUTH_USER_KEY = 'tradetracker_auth_user_v1';
const JWT_TOKEN_KEY = 'tradetracker_jwt_token_v1';

// Password Strength Evaluator (UI Meter)
export function evaluatePasswordStrength(password = '') {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&#^()_-]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;

  let label = 'Very Weak';
  let color = '#EF4444'; // Red

  if (score === 5) {
    label = 'Strong';
    color = '#10B981'; // Emerald
  } else if (score >= 4) {
    label = 'Good';
    color = '#38BDF8'; // Cyan
  } else if (score >= 3) {
    label = 'Fair';
    color = '#F59E0B'; // Amber
  }

  return { score, label, color, checks };
}

export const authService = {
  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(AUTH_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  restoreSession: async () => {
    // 1. If session already restored locally, preserve it
    const localUser = authService.getCurrentUser();
    
    try {
      const session = await supabaseAuthService.getSession();
      if (session?.user && session.token) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
        localStorage.setItem(JWT_TOKEN_KEY, session.token);
        return session.user;
      }
    } catch (e) {
      // Supabase unavailable
    }

    if (localUser) {
      return localUser;
    }

    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(JWT_TOKEN_KEY);
    return null;
  },

  getToken: () => {
    return localStorage.getItem(JWT_TOKEN_KEY) || null;
  },

  // 1. LOGIN: Primary Authority Supabase Auth with Local Server Fallback
  login: async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Please enter both email address and password.' };
    }

    // A. Primary Authority: Supabase Auth (with fast timeout)
    try {
      const supaRes = await supabaseAuthService.signIn({ email: cleanEmail, password: cleanPassword });
      if (supaRes.success && supaRes.user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(supaRes.user));
        if (supaRes.token) {
          localStorage.setItem(JWT_TOKEN_KEY, supaRes.token);
        }
        return { success: true, user: supaRes.user, token: supaRes.token };
      }
    } catch (e) {
      // Network/Supabase unreachable or timed out, try local backend
    }

    // B. Secondary Authority: Backend Django Server Fallback
    try {
      const backendRes = await fetch(DJANGO_AUTH_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const backendData = await backendRes.json();
      if (backendRes.ok && backendData.success && backendData.user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(backendData.user));
        if (backendData.token) localStorage.setItem(JWT_TOKEN_KEY, backendData.token);
        return { success: true, user: backendData.user, token: backendData.token };
      }
    } catch (e) {}

    // C. Tertiary Authority: Local Node Server Fallback (port 3001)
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      try {
        const nodeRes = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
        });
        const nodeData = await nodeRes.json();
        if (nodeRes.ok && nodeData.success && nodeData.user) {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nodeData.user));
          if (nodeData.token) localStorage.setItem(JWT_TOKEN_KEY, nodeData.token);
          return { success: true, user: nodeData.user, token: nodeData.token };
        }
      } catch (e) {}
    }

    return { success: false, error: 'Invalid email or password. You can also use 1-Click Demo Access below.' };
  },

  loginDemo: async () => {
    const demoUser = {
      id: "eda41f71-e6d7-40b9-a2d3-91c75eb5fd79",
      full_name: "Varma Vegesna",
      username: "varma",
      email: "varmavegesna093@gmail.com",
      plan: "Premium Plan",
      is_verified: true
    };
    const demoToken = 'demo-jwt-token-' + Date.now();
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(demoUser));
    localStorage.setItem(JWT_TOKEN_KEY, demoToken);
    return { success: true, user: demoUser, token: demoToken };
  },

  signInWithOAuth: async (provider) => supabaseAuthService.signInWithOAuth(provider),

  onAuthStateChange: (callback) => {
    return supabaseAuthService.onAuthStateChange((event, authData) => {
      if (authData?.user && authData?.token) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authData.user));
        localStorage.setItem(JWT_TOKEN_KEY, authData.token);
        callback(event, authData.user);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(JWT_TOKEN_KEY);
        callback(event, null);
      }
    });
  },

  resetPassword: async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) return { success: false, error: 'Please enter your email address.' };
    return supabaseAuthService.resetPassword(cleanEmail);
  },

  // 2. SIGNUP: Registration & Passwords via Supabase Auth
  signup: async (full_name, username, email, password) => {
    const cleanName = (full_name || '').trim();
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanName || !cleanUsername || !cleanEmail || !cleanPassword) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const { score } = evaluatePasswordStrength(cleanPassword);
    if (score < 5) {
      return { 
        success: false, 
        error: 'Password must contain at least 8 characters, uppercase, lowercase, number, and special character.' 
      };
    }

    // A. Primary Authority: Supabase Registration & Passwords
    const supaRes = await supabaseAuthService.signUp({
      email: cleanEmail,
      password: cleanPassword,
      fullName: cleanName,
      username: cleanUsername
    });

    if (!supaRes.success) {
      return { success: false, error: supaRes.error || 'Registration failed. Please try again.' };
    }

    return {
      success: true,
      requiresVerification: supaRes.requiresVerification,
      email: cleanEmail,
      message: supaRes.requiresVerification
        ? 'Account registered. Please enter the verification code sent to your email.'
        : 'Account registered successfully.'
    };
  },

  // 3. OTP VERIFICATION: Verified via Supabase Auth
  verifyOTP: async (email, otpCode) => {
    // A. Supabase OTP Verification
    const supaRes = await supabaseAuthService.verifyOtp({ email, token: otpCode });
    if (supaRes.success && supaRes.user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(supaRes.user));
      if (supaRes.token) localStorage.setItem(JWT_TOKEN_KEY, supaRes.token);
      return { success: true, user: supaRes.user, token: supaRes.token };
    }

    return { success: false, error: supaRes.error || 'Invalid or expired verification code.' };
  },

  resendOTP: async (email) => {
    return supabaseAuthService.resendOtp(email);
  },

  // 4. LOGOUT: Clears Supabase Auth Session
  logout: async () => {
    await supabaseAuthService.signOut();
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(JWT_TOKEN_KEY);
  }
};
