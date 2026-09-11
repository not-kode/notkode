import Link from 'next/link';
import { Suspense } from 'react';
import { carregarGravacoes } from './recordings-data';
import { RecordingsTable } from './recordings-table';
import { carregarHeatmap } from './heatmap-data';
import { HeatmapView } from './heatmap-view';
import { carregarFunisDeFormulario } from './form-funnel-data';
import { FormFunnelsView } from './form-funnel-view';
import { PeriodFilter } from '../period-filter';
import { resolveRange } from '../period';
import { PageHeader } from '../_shared/page-header';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PararamView, type Parou } from './pararam-view';

export const dynamic = 'force-dynamic';

// Comportamento no site é UM assunto: gravações, mapa de calor e o funil de
// formulário saem dos mesmos eventos e respondem à mesma pergunta ("o que as
// pessoas fazem aqui"). São sub-abas de uma tela, não itens de menu.
//
// Aqui o funil é o desenho agregado (quantos chegaram a cada etapa), e logo
// abaixo dele quem parou no meio SEM deixar contato. Quem deixou contato não é
// mais assunto desta tela: vira card no funil na hora, com o que já respondeu.

type Aba = 'gravacoes' | 'calor' | 'formularios';

const ABAS: { id: Aba; label: string }[] = [
  { id: 'gravacoes', label: 'Gravações' },
  { id: 'calor', label: 'Mapa de calor' },
  { id: 'formularios', label: 'Formulários' },
];

export default async function ComportamentoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const aba: Aba = sp.ver === 'calor' ? 'calor' : sp.ver === 'formularios' ? 'formularios' : 'gravacoes';
  // O período só manda na aba Formulários; as outras duas leem tudo o que existe.
  const range = resolveRange({ range: sp.range, from: sp.from, to: sp.to });

  // Carrega só o que a aba aberta precisa.
  const [gravacoes, heatmap, funis, anonimos] = await Promise.all([
    carregarGravacoes(),
    aba === 'calor' ? carregarHeatmap() : Promise.resolve(null),
    aba === 'formularios' ? carregarFunisDeFormulario(range) : Promise.resolve(null),
    aba === 'formularios' ? carregarAnonimos() : Promise.resolve([]),
  ]);

  const naoVistas = gravacoes.sessions.filter((s) => !s.vista).length;
  const href = (id: Aba) => (id === 'gravacoes' ? '/admin/sessoes' : `/admin/sessoes?ver=${id}`);

  return (
    <div>
      <PageHeader
        titulo="Analytics"
        className="mb-4"
        dados={<>
          {gravacoes.sessions.length} gravaç{gravacoes.sessions.length === 1 ? 'ão' : 'ões'}
          {naoVistas > 0 && (
            <>{' · '}<span className="font-medium text-primary">{naoVistas} não vista{naoVistas === 1 ? '' : 's'}</span></>
          )}
        </>}
      >
        {aba === 'formularios' && <Suspense fallback={null}><PeriodFilter /></Suspense>}
      </PageHeader>

      <nav className="mb-5 inline-flex items-center gap-1 rounded-md bg-black/[0.05] p-1">
        {ABAS.map((a) => (
          <Link
            key={a.id}
            href={href(a.id)}
            className={`rounded-sm px-3 py-1.5 text-[12px] font-medium transition-colors ${
              aba === a.id
                ? 'bg-white text-text-primary shadow-[0_1px_2px_rgba(16,24,40,0.08)]'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {a.label}
          </Link>
        ))}
      </nav>

      {gravacoes.erro && (
        <p className="mb-4 rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          Erro ao carregar sessões: {gravacoes.erro}
        </p>
      )}

      {aba === 'gravacoes' && <RecordingsTable sessions={gravacoes.sessions} />}
      {aba === 'calor' && <HeatmapView paginas={heatmap ?? []} />}
      {aba === 'formularios' && (
        <>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
            Por página · onde as pessoas param<span className="ml-2 normal-case tracking-normal">· {range.label}</span>
          </p>
          <FormFunnelsView funnels={funis ?? []} />

          <p className="mb-3 mt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
            Mexeram e sumiram sem deixar contato
          </p>
          <p className="mb-3 text-[11px] text-text-muted">
            Não dá para ligar para ninguém aqui: é o que a pessoa chegou a responder antes de
            desistir. Quem deixou nome e contato não aparece nesta lista — já entrou no{' '}
            <Link href="/admin/pipeline" className="text-primary hover:underline">Pipeline</Link> como card.
          </p>
          {anonimos.length === 0 ? (
            <p className="rounded-md border border-border-subtle/20 bg-white px-4 py-8 text-center text-sm text-text-muted">
              Ninguém parou no meio sem se identificar.
            </p>
          ) : (
            <PararamView pessoas={anonimos} />
          )}
        </>
      )}
    </div>
  );
}

/**
 * Quem mexeu no formulário, não enviou e não deixou contato — por isso não virou
 * card no funil. Serve para ler o que o público pede, não para ligar.
 */
async function carregarAnonimos(): Promise<Parou[]> {
  const supabase = getSupabaseAdmin();
  const [{ data }, { data: recData }] = await Promise.all([
    supabase
      .from('lead_drafts')
      .select('session_id, service_tag, kind, name, company, email, whatsapp, needs, timing, description, last_step, updated_at')
      .is('submitted_at', null)
      .is('deal_id', null)
      .order('updated_at', { ascending: false }),
    supabase.from('session_recordings').select('session_id'),
  ]);
  const comGravacao = new Set((recData ?? []).map((r) => r.session_id as string));
  return ((data ?? []) as Omit<Parou, 'temGravacao'>[]).map((d) => ({
    ...d,
    temGravacao: comGravacao.has(d.session_id),
  }));
}
