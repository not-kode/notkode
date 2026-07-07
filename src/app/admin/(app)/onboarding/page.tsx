import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { OnboardingView, type BriefingRow } from './onboarding-view';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';

type Row = {
  id: string;
  token: string;
  product_name: string | null;
  scope: string | null;
  status: string;
  submitted_at: string | null;
  created_at: string;
  respostas: Record<string, string | string[]> | null;
  retorno_ia: BriefingRow['retornoIA'];
  organizations: { name?: string } | { name?: string }[] | null;
};

type FileLink = { name: string; url: string | null };

function orgName(o: Row['organizations']): string {
  const n = Array.isArray(o) ? o[0]?.name : o?.name;
  return n ?? 'Cliente';
}

export default async function OnboardingAdminPage() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('onboarding_briefings')
    .select('id, token, product_name, scope, status, submitted_at, created_at, respostas, retorno_ia, organizations(name)')
    .order('created_at', { ascending: false });

  const rows = (data ?? []) as Row[];

  // Anexos: lista o Storage por token e assina URLs de download.
  const files: Record<string, FileLink[]> = {};
  await Promise.all(
    rows.map(async (r) => {
      const { data: list } = await supabase.storage.from('onboarding').list(r.token);
      const items = (list ?? []).filter((f) => f.name && f.id !== null);
      files[r.id] = await Promise.all(
        items.map(async (f) => {
          const { data: signed } = await supabase.storage
            .from('onboarding')
            .createSignedUrl(`${r.token}/${f.name}`, 3600);
          return { name: f.name, url: signed?.signedUrl ?? null };
        }),
      );
    }),
  );

  const enviados = rows.filter((r) => r.status === 'enviado').length;

  const briefings: BriefingRow[] = rows.map((r) => ({
    id: r.id,
    token: r.token,
    orgName: orgName(r.organizations),
    product_name: r.product_name,
    status: r.status,
    submitted_at: r.submitted_at,
    created_at: r.created_at,
    respostas: r.respostas ?? {},
    files: files[r.id] ?? [],
    retornoIA: r.retorno_ia ?? null,
  }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Onboarding</h1>
        <p className="mt-1 text-sm text-text-muted">
          {rows.length} briefing{rows.length === 1 ? '' : 's'} · {enviados} respondido{enviados === 1 ? '' : 's'}
        </p>
      </header>

      <OnboardingView rows={briefings} siteUrl={SITE_URL} />
    </div>
  );
}
