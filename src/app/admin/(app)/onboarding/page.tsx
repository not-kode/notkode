import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { ONBOARDING_SECTIONS } from '@/lib/onboarding-schema';
import { CopyLink } from './copy-link';

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
  organizations: { name?: string } | { name?: string }[] | null;
};

type FileLink = { name: string; url: string | null };

function orgName(o: Row['organizations']): string {
  const n = Array.isArray(o) ? o[0]?.name : o?.name;
  return n ?? 'Cliente';
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

function answerText(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v.join(', ');
  return (v ?? '').trim();
}

export default async function OnboardingAdminPage() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('onboarding_briefings')
    .select('id, token, product_name, scope, status, submitted_at, created_at, respostas, organizations(name)')
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

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Onboarding</h1>
        <p className="mt-1 text-sm text-text-muted">
          {rows.length} briefing{rows.length === 1 ? '' : 's'} · {enviados} enviado{enviados === 1 ? '' : 's'}
        </p>
      </header>

      {rows.length === 0 && (
        <p className="text-sm text-text-muted">Nenhum briefing ainda.</p>
      )}

      <div className="flex flex-col gap-6">
        {rows.map((r) => {
          const respostas = r.respostas ?? {};
          const link = `${SITE_URL}/onboarding/${r.token}`;
          const enviado = r.status === 'enviado';
          return (
            <article key={r.id} className="rounded-lg border border-border-subtle bg-surface-elevated/40">
              {/* Cabeçalho do briefing */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-semibold">{orgName(r.organizations)}</h2>
                    {r.product_name && (
                      <span className="font-mono text-xs text-text-muted">· {r.product_name}</span>
                    )}
                    <span
                      className={[
                        'rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider',
                        enviado ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning',
                      ].join(' ')}
                    >
                      {enviado ? 'enviado' : 'rascunho'}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-text-muted">
                    {enviado ? `Enviado em ${fmtDate(r.submitted_at)}` : `Criado em ${fmtDate(r.created_at)}`}
                  </p>
                </div>
                <CopyLink url={link} />
              </div>

              <div className="px-5 py-4">
                {/* Anexos */}
                {files[r.id]?.length > 0 && (
                  <div className="mb-5">
                    <p className="mb-2 font-label text-[11px] uppercase tracking-[0.18em] text-text-muted">
                      Anexos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {files[r.id].map((f) => (
                        <a
                          key={f.name}
                          href={f.url ?? '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:border-primary hover:text-primary"
                        >
                          📎 {f.name.replace(/^\d+-/, '')}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Respostas por seção */}
                <div className="flex flex-col gap-5">
                  {ONBOARDING_SECTIONS.map((section) => {
                    const answered = section.questions
                      .map((q) => ({ q, val: answerText(respostas[q.id]) }))
                      .filter((x) => x.val !== '');
                    if (answered.length === 0) return null;
                    return (
                      <section key={section.id}>
                        <p className="mb-2 font-label text-[11px] uppercase tracking-[0.18em] text-primary">
                          {section.title}
                        </p>
                        <dl className="flex flex-col gap-2.5">
                          {answered.map(({ q, val }) => (
                            <div key={q.id} className="grid grid-cols-1 gap-0.5 sm:grid-cols-[minmax(0,280px)_1fr] sm:gap-4">
                              <dt className="text-sm text-text-muted">{q.label}</dt>
                              <dd className="whitespace-pre-wrap text-sm text-text-primary">{val}</dd>
                            </div>
                          ))}
                        </dl>
                      </section>
                    );
                  })}

                  {Object.keys(respostas).length === 0 && (
                    <p className="text-sm text-text-muted">Ainda sem respostas.</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
