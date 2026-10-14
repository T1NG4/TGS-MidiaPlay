import Link from "next/link";
import { SetupBanner } from "@/components/setup-banner";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SetupBanner />
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <p className="font-semibold tracking-tight">MidiaPlay</p>
        <nav className="flex gap-4 text-sm">
          <Link className="text-muted hover:text-foreground" href="/login">
            Entrar
          </Link>
          <Link
            className="rounded-full bg-accent px-4 py-1.5 font-medium text-background hover:bg-accent-dim"
            href="/painel"
          >
            Painel
          </Link>
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">
          Telão VRChat
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Hospede o arquivo. Cole o link no mundo.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-muted">
          O AVPro do VRChat precisa de um MP4 em HTTPS (H.264 + AAC), não de
          páginas do Drive ou players de host. Envie o vídeo no painel e copie a
          URL crua do Storage.
        </p>
        <ul className="grid gap-3 text-sm text-muted sm:grid-cols-2">
          <li className="rounded-xl border border-line bg-panel px-4 py-3">
            Upload direto para o Supabase Storage (arquivos grandes, retomável).
          </li>
          <li className="rounded-xl border border-line bg-panel px-4 py-3">
            Painel com login, exclusão e barra de uso de disco.
          </li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background hover:bg-accent-dim"
          >
            Abrir painel
          </Link>
          <p className="self-center text-sm text-muted">
            Código aberto — cada um instala na própria Vercel + Supabase.
          </p>
        </div>
      </main>
    </div>
  );
}
