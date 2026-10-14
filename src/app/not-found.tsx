import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-24">
      <h1 className="text-2xl font-semibold">Não encontrado</h1>
      <p className="mt-2 text-muted">Esse vídeo não existe neste catálogo.</p>
      <Link href="/" className="mt-6 text-sm text-accent hover:underline">
        Voltar
      </Link>
    </main>
  );
}
