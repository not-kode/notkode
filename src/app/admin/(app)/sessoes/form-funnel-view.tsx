// Desenho do funil de formulário. Veio do dashboard-view.tsx sem mudança de
// leitura: uma etapa por linha, quantos chegaram e quantos se perderam desde a
// etapa anterior. A barra sozinha dizia pouco, porque a primeira é sempre 100%
// e as outras viravam faixas quase iguais.
import { mexeramEm, type FormFunnel, type FunnelStep } from './form-funnel-data';

const nf = (n: number) => n.toLocaleString('pt-BR');
const pct = (num: number, den: number) => (den > 0 ? `${Math.round((num / den) * 100)}%` : '—');

function biggestDropIndex(steps: FunnelStep[]): number {
  let worst = -1, worstRatio = 1;
  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1].count;
    if (prev <= 0) continue;
    const ratio = steps[i].count / prev;
    if (ratio < worstRatio) { worstRatio = ratio; worst = i; }
  }
  return worst;
}

function FunnelRow({ step, prev, top, isDrop, isLast }: {
  step: FunnelStep; prev: number | null; top: number; isDrop: boolean; isLast: boolean;
}) {
  const w = top > 0 && step.count > 0 ? Math.max(1.5, (step.count / top) * 100) : 0;
  const perdeu = prev !== null ? prev - step.count : 0;
  const barTone = isLast ? 'bg-primary' : isDrop ? 'bg-danger/70' : 'bg-navy/85';
  const origins = step.origins ?? [];

  return (
    <div className="group relative flex items-center gap-3">
      <div
        className={`w-32 shrink-0 truncate text-right text-xs sm:w-40 ${isDrop ? 'font-medium text-danger' : 'text-text-secondary'}`}
        title={step.label}
      >
        {step.label}
      </div>

      <div className="relative h-6 flex-1 overflow-hidden rounded-sm bg-[#191918]/[0.06]">
        <div className={`h-full rounded-sm ${barTone}`} style={{ width: `${w}%` }} />
      </div>

      {/* Chegaram aqui, e o que se perdeu no caminho até aqui. */}
      <div className="flex w-28 shrink-0 items-baseline justify-end gap-2">
        <span className="font-mono text-xs font-medium tabular-nums text-text-primary">{nf(step.count)}</span>
        <span className={`font-mono text-[11px] tabular-nums ${isDrop ? 'text-danger' : 'text-text-muted'}`}>
          {perdeu > 0 ? `−${nf(perdeu)}` : prev === null ? pct(step.count, top) : '—'}
        </span>
      </div>

      {origins.length > 0 && (
        <div className="pointer-events-none absolute left-32 top-full z-30 mt-1 hidden min-w-[11rem] max-w-[16rem] rounded-md border border-[#191918]/[0.10] bg-surface-base p-2.5 shadow-lg group-hover:block sm:left-40">
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
            De onde vieram · {nf(step.count)}
          </p>
          <ul className="flex flex-col gap-1">
            {origins.map((o) => (
              <li key={o.label} className="flex items-center justify-between gap-4 text-[12px]">
                <span className="text-text-secondary">{o.label}</span>
                <span className="font-mono tabular-nums text-text-primary">{nf(o.count)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FormFunnelCard({ funnel }: { funnel: FormFunnel }) {
  const steps = funnel.steps;
  // Sem ninguém mexendo, não há etapa em que parar: o desenho de duas linhas
  // ("Viu o formulário" → "Enviou") sugeria que alguém tinha parado no envio,
  // quando na verdade a pessoa nem começou a preencher.
  const ninguemMexeu = mexeramEm(funnel) === 0;
  // Quem viu o formulário é o topo do desenho; quem começou a preencher é a régua
  // da conversão. Sem essa separação, 0 lead lia igual em dois casos bem
  // diferentes: ninguém chegou ao formulário, ou chegou e não digitou nada.
  const viram = steps.find((s) => s.kind === 'view')?.count ?? 0;
  const started = steps.find((s) => s.kind !== 'view')?.count ?? 0;
  const topo = steps[0]?.count ?? 0;
  const sent = steps[steps.length - 1]?.count ?? 0;
  const drop = biggestDropIndex(steps);
  const converteu = sent > 0;

  return (
    <div className="rounded-md border border-[#191918]/[0.06] p-4">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[11px] font-medium tracking-tight text-text-primary">
          {funnel.form}
          {funnel.formType && <span className="ml-1.5 font-normal normal-case text-text-muted">· {funnel.formType}</span>}
        </p>
        <p className="font-mono text-[11px] text-text-muted">
          <span className={converteu ? 'font-medium text-primary' : 'text-text-secondary'}>{pct(sent, started)}</span> conversão
        </p>
      </div>
      <p className="mb-3 text-[11px] text-text-muted">
        {viram > 0 && <>{nf(viram)} viram o formulário · </>}
        {nf(started)} mexeram · {nf(sent)} enviaram
      </p>

      {ninguemMexeu ? (
        <p className="rounded-sm bg-[#191918]/[0.04] px-3 py-2 text-[12px] text-text-secondary">
          {viram > 0
            ? `${nf(viram)} chegaram até o formulário e ninguém digitou nada. Não há etapa em que tenham parado.`
            : 'Ninguém abriu este formulário no período.'}
        </p>
      ) : (
      <div className="flex flex-col gap-2.5">
        {steps.map((step, i) => (
          <FunnelRow
            key={`${step.label}-${i}`}
            step={step}
            prev={i === 0 ? null : steps[i - 1].count}
            top={topo || 1}
            isDrop={i === drop}
            isLast={i === steps.length - 1}
          />
        ))}
      </div>
      )}

      {!ninguemMexeu && drop > 0 && steps[drop - 1].count > steps[drop].count && (
        <p className="mt-3 text-[11px] text-text-secondary">
          {/* Perder na última etapa é não enviar, não "parar no envio". */}
          Maior perda: {nf(steps[drop - 1].count - steps[drop].count)} de {nf(steps[drop - 1].count)}{' '}
          {drop === steps.length - 1 ? (
            <>chegaram em <span className="font-medium">{steps[drop - 1].label}</span> e <span className="font-medium text-danger">não enviaram</span>.</>
          ) : (
            <>pararam em <span className="font-medium text-danger">{steps[drop].label}</span>.</>
          )}
        </p>
      )}

      {funnel.versaoAntiga ? (
        <p className="mt-2 text-[11px] text-warning">
          Estas etapas são da <strong className="font-medium">versão anterior</strong> do formulário. Ninguém mexeu na
          versão que está no ar hoje dentro deste período.
        </p>
      ) : funnel.mixedVersions ? (
        <p className="mt-2 text-[11px] text-warning">
          O formulário mudou de ordem dentro deste período. As etapas mostram a versão atual; o que foi medido antes da
          mudança ficou de fora.
        </p>
      ) : null}
    </div>
  );
}

export function FormFunnelsView({ funnels }: { funnels: FormFunnel[] }) {
  if (funnels.length === 0) {
    return <p className="py-8 text-center text-sm text-text-muted">Ninguém mexeu num formulário no período.</p>;
  }

  // Formulário com pouquíssima gente não merece o mesmo espaço: vai para um bloco
  // fechado, senão a tela dá o mesmo peso a 9 sessões e a 3. A régua é quem mexeu
  // de verdade, não quem só passou os olhos.
  const relevantes = funnels.filter((f) => mexeramEm(f) >= 5);
  const poucos = funnels.filter((f) => mexeramEm(f) < 5);

  return (
    <section className="rounded-md border border-[#191918]/[0.08] bg-surface-base p-5">
      <div className="flex flex-col gap-4">
        {relevantes.map((f) => <FormFunnelCard key={f.form} funnel={f} />)}
      </div>

      {poucos.length > 0 && (
        <details className={relevantes.length ? 'mt-4' : ''}>
          <summary className="cursor-pointer font-mono text-[11px] text-text-muted">
            Pouca amostra ainda ({poucos.length}): {poucos.map((f) => f.form).join(', ')}
          </summary>
          <div className="mt-3 flex flex-col gap-4">
            {poucos.map((f) => <FormFunnelCard key={f.form} funnel={f} />)}
          </div>
        </details>
      )}

      <p className="mt-4 text-[11px] text-text-muted">
        Cada linha mostra quantos chegaram até ali e, ao lado, quantos se perderam desde a etapa anterior.
        &quot;Viu o formulário&quot; é quem rolou até ele; &quot;mexeram&quot; é quem digitou ou escolheu alguma coisa.
        A conversão compara envio com quem mexeu.
      </p>
    </section>
  );
}
