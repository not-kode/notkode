// Funil de formulário POR PÁGINA (service_tag), no período escolhido.
// Estava no Dashboard; veio para o Analytics porque responde à mesma pergunta das
// gravações e do mapa de calor ("o que as pessoas fazem no site"), e o Dashboard
// ficou só com negócio + o resumo do site.
import { getSupabaseAdmin, lerTudo } from '@/lib/supabase-admin';
import { FORM_VERSION, parseStepEventLabel } from '@/lib/form-steps';
import { classifySource, prettyService } from '../_shared/site-metrics';
import type { ResolvedRange } from '../period';

/** kind 'view' = a etapa de quem só chegou a ver o formulário, sem tocar em nada. */
export type FunnelStep = {
  label: string;
  count: number;
  origins?: { label: string; count: number }[];
  kind?: 'view';
};

/**
 * mixedVersions: o período pega antes e depois de uma mudança na ordem do formulário.
 * versaoAntiga: no período não há nenhuma medição da versão que está no ar hoje —
 * o que se vê é a sequência anterior, e não a de agora.
 */
export type FormFunnel = {
  form: string;
  formType?: string | null;
  steps: FunnelStep[];
  mixedVersions?: boolean;
  versaoAntiga?: boolean;
};

/** Eventos do funil de formulário, do "viu o formulário" ao envio. */
const FORM_EVENT_TYPES = ['form_view', 'form_start', 'form_step', 'form_submit'];
/** Quantos começaram a preencher (ignora quem só viu o formulário na tela). */
export const mexeramEm = (f: FormFunnel) => f.steps.find((s) => s.kind !== 'view')?.count ?? 0;

type FormEv = { type: string; label: string | null; session_id: string | null; service_tag: string | null };

export async function carregarFunisDeFormulario(range: ResolvedRange): Promise<FormFunnel[]> {
  const supabase = getSupabaseAdmin();
  const { fromISO, siteToISO } = range;

  // As leituras de `events` vão paginadas (lerTudo): o PostgREST corta em 1000
  // linhas sem avisar, e um período movimentado mostraria o funil pela metade.
  const [formRows, pvRows] = await Promise.all([
    lerTudo<FormEv>((de, ate) =>
      supabase.from('events').select('type, label, session_id, service_tag').in('type', FORM_EVENT_TYPES).gte('created_at', fromISO).lte('created_at', siteToISO).order('created_at').range(de, ate)),
    lerTudo<{ created_at: string; session_id: string | null; referrer: string | null; utm_source: string | null }>((de, ate) =>
      supabase.from('events').select('created_at, session_id, referrer, utm_source').eq('type', 'page_view').gte('created_at', fromISO).lte('created_at', siteToISO).order('created_at').range(de, ate)),
  ]);

  const formEvents = formRows.data;
  const parseStep = parseStepEventLabel;

  // Origem de ENTRADA por sessão (a 1ª visualização de página): usada no tooltip do
  // funil pra mostrar de onde vieram as pessoas que chegaram a cada etapa.
  const sessOrigin = new Map<string, { t: number; origin: string }>();
  for (const r of pvRows.data) {
    if (!r.session_id) continue;
    const t = new Date(r.created_at).getTime();
    const cur = sessOrigin.get(r.session_id);
    if (!cur || t < cur.t) sessOrigin.set(r.session_id, { t, origin: classifySource(r.referrer, r.utm_source) });
  }
  // Conjunto de sessões que satisfazem o predicado + a quebra por origem dessas sessões.
  const sessionsOf = (pred: (e: FormEv) => boolean) =>
    new Set(formEvents.filter((e) => pred(e) && e.session_id).map((e) => e.session_id as string));
  const originsOf = (sessions: Set<string>): { label: string; count: number }[] => {
    const m = new Map<string, number>();
    for (const s of sessions) {
      const o = sessOrigin.get(s)?.origin ?? 'Direto';
      m.set(o, (m.get(o) ?? 0) + 1);
    }
    return [...m.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  };

  const services = [...new Set(formEvents.map((e) => e.service_tag).filter((s): s is string => !!s))];
  return services
    .map((svc) => {
      const inSvc = (e: FormEv) => e.service_tag === svc;
      // Nome do formulário daquela página (Qualificação, Orçamento…), pra legenda.
      const formType =
        formEvents.filter(inSvc).map((e) => (e.type === 'form_start' ? e.label : parseStep(e.label)?.form)).find((f): f is string => !!f) ?? null;
      // O formulário muda de ordem de tempos em tempos, e cada mudança sobe a
      // versão da sequência. Somar medição velha e nova na mesma posição mostraria
      // uma ordem que não é a de hoje, então desenhamos UMA versão por vez.
      //
      // A referência é a versão do formulário que está no ar (FORM_VERSION). Se o
      // período não tem nenhuma medição dela, caímos na versão mais recente que
      // existe nos dados e dizemos que aquilo é medição da versão anterior — antes
      // isso acontecia calado, e um painel parado parecia painel quebrado.
      const versoes = new Set<number>();
      for (const e of formEvents) {
        if (!inSvc(e) || e.type !== 'form_step') continue;
        const p = parseStep(e.label);
        if (p) versoes.add(p.version);
      }
      const versaoDesenhada = versoes.has(FORM_VERSION)
        ? FORM_VERSION
        : versoes.size ? Math.max(...versoes) : FORM_VERSION;

      const stepsMeta = new Map<number, string>();
      for (const e of formEvents) {
        if (!inSvc(e) || e.type !== 'form_step') continue;
        const p = parseStep(e.label);
        if (p && p.version === versaoDesenhada) stepsMeta.set(p.pos, p.name);
      }
      const ordered = [...stepsMeta.entries()].sort((a, b) => a[0] - b[0]);
      const mkStep = (label: string, pred: (e: FormEv) => boolean): FunnelStep => {
        const sess = sessionsOf(pred);
        return { label, count: sess.size, origins: originsOf(sess) };
      };
      // "Viu o formulário" é o topo real: quem rolou até ele, mesmo sem digitar
      // nada. É o que separa "ninguém chegou no formulário" de "chegou e desistiu
      // antes da primeira letra". Só aparece quando existe medição disso.
      const viram: FunnelStep = {
        ...mkStep('Viu o formulário', (e) => inSvc(e) && e.type === 'form_view'),
        kind: 'view',
      };
      const steps: FunnelStep[] = [
        ...(viram.count > 0 ? [viram] : []),
        ...ordered.map(([pos, name]) =>
          mkStep(name, (e) => {
            if (!inSvc(e) || e.type !== 'form_step') return false;
            const p = parseStep(e.label);
            return !!p && p.version === versaoDesenhada && p.pos === pos;
          }),
        ),
        mkStep('Enviou', (e) => inSvc(e) && e.type === 'form_submit'),
      ];
      return {
        form: prettyService(svc),
        formType,
        steps,
        mixedVersions: versoes.size > 1,
        versaoAntiga: versaoDesenhada !== FORM_VERSION,
      };
    })
    .filter((f) => f.steps.some((s) => s.count > 0))
    // Na frente, o formulário em que mais gente começou a preencher.
    .sort((a, b) => mexeramEm(b) - mexeramEm(a));
}
