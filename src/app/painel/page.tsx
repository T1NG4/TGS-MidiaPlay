import { redirect } from "next/navigation";
import { getMaxStorageBytes, getSiteUrl, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { VideoRow } from "@/lib/video-url";
import { PainelClient } from "./painel-client";

export const dynamic = "force-dynamic";

export default async function PainelPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("videos")
    .select("id, title, storage_path, size_bytes, mime, created_at, owner_id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Não foi possível carregar o catálogo: ${error.message}`);
  }

  return (
    <PainelClient
      initialVideos={(data ?? []) as VideoRow[]}
      maxStorageBytes={getMaxStorageBytes()}
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}
      siteUrl={getSiteUrl()}
      userEmail={user.email ?? user.id}
    />
  );
}
