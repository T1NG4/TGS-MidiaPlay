import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { storagePublicUrl, type VideoRow } from "@/lib/video-url";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured()) {
    notFound();
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id, title, storage_path, size_bytes, mime, created_at, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const video = data as VideoRow;
  const src = storagePublicUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    video.storage_path,
  );
  const siteUrl = getSiteUrl();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-line px-6 py-4">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          MidiaPlay
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">{video.title}</h1>
        <video
          className="w-full rounded-xl border border-line bg-black"
          controls
          playsInline
          src={src}
        />
        <div className="rounded-xl border border-line bg-panel p-4 text-sm">
          <p className="text-muted">URL para o telão do VRChat</p>
          <p className="mt-2 break-all font-mono text-xs text-accent">{src}</p>
          {siteUrl ? (
            <p className="mt-3 break-all text-xs text-muted">
              Página: {siteUrl}/v/{video.id}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
