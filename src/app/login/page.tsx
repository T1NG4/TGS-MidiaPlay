import Link from "next/link";
import { SetupBanner } from "@/components/setup-banner";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next || "/painel";

  return (
    <div className="flex min-h-full flex-col">
      <SetupBanner />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <Link href="/" className="mb-8 text-sm text-muted hover:text-foreground">
          ← MidiaPlay
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Painel</h1>
        <p className="mt-2 mb-8 text-sm text-muted">
          Crie o primeiro usuário em Authentication → Users no dashboard do
          Supabase.
        </p>
        <LoginForm nextPath={nextPath} />
      </main>
    </div>
  );
}
