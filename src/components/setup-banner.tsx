import { isSupabaseConfigured } from "@/lib/env";

export function SetupBanner() {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="border-b border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
      Configure <code className="font-mono">.env.local</code> com as chaves do
      Supabase. Veja o README.
    </div>
  );
}
