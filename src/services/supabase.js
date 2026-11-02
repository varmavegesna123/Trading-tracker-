import { createClient } from '@supabase/supabase-js';

// Supabase Environment Credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be configured.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'tradetracker_supabase_auth_session'
  }
});

// Resilient network timeout wrapper to prevent browser hanging on paused/unreachable Supabase projects
const SUPABASE_TIMEOUT_MS = 2500;

function withTimeout(promise, ms = SUPABASE_TIMEOUT_MS, errorMsg = 'Supabase network timeout') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
}

// Primary Supabase Authentication Service
export const supabaseAuthService = {
  // 1. User Registration via Supabase Auth
  signUp: async ({ email, password, fullName, username }) => {
    try {
      const { data, error } = await withTimeout(supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            username: username.trim().toLowerCase()
          }
        }
      }));

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        requiresVerification: !data.session,
        email: email.trim().toLowerCase()
      };
    } catch (err) {
      return { success: false, error: err.message || 'Supabase Registration Error' };
    }
  },

  // 2. Sign-In with Password via Supabase Auth
  signIn: async ({ email, password }) => {
    try {
      const { data, error } = await withTimeout(supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim()
      }), 2500, 'Supabase network timeout');

      if (error) {
        return { success: false, error: error.message };
      }

      const user = data.user;
      const sessionUser = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        username: user.user_metadata?.username || user.email.split('@')[0],
        email: user.email,
        plan: 'Premium Plan',
        is_verified: true
      };

      return {
        success: true,
        user: sessionUser,
        token: data.session?.access_token,
        session: data.session
      };
    } catch (err) {
      return { success: false, error: err.message || 'Supabase Login Error' };
    }
  },

  signInWithOAuth: async (provider) => {
    try {
      const { data, error } = await withTimeout(supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      }), 2500, 'Supabase network timeout');
      if (error) return { success: false, error: error.message };
      if (data?.url) {
        window.location.assign(data.url);
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'OAuth sign-in failed.' };
    }
  },

  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Unable to send password reset email.' };
    }
  },

  // 3. Email OTP Verification via Supabase Auth
  verifyOtp: async ({ email, token }) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: 'signup'
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const user = data.user;
      const sessionUser = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        username: user.user_metadata?.username || user.email.split('@')[0],
        email: user.email,
        plan: 'Premium Plan',
        is_verified: true
      };

      return {
        success: true,
        user: sessionUser,
        token: data.session?.access_token,
        session: data.session
      };
    } catch (err) {
      return { success: false, error: err.message || 'Supabase OTP Verification Error' };
    }
  },

  resendOtp: async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase()
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Unable to resend verification code.' };
    }
  },

  // 4. Session Retrieval & JWT Token Access
  getSession: async () => {
    try {
      const { data, error } = await withTimeout(supabase.auth.getSession(), 1500, 'Session timeout');
      if (error || !data.session) return null;

      const user = data.session.user;
      return {
        token: data.session.access_token,
        user: {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
          username: user.user_metadata?.username || user.email.split('@')[0],
          email: user.email,
          plan: 'Premium Plan',
          is_verified: true
        }
      };
    } catch (err) {
      return null;
    }
  },

  // 5. Sign-Out & Session Clearance
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      return { success: true };
    } catch (err) {
      return { success: true };
    }
  },

  // 6. Realtime Auth State Listener (for OAuth redirect callbacks & session refreshes)
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user = session.user;
        const sessionUser = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
          username: user.user_metadata?.username || user.email.split('@')[0],
          email: user.email,
          plan: 'Premium Plan',
          is_verified: true
        };
        callback(event, { user: sessionUser, session, token: session.access_token });
      } else {
        callback(event, null);
      }
    });
  }
};

export const supabaseAuth = supabaseAuthService;
