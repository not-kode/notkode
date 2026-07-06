import type { Metadata } from 'next';
import { getBriefingByToken } from '@/lib/onboarding-db';
import { OnboardingForm } from './onboarding-form';

export const metadata: Metadata = {
  title: 'Briefing de Onboarding · Notkode',
  robots: { index: false, follow: false },
};

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const briefing = await getBriefingByToken(token);

  if (!briefing) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-label uppercase tracking-[0.18em] text-xs text-text-muted">
          Link inválido
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Briefing não encontrado</h1>
        <p className="mt-3 text-text-secondary">
          Confira o link com a equipe da Notkode.
        </p>
      </main>
    );
  }

  return (
    <OnboardingForm
      token={token}
      context={{ cliente: briefing.cliente, produto: briefing.produto, escopo: briefing.escopo }}
      initialAnswers={briefing.respostas}
      initialStatus={briefing.status}
    />
  );
}
