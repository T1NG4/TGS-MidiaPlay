"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ACCEPTED_VIDEO_TYPES, VIDEO_BUCKET } from "@/lib/constants";
import { formatBytes, formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { uploadResumable } from "@/lib/upload-resumable";
import { storagePublicUrl, type VideoRow, watchPath } from "@/lib/video-url";

function fileExtension(name: string) {
  const match = name.toLowerCase().match(/\.[a-z0-9]+$/);
  return match?.[0] ?? ".mp4";
}

export function PainelClient({
  initialVideos,
  maxStorageBytes,
  supabaseUrl,
  siteUrl,
  userEmail,
}: {
  initialVideos: VideoRow[];
  maxStorageBytes: number;
  supabaseUrl: string;
  siteUrl: string;
  userEmail: string;
}) {
  const router = useRouter();
  const [videos, setVideos] = useState(initialVideos);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const usedBytes = useMemo(
    () => videos.reduce((sum, video) => sum + video.size_bytes, 0),
    [videos],
  );
  const usageRatio = Math.min(usedBytes / maxStorageBytes, 1);

  async function copyText(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1800);
  }

  async function onLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function onUpload(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    if (!file) {
      setMessage("Escolha um arquivo de vídeo.");
      return;
    }
    if (file.size + usedBytes > maxStorageBytes) {
      setMessage("Este arquivo passa do limite de armazenamento.");
      return;
    }
    if (file.type && !ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setMessage("Use MP4 (H.264 + AAC) para o VRChat. Outros codecs costumam falhar no Quest.");
    }

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setMessage("Sessão expirada. Entre de novo.");
      return;
    }

    const objectName = `${session.user.id}/${crypto.randomUUID()}${fileExtension(file.name)}`;
    const displayTitle = title.trim() || file.name.replace(/\.[^.]+$/, "");

    setProgress(0);
    try {
      await uploadResumable({
        file,
        objectName,
        accessToken: session.access_token,
        onProgress: setProgress,
      });

      const { data, error } = await supabase
        .from("videos")
        .insert({
          title: displayTitle,
          storage_path: objectName,
          size_bytes: file.size,
          mime: file.type || "video/mp4",
          owner_id: session.user.id,
        })
        .select()
        .single();

      if (error) {
        await supabase.storage.from(VIDEO_BUCKET).remove([objectName]);
        throw error;
      }

      setVideos((current) => [data as VideoRow, ...current]);
      setTitle("");
      setFile(null);
      setMessage("Vídeo enviado. Copie a URL VRChat e cole no telão.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setProgress(null);
    }
  }

  async function onDelete(video: VideoRow) {
    if (!window.confirm(`Remover “${video.title}”?`)) return;
    setBusyId(video.id);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error: storageError } = await supabase.storage
        .from(VIDEO_BUCKET)
        .remove([video.storage_path]);
      if (storageError) throw storageError;
      const { error } = await supabase.from("videos").delete().eq("id", video.id);
      if (error) throw error;
      setVideos((current) => current.filter((item) => item.id !== video.id));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível excluir.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
        <div>
          <p className="font-semibold tracking-tight">MidiaPlay</p>
          <p className="text-xs text-muted">{userEmail}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="text-sm text-muted hover:text-foreground"
        >
          Sair
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-10">
        <section className="rounded-2xl border border-line bg-panel p-5">
          <div className="flex items-end justify-between gap-4 text-sm">
            <h2 className="font-medium">Armazenamento</h2>
            <p className="text-muted">
              {formatBytes(usedBytes)} / {formatBytes(maxStorageBytes)}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${Math.max(usageRatio * 100, usedBytes > 0 ? 2 : 0)}%` }}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="mb-4 font-medium">Adicionar vídeo</h2>
          <form onSubmit={onUpload} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              Título
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome que aparece no catálogo"
                className="rounded-lg border border-line bg-background px-3 py-2 outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              Arquivo
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.mkv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-background"
              />
            </label>
            {progress !== null ? (
              <p className="text-sm text-accent">
                Enviando… {(progress * 100).toFixed(0)}%
              </p>
            ) : null}
            {message ? <p className="text-sm text-muted">{message}</p> : null}
            <button
              type="submit"
              disabled={progress !== null}
              className="self-start rounded-full bg-accent px-5 py-2 text-sm font-medium text-background hover:bg-accent-dim disabled:opacity-60"
            >
              Enviar
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-4 font-medium">Catálogo</h2>
          {videos.length === 0 ? (
            <p className="text-sm text-muted">Nenhum vídeo ainda.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {videos.map((video) => {
                const vrchatUrl = storagePublicUrl(supabaseUrl, video.storage_path);
                const pageUrl = `${siteUrl || (typeof window !== "undefined" ? window.location.origin : "")}${watchPath(video.id)}`;
                return (
                  <li
                    key={video.id}
                    className="rounded-2xl border border-line bg-panel p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{video.title}</p>
                        <p className="mt-1 text-xs text-muted">
                          {formatBytes(video.size_bytes)} · {formatDate(video.created_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={busyId === video.id}
                        onClick={() => onDelete(video)}
                        className="text-sm text-danger hover:underline disabled:opacity-50"
                      >
                        Retirar
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => copyText(`${video.id}-vr`, vrchatUrl)}
                        className="rounded-full border border-line px-3 py-1 text-xs hover:border-accent"
                      >
                        {copied === `${video.id}-vr` ? "Copiado" : "Copiar URL VRChat"}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyText(`${video.id}-web`, pageUrl)}
                        className="rounded-full border border-line px-3 py-1 text-xs hover:border-accent"
                      >
                        {copied === `${video.id}-web` ? "Copiado" : "Copiar página de teste"}
                      </button>
                      <a
                        href={watchPath(video.id)}
                        className="rounded-full border border-line px-3 py-1 text-xs hover:border-accent"
                      >
                        Abrir player
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
