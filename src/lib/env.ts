import { DEFAULT_MAX_STORAGE_BYTES } from "./constants";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getMaxStorageBytes() {
  const raw = process.env.NEXT_PUBLIC_MAX_STORAGE_BYTES;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MAX_STORAGE_BYTES;
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
}
