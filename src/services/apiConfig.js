/**
 * Centralized API Base Configuration for Vercel & Production
 * Reads VITE_API_BASE_URL if set, with graceful fallbacks for local development
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const trimmedBase = typeof rawBaseUrl === 'string' ? rawBaseUrl.trim().replace(/\/+$/, '') : '';

// In production, if VITE_API_BASE_URL is set (e.g. https://your-backend.vercel.app), use it.
// If unset in production, use relative /api (works with single-domain rewrites or reverse proxy).
// In local development, default to http://localhost:8000.
export const API_BASE_URL = trimmedBase || (import.meta.env.DEV ? 'http://localhost:8000' : '');

export const DJANGO_DATA_URL = import.meta.env.VITE_DJANGO_DATA_URL || (API_BASE_URL ? `${API_BASE_URL}/api/data/` : '/api/data/');

export const DJANGO_AUTH_LOGIN_URL = API_BASE_URL ? `${API_BASE_URL}/api/auth/login/` : '/api/auth/login/';
export const DJANGO_AUTH_SIGNUP_URL = API_BASE_URL ? `${API_BASE_URL}/api/auth/signup/` : '/api/auth/signup/';
export const DJANGO_AUTH_VERIFY_OTP_URL = API_BASE_URL ? `${API_BASE_URL}/api/auth/verify-otp/` : '/api/auth/verify-otp/';
export const DJANGO_AUTH_RESEND_OTP_URL = API_BASE_URL ? `${API_BASE_URL}/api/auth/resend-otp/` : '/api/auth/resend-otp/';
export const DJANGO_AUTH_SOCIAL_URL = API_BASE_URL ? `${API_BASE_URL}/api/auth/social/` : '/api/auth/social/';
