import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { ONBOARDING_TEMPLATES, briefingProgress, getOnboardingTemplate } from '@/lib/onboarding-schema';
import { OnboardingView, type BriefingRow } from './onboarding-view';
import { NewBriefing } from './new-briefing';
import { PageHeader } from '../_shared/page-header';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';

type Row = {
  id: string;
  token: string;
  organization_id: string | null;
  product_name: string | null;
  scope: string | null;
  status: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string | null;
  first_opened_at: string | null;
  respostas: Record<string, string | string[]> | null;
  template_key: string | null;
  organizations: { name?: string } | { name?: string }[] | null;
};

type FileLink = { name: string; url: string | null };

function orgName(o: Row['organizations']): string {
  const n = Array.isArray(o) ? o[0]?.name : o?.name;
  return n ?? 'Cliente';
}

export default async function OnboardingAdminPage() {
  const supabase = getSupabaseAdmin();
  const [{ data }, { data: orgData }] = await Promise.all([
    supabase
      .from('onboarding_briefings')
      .select('id, token, organization_id, product_name, scope, status, submitted_at, created_at, updated_at, first_opened_at, respostas, template_key, organizations(name)')
      .order('created_at', { ascending: false }),
    supabase.from('organizations').select('id, name').order('name'),
  ]);

  const orgs = ((orgData ?? []) as { id: string; name: string | null }[]).flatMap((o) =>
    o.name ? [{ id: o.id, name: o.name }] : [],
  );
  const templates = Object.entries(ONBOARDING_TEMPLATES).map(([key, t]) => ({ key, label: t.label }));

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

  // Rascunho que o cliente ainda pode responder: o formulário de novo briefing
  // avisa antes de abrir um segundo link para o mesmo cliente.
  const emAberto = rows.flatMap((r) => {
    if (r.status !== 'rascunho' || !r.organization_id) return [];
    const p = briefingProgress(getOnboardingTemplate(r.template_key), r.respostas ?? {});
    return [{
      orgId: r.organization_id,
      label: `${r.product_name ?? 'briefing'} · ${p.respondidas}/${p.total} respondidas`,
    }];
  });

  const briefings: BriefingRow[] = rows.map((r) => ({
    id: r.id,
    token: r.token,
    orgName: orgName(r.organizations),
    product_name: r.product_name,
    template: r.template_key ?? 'produto',
    status: r.status,
    submitted_at: r.submitted_at,
    created_at: r.created_at,
    updated_at: r.updated_at,
    first_opened_at: r.first_opened_at,
    respostas: r.respostas ?? {},
    files: files[r.id] ?? [],
  }));

  return (
    <div>
      <PageHeader
        titulo="Onboarding"
        className="mb-6"
        dados={<>{rows.length} briefing{rows.length === 1 ? '' : 's'} · {enviados} respondido{enviados === 1 ? '' : 's'}</>}
      >
        <NewBriefing orgs={orgs} templates={templates} emAberto={emAberto} />
      </PageHeader>

      <OnboardingView rows={briefings} siteUrl={SITE_URL} />
    </div>
  );
}
