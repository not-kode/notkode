import Link from 'next/link';
import { carregarGravacoes } from './recordings-data';
import { RecordingsTable } from './recordings-table';
import { carregarHeatmap } from './heatmap-data';
import { HeatmapView } from './heatmap-view';

export const dynamic = 'force-dynamic';

// Comportamento no site é UM assunto: as gravações e o mapa de calor saem dos
// mesmos eventos do rrweb e respondem à mesma pergunta ("o que as pessoas fazem
// aqui"). Por isso são sub-abas de uma tela, não dois itens de menu.

type Aba = 'gravacoes' | 'calor';

const ABAS: { id: Aba; label: string }[] = [
  { id: 'gravacoes', label: 'Gravações' },
  { id: 'calor', label: 'Mapa de calor' },
];

export default async function ComportamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ ver?: string }>;
}) {
  const { ver } = await searchParams;
  const aba: Aba = ver === 'calor' ? 'calor' : 'gravacoes';

  // Carrega só o que a aba aberta precisa.
  const [gravacoes, heatmap] = await Promise.all([
    carregarGravacoes(),
    aba === 'calor' ? carregarHeatmap() : Promise.resolve(null),
  ]);

  const naoVistas = gravacoes.sessions.filter((s) => !s.vista).length;

  return (
    <div>
      <header className="mb-4">
        <p className="eyebrow mb-1"><span className="status-dot" />Comportamento no site</p>
        <h1 className="text-2xl font-semibold tracking-tight">Comportamento</h1>
        <p className="mt-1 text-sm text-text-muted">
          {gravacoes.sessions.length} gravaç{gravacoes.sessions.length === 1 ? 'ão' : 'ões'}
          {naoVistas > 0 && (
            <>
              {' · '}
              <span className="font-medium text-primary">{naoVistas} não vista{naoVistas === 1 ? '' : 's'}</span>
            </>
          )}
          {' · '}assista o que cada visitante fez e veja onde todos clicam. Texto digitado fica mascarado.
        </p>
      </header>

      <nav className="mb-5 inline-flex items-center gap-1 rounded-md bg-black/[0.05] p-1">
        {ABAS.map((a) => (
          <Link
            key={a.id}
            href={a.id === 'gravacoes' ? '/admin/sessoes' : '/admin/sessoes?ver=calor'}
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

      {aba === 'gravacoes' ? (
        <RecordingsTable sessions={gravacoes.sessions} />
      ) : (
        <HeatmapView paginas={heatmap ?? []} />
      )}
    </div>
  );
}
