import Link from 'next/link';
import { redirect } from 'next/navigation';
import { carregarGravacoes } from './recordings-data';
import { RecordingsTable } from './recordings-table';
import { carregarHeatmap } from './heatmap-data';
import { HeatmapView } from './heatmap-view';

export const dynamic = 'force-dynamic';

// Comportamento no site: as gravações e o mapa de calor saem dos mesmos eventos
// e respondem à mesma pergunta ("o que as pessoas fazem aqui"), então são
// sub-abas de uma tela só.
//
// O funil de formulário saiu daqui e foi para Leads: quem preencheu, quem parou
// no meio e onde as pessoas travam são a mesma conversa, e estavam em telas
// diferentes.

type Aba = 'gravacoes' | 'calor';

const ABAS: { id: Aba; label: string }[] = [
  { id: 'gravacoes', label: 'Gravações' },
  { id: 'calor', label: 'Mapa de calor' },
];

export default async function ComportamentoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  // Link antigo (e o histórico do navegador) continua funcionando: vai para
  // onde o funil mora agora.
  if (sp.ver === 'formularios') redirect('/admin/leads?ver=formularios');

  const aba: Aba = sp.ver === 'calor' ? 'calor' : 'gravacoes';

  // Carrega só o que a aba aberta precisa.
  const [gravacoes, heatmap] = await Promise.all([
    carregarGravacoes(),
    aba === 'calor' ? carregarHeatmap() : Promise.resolve(null),
  ]);

  const naoVistas = gravacoes.sessions.filter((s) => !s.vista).length;
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
            {' · '}assista o que cada visitante fez e veja onde todos clicam. Texto digitado fica mascarado.
          </p>
        </div>
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

      <p className="mt-4 text-[11px] text-text-muted">
        Onde as pessoas param de preencher agora fica em{' '}
        <Link href="/admin/leads?ver=formularios" className="text-primary hover:underline">Leads · Formulários</Link>,
        junto de quem enviou e de quem começou e desistiu.
      </p>
    </div>
  );
}
