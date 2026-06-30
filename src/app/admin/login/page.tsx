import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Admin · Notkode', robots: { index: false, follow: false } };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-base px-5">
      <div className="w-full max-w-sm rounded-xl border border-border-subtle/20 bg-surface-elevated p-8 shadow-sm">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">notkode · crm</p>
          <h1 className="mt-1 text-2xl font-semibold text-text-primary">Área interna</h1>
          <p className="mt-1 text-sm text-text-muted">Acesso restrito ao time.</p>
        </div>
        <LoginForm next={next ?? '/admin/leads'} />
      </div>
    </main>
  );
}
