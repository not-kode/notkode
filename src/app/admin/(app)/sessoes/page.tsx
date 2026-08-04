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

export const dynamic = 'force-dynamic';

// Comportamento no site é UM assunto: as gravações, o mapa de calor e o funil de
// formulário saem dos mesmos eventos e respondem à mesma pergunta ("o que as
// pessoas fazem aqui"). Por isso são sub-abas de uma tela, não itens de menu.
// O funil veio do Dashboard, que ficou só com negócio + o resumo do site.

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
  const [gravacoes, heatmap, funis] = await Promise.all([
    carregarGravacoes(),
    aba === 'calor' ? carregarHeatmap() : Promise.resolve(null),
    aba === 'formularios' ? carregarFunisDeFormulario(range) : Promise.resolve(null),
  ]);

  const naoVistas = gravacoes.sessions.filter((s) => !s.vista).length;
  // A sub-aba viaja junto quando o período muda; sem isso, escolher o período
  // jogaria de volta para Gravações.
  const href = (id: Aba) => (id === 'gravacoes' ? '/admin/sessoes' : `/admin/sessoes?ver=${id}`);

  return (
    <div>
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-1"><span className="status-dot" />Comportamento no site</p>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-text-muted">
            {gravacoes.sessions.length} gravaç{gravacoes.sessions.length === 1 ? 'ão' : 'ões'}
            {naoVistas > 0 && (
              <>
                {' · '}
                <span className="font-medium text-primary">{naoVistas} não vista{naoVistas === 1 ? '' : 's'}</span>
              </>
            )}
            {' · '}assista o que cada visitante fez, veja onde todos clicam e onde param de preencher. Texto digitado
            fica mascarado.
          </p>
        </div>
        {aba === 'formularios' && <Suspense fallback={null}><PeriodFilter /></Suspense>}
      </header>

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
        </>
      )}
    </div>
  );
}
