export const BACKEND_API_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const APP_SCHEME = process.env.EXPO_PUBLIC_SCHEME;
export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET!;
export const JWT_SECRET = process.env.EXPO_PUBLIC_JWT_SECRET!;

export const SUPABASE_STORAGE_BUCKET = "images";

// Google OAuth constants
export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_REDIRECT_URI = process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI || `${BACKEND_API_URL}/api/auth/callback`;
export const FRONTENT_REDIRECT_URL = process.env.EXPO_PUBLIC_FRONTEND_REDIRECT_URL;

// Cookie constants
export const COOKIE_NAME = "auth_token";
export const REFRESH_COOKIE_NAME = "refresh_token";
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};
export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/api/auth/refresh",
};
