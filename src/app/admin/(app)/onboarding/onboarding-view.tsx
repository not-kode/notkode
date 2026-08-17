'use client';

import { useMemo, useState, useTransition, type ReactNode } from 'react';
import {
  getOnboardingTemplate,
  prefilledIds,
  briefingQuestions,
  briefingProgress,
  orphanAnswers,
  type OnboardingQuestion,
  type OnboardingSection,
} from '@/lib/onboarding-schema';
import { CopyLink } from './copy-link';
import { apagarBriefing } from './actions';

// ─────────────────────────────────────────────────────────────────────────
// Visão admin do onboarding: tabela de briefings (escala com vários clientes)
// + drawer lateral com o briefing completo.
//
// A leitura mostra o questionário inteiro, não só o que o cliente digitou:
// pergunta em branco aparece marcada como tal, porque é ela que a gente
// precisa cobrar. Link responde clicando, anexo baixa clicando, e cada
// resposta tem o seu botão de copiar — antes só existia "copiar tudo".
// ─────────────────────────────────────────────────────────────────────────

export type BriefingRow = {
  id: string;
  token: string;
  orgName: string;
  product_name: string | null;
  template: string;
  status: string;
  submitted_at: string | null;
  created_at: string;
  /** Última mexida do cliente: é o que revela rascunho vivo que ninguém enviou. */
  updated_at: string | null;
  /** Quando o cliente abriu o link pela primeira vez (null = nunca abriu). */
  first_opened_at: string | null;
  respostas: Record<string, string | string[]>;
  files: { name: string; url: string | null }[];
};

type Anexo = { name: string; url: string | null };

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

export function fmtDateShort(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
  }).format(new Date(iso));
}

/** "há 4 dias" — só para dizer se o rascunho está vivo ou parado. */
function desde(iso: string | null): string {
  if (!iso) return '';
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  return `há ${dias} dias`;
}

function answerText(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v.filter((x) => x.trim() !== '').join(', ');
  return (v ?? '').trim();
}

/** Nome do arquivo no Storage sem o timestamp que o upload prefixa. */
function nomeLimpo(n: string): string {
  return n.replace(/^\d+-/, '');
}

/**
 * Mesma normalização que a rota de upload aplica ao gravar o arquivo. É por
 * ela que o nome guardado na resposta ("Logo sem fundo.png") reencontra o
 * arquivo que está no bucket ("1754...-Logo_sem_fundo.png").
 */
function normalizaNome(n: string): string {
  return n.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
}

type Linha = {
  q: OnboardingQuestion;
  /** Resposta de texto/chips. Vazio em pergunta de anexo. */
  val: string;
  /** Anexos da pergunta de arquivo, já casados com o arquivo no Storage. */
  anexos: Anexo[];
  /** Link da pasta, no par anexo + link. */
  link: string;
  /** Chegou pré-preenchido por nós e o cliente não mexeu. */
  nossa: boolean;
  vazia: boolean;
};

type SecaoLida = {
  section: OnboardingSection;
  linhas: Linha[];
  respondidas: number;
};

type BriefingLido = {
  secoes: SecaoLida[];
  /** Respostas de pergunta que saiu do questionário: dado real, não some. */
  orfas: { id: string; val: string }[];
  /** Arquivo no bucket que nenhuma pergunta reclama (upload de briefing antigo). */
  soltos: Anexo[];
  respondidas: number;
  total: number;
  pct: number;
};

/** Texto de uma linha para copiar/colar: resposta, anexos e link juntos. */
function textoDaLinha(l: Linha): string {
  return [l.val, l.anexos.map((a) => a.name).join(', '), l.link].filter(Boolean).join(' · ');
}

/**
 * Lê o briefing contra o template dele: todas as perguntas que valem, com
 * resposta ou sem, mais o que sobrou fora do questionário.
 */
function lerBriefing(row: BriefingRow): BriefingLido {
  const tpl = getOnboardingTemplate(row.template);
  const nossas = new Set(prefilledIds(row.respostas));

  const porNome = new Map<string, Anexo>();
  for (const f of row.files) {
    const nome = nomeLimpo(f.name);
    porNome.set(nome, { name: nome, url: f.url });
  }
  const usados = new Set<string>();

  const lerLinha = (q: OnboardingQuestion): Linha => {
    const bruto = row.respostas[q.id];
    const link = q.link ? answerText(row.respostas[q.link.id]) : '';
    const nossa = nossas.has(q.id);

    if (q.type === 'file') {
      const nomes = Array.isArray(bruto)
        ? bruto.filter((n) => n.trim() !== '')
        : typeof bruto === 'string' && bruto.trim() !== ''
          ? [bruto]
          : [];
      const anexos = nomes.map((n) => {
        const achado = porNome.get(normalizaNome(n));
        if (achado) usados.add(achado.name);
        return achado ?? { name: n, url: null };
      });
      return { q, val: '', anexos, link, nossa, vazia: anexos.length === 0 && link === '' };
    }

    const val = answerText(bruto);
    return { q, val, anexos: [], link, nossa, vazia: val === '' && link === '' };
  };

  const secoes = tpl.sections.map((section) => {
    const linhas = briefingQuestions(section, row.respostas).map(lerLinha);
    return {
      section,
      linhas,
      respondidas: linhas.filter((l) => !l.vazia).length,
    };
  });

  const orfas = orphanAnswers(tpl, row.respostas).map((o) => ({
    id: o.id,
    val: answerText(o.value),
  }));

  const soltos = row.files
    .map((f) => ({ name: nomeLimpo(f.name), url: f.url }))
    .filter((f) => !usados.has(f.name));

  const total = secoes.reduce((n, s) => n + s.linhas.length, 0);
  const respondidas = secoes.reduce((n, s) => n + s.respondidas, 0);

  return {
    secoes,
    orfas,
    soltos,
    respondidas,
    total,
    pct: total === 0 ? 0 : Math.round((respondidas / total) * 100),
  };
}

/** Quanto do questionário está respondido — usado na tabela e no drawer. */
export function progressoBriefing(row: BriefingRow): { respondidas: number; total: number; pct: number } {
  return briefingProgress(getOnboardingTemplate(row.template), row.respostas);
}

/** Rascunho que o cliente mexeu e nunca enviou: é o que passa batido e atrasa o projeto. */
export function rascunhoVivo(row: BriefingRow): boolean {
  return row.status === 'rascunho' && progressoBriefing(row).respondidas > 0;
}

/** Monta o bloco de texto do briefing inteiro para copiar. */
export function buildCopyBlock(r: BriefingRow): string {
  const lido = lerBriefing(r);
  const lines: string[] = [];
  lines.push(`# ${r.orgName}${r.product_name ? ` — ${r.product_name}` : ''}`);
  lines.push(`Status: ${r.status === 'enviado' ? 'respondido' : 'em andamento (não enviado)'}`);
  lines.push(`Respondidas: ${lido.respondidas} de ${lido.total}`);
  lines.push(`Criado em: ${fmtDate(r.created_at)}`);
  if (r.submitted_at) lines.push(`Enviado em: ${fmtDate(r.submitted_at)}`);
  else if (r.updated_at) lines.push(`Última mexida do cliente: ${fmtDate(r.updated_at)}`);
  lines.push('');

  for (const { section, linhas } of lido.secoes) {
    const respondidas = linhas.filter((l) => !l.vazia);
    const vazias = linhas.filter((l) => l.vazia);
    if (respondidas.length === 0 && vazias.length === 0) continue;

    lines.push(`## ${section.title}`);
    for (const l of respondidas) {
      lines.push(l.q.label);
      lines.push(textoDaLinha(l));
      lines.push('');
    }
    if (vazias.length > 0) {
      lines.push(`Em branco: ${vazias.map((l) => l.q.label).join(' | ')}`);
      lines.push('');
    }
  }

  if (lido.orfas.length > 0) {
    lines.push('## Fora do questionário atual');
    for (const o of lido.orfas) {
      lines.push(o.id);
      lines.push(o.val);
      lines.push('');
    }
  }

  if (r.files.length > 0) {
    lines.push('## Anexos');
    for (const f of r.files) lines.push(`- ${nomeLimpo(f.name)}`);
  }

  return lines.join('\n').trim();
}

export function StatusBadge({
  status,
  andamento = false,
}: {
  /** rascunho | enviado. */
  status: string;
  /** Rascunho que o cliente já começou a responder. */
  andamento?: boolean;
}) {
  const [texto, cor] =
    status === 'enviado'
      ? ['respondido', 'bg-success/15 text-success']
      : andamento
        ? ['em andamento', 'bg-primary/15 text-primary']
        : ['aguardando', 'bg-warning/15 text-warning'];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${cor}`}
    >
      {texto}
    </span>
  );
}

export function CopyButton({
  text,
  label,
  className = 'border-border-subtle text-text-secondary hover:border-primary hover:text-primary',
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* ignore */
        }
      }}
      className={[
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors',
        className,
      ].join(' ')}
    >
      {copied ? '✓ copiado' : `⧉ ${label}`}
    </button>
  );
}

/**
 * Apaga o briefing de vez. Confirma no próprio botão (dois cliques) em vez de
 * abrir um confirm() do navegador, e a confirmação diz o que vai embora.
 */
export function ApagarBriefing({ row }: { row: BriefingRow }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pending, start] = useTransition();
  const { respondidas } = progressoBriefing(row);

  const confirmacao =
    respondidas === 0
      ? 'apagar de vez?'
      : `apagar com ${respondidas} ${respondidas === 1 ? 'resposta' : 'respostas'}?`;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirmando) {
          setConfirmando(true);
          setTimeout(() => setConfirmando(false), 5000);
          return;
        }
        start(async () => {
          await apagarBriefing(row.id);
          setConfirmando(false);
        });
      }}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors ${
        confirmando
          ? 'border-danger/50 bg-danger/[0.08] text-danger'
          : 'border-border-subtle text-text-muted hover:border-danger/40 hover:text-danger'
      }`}
    >
      {pending ? 'apagando…' : confirmando ? confirmacao : '⌫ apagar briefing'}
    </button>
  );
}

/**
 * Abre o link do cliente numa aba, do jeito que ele vê (com as respostas dele
 * dentro dos campos). O ?nk=interno evita que a nossa visita seja carimbada
 * como "aberto pelo cliente".
 */
export function AbrirComoCliente({ url }: { url: string }) {
  return (
    <a
      href={`${url}?nk=interno`}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border-subtle px-2.5 py-1.5 font-mono text-xs text-text-secondary transition-colors hover:border-primary hover:text-primary"
    >
      ↗ abrir como o cliente vê
    </a>
  );
}

/**
 * As três datas do briefing: quando mandamos o link, quando o cliente abriu e
 * quando respondeu. Sem a do meio não se sabia se o silêncio era link nunca
 * aberto ou pergunta que travou.
 */
export function BriefingDatas({ row }: { row: BriefingRow }) {
  const itens: { k: string; v: string }[] = [
    { k: 'Link criado', v: fmtDate(row.created_at) },
    {
      k: 'Aberto pelo cliente',
      v: row.first_opened_at ? fmtDate(row.first_opened_at) : 'ainda não abriu',
    },
    {
      k: 'Respondido',
      v: row.submitted_at
        ? fmtDate(row.submitted_at)
        : rascunhoVivo(row)
          ? `não enviou · mexeu ${desde(row.updated_at ?? row.created_at)}`
          : 'não enviou',
    },
  ];

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1.5">
      {itens.map((i) => (
        <div key={i.k}>
          <p className="font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">{i.k}</p>
          <p className="font-mono text-xs text-text-secondary">{i.v}</p>
        </div>
      ))}
    </div>
  );
}

/** Botão de copiar do tamanho de um ícone, para uma resposta só. */
function CopyMini({ text, titulo }: { text: string; titulo: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title={titulo}
      aria-label={titulo}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] leading-none transition-colors ${
        copied
          ? 'text-success'
          : 'text-text-muted/60 hover:bg-primary/[0.08] hover:text-primary'
      }`}
    >
      {copied ? '✓' : '⧉'}
    </button>
  );
}

/**
 * O que o cliente escreveu, com URL e e-mail clicáveis. Ele cola link de pasta
 * do Drive no meio da resposta, e link que não abre obriga a selecionar,
 * copiar e colar na barra do navegador.
 */
function TextoComLinks({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const re = /(https?:\/\/\S+|www\.\S+|[\w.+-]+@[\w-]+\.[\w.]{2,})/g;
  let fim = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    let alvo = m[0];
    // Pontuação encostada no fim ("...pasta)." ) não faz parte do endereço.
    const cauda = alvo.match(/[.,;:!?)\]}'"]+$/);
    if (cauda) alvo = alvo.slice(0, -cauda[0].length);
    if (!alvo) continue;

    const email = !alvo.startsWith('http') && alvo.includes('@');
    const href = email ? `mailto:${alvo}` : alvo.startsWith('http') ? alvo : `https://${alvo}`;

    if (m.index > fim) nodes.push(text.slice(fim, m.index));
    nodes.push(
      <a
        key={`${m.index}-${alvo}`}
        href={href}
        target={email ? undefined : '_blank'}
        rel={email ? undefined : 'noreferrer'}
        className="break-all text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
      >
        {alvo}
      </a>,
    );
    fim = m.index + alvo.length;
  }

  if (fim < text.length) nodes.push(text.slice(fim));
  return <>{nodes}</>;
}

function AnexoChip({ anexo }: { anexo: Anexo }) {
  if (!anexo.url) {
    return (
      <span
        title="O cliente marcou este arquivo, mas ele não está no bucket"
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border-subtle px-2 py-1 text-xs text-text-muted"
      >
        📎 {anexo.name}
      </span>
    );
  }
  return (
    <a
      href={anexo.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle px-2 py-1 text-xs text-text-secondary transition-colors hover:border-primary hover:text-primary"
    >
      📎 {anexo.name}
    </a>
  );
}

function Resposta({ linha }: { linha: Linha }) {
  if (linha.vazia) {
    return (
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-warning/80">
        em branco
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {linha.val !== '' && (
        <p className="whitespace-pre-wrap text-sm text-text-primary">
          <TextoComLinks text={linha.val} />
        </p>
      )}
      {linha.anexos.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {linha.anexos.map((a) => (
            <AnexoChip key={a.name} anexo={a} />
          ))}
        </div>
      )}
      {linha.link !== '' && (
        <p className="text-sm text-text-primary">
          <TextoComLinks text={linha.link} />
        </p>
      )}
    </div>
  );
}

export function OnboardingView({
  rows,
  siteUrl,
}: {
  rows: BriefingRow[];
  siteUrl: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(() => rows.find((r) => r.id === openId) ?? null, [rows, openId]);
  const vivos = useMemo(() => rows.filter(rascunhoVivo), [rows]);

  if (rows.length === 0) {
    return <p className="text-sm text-text-muted">Nenhum briefing ainda.</p>;
  }

  return (
    <>
      {/* Rascunho respondido e não enviado não avisa ninguém: o e-mail só sai
          no envio. Aqui ele fica na cara de quem abre a tela. */}
      {vivos.length > 0 && (
        <div className="mb-4 rounded-lg border border-warning/40 bg-warning/[0.07] px-4 py-3">
          <p className="font-label text-[11px] uppercase tracking-[0.16em] text-warning">
            ⚠ {vivos.length} briefing{vivos.length === 1 ? '' : 's'} em andamento sem envio
          </p>
          <div className="mt-1.5 flex flex-col gap-1">
            {vivos.map((r) => {
              const p = progressoBriefing(r);
              return (
                <button
                  key={r.id}
                  onClick={() => setOpenId(r.id)}
                  className="text-left text-sm text-text-secondary hover:text-primary"
                >
                  <b className="font-medium text-text-primary">{r.orgName}</b> respondeu{' '}
                  {p.respondidas} de {p.total} · mexeu {desde(r.updated_at ?? r.created_at)} · abrir →
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabela de briefings */}
      <div className="overflow-x-auto rounded-lg border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-elevated/40 text-left">
              <th className="px-4 py-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">Cliente</th>
              <th className="px-4 py-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">Projeto</th>
              <th className="px-4 py-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">Status</th>
              <th className="px-4 py-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">Respondidas</th>
              <th className="px-4 py-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">Link criado</th>
              <th className="px-4 py-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">Abriu</th>
              <th className="px-4 py-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">Respondeu</th>
              <th className="px-4 py-3 font-label text-[10px] uppercase tracking-[0.14em] text-text-muted">Mexeu</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const enviado = r.status === 'enviado';
              const p = progressoBriefing(r);
              return (
                <tr
                  key={r.id}
                  onClick={() => setOpenId(r.id)}
                  className="cursor-pointer border-b border-border-subtle/60 transition-colors last:border-0 hover:bg-surface-elevated/40"
                >
                  <td className="px-4 py-3 font-medium text-text-primary">{r.orgName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{r.product_name ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} andamento={rascunhoVivo(r)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-secondary">
                        {p.respondidas}/{p.total}
                      </span>
                      <span className="h-1 w-14 overflow-hidden rounded-full bg-border-subtle">
                        <span
                          className={`block h-full rounded-full ${enviado ? 'bg-success' : 'bg-primary'}`}
                          style={{ width: `${p.pct}%` }}
                        />
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{fmtDateShort(r.created_at)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">
                    {r.first_opened_at ? fmtDateShort(r.first_opened_at) : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{fmtDateShort(r.submitted_at)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">
                    {enviado ? '—' : desde(r.updated_at ?? r.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {/* O link de responder fica na própria linha: é o que se manda
                        pro cliente, e vivia escondido dentro do briefing aberto. */}
                    <div className="flex items-center justify-end gap-3">
                      {!enviado && <CopyLink url={`${siteUrl}/onboarding/${r.token}`} destaque />}
                      <span className="font-mono text-xs text-primary">abrir →</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drawer com o briefing completo */}
      {open && (
        <BriefingDrawer
          row={open}
          link={`${siteUrl}/onboarding/${open.token}`}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}

function BriefingDrawer({
  row,
  link,
  onClose,
}: {
  row: BriefingRow;
  link: string;
  onClose: () => void;
}) {
  const enviado = row.status === 'enviado';
  const copyText = useMemo(() => buildCopyBlock(row), [row]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
      />

      {/* Painel */}
      <aside className="relative flex h-full w-full max-w-[42rem] flex-col overflow-y-auto border-l border-black/[0.06] bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border-subtle bg-white px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-semibold leading-tight text-text-primary">{row.orgName}</h2>
                <StatusBadge status={row.status} andamento={rascunhoVivo(row)} />
              </div>
              {row.product_name && (
                <p className="mt-0.5 font-mono text-xs text-text-muted">{row.product_name}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="rounded-md px-2 py-1 text-lg leading-none text-text-muted transition-colors hover:text-text-primary"
            >
              ×
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CopyButton text={copyText} label="copiar tudo" />
            <AbrirComoCliente url={link} />
            {!enviado && <CopyLink url={link} />}
            <ApagarBriefing row={row} />
          </div>

          <div className="mt-3.5 border-t border-border-subtle pt-3">
            <BriefingDatas row={row} />
          </div>
        </div>

        <BriefingConteudo row={row} />
      </aside>
    </div>
  );
}

/**
 * O briefing por dentro: progresso, respostas por seção (com as em branco à
 * vista) e o que sobrou fora do questionário. Vive fora do drawer porque a
 * mesma coisa aparece na aba Onboarding dentro do cliente, em /admin/clientes.
 */
export function BriefingConteudo({ row }: { row: BriefingRow }) {
  const lido = useMemo(() => lerBriefing(row), [row]);

  return (
    <div className="px-6 py-5">
      {/* Quanto do questionário veio respondido, e o que falta cobrar. */}
      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-mono text-xs text-text-secondary">
          {lido.respondidas} de {lido.total} perguntas respondidas
        </span>
        <span className="h-1.5 min-w-[7rem] flex-1 overflow-hidden rounded-full bg-border-subtle">
          <span
            className="block h-full rounded-full bg-primary"
            style={{ width: `${lido.pct}%` }}
          />
        </span>
        {lido.total > lido.respondidas && (
          <span className="font-mono text-xs text-warning">
            {lido.total - lido.respondidas} em branco
          </span>
        )}
      </div>

      {/* Respostas por seção, separadas por filete */}
      {lido.total === 0 ? (
        <p className="text-sm text-text-muted">Este template não tem perguntas.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border-subtle">
          {lido.secoes.map(({ section, linhas, respondidas }) => (
            <section key={section.id} className="py-5 first:pt-0 last:pb-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-label text-[11px] uppercase tracking-[0.18em] text-primary">
                  {section.title}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-text-muted">
                    {respondidas}/{linhas.length}
                  </span>
                  {respondidas > 0 && (
                    <CopyMini
                      titulo={`Copiar a seção ${section.title}`}
                      text={[
                        section.title,
                        ...linhas
                          .filter((l) => !l.vazia)
                          .map((l) => `${l.q.label}\n${textoDaLinha(l)}`),
                      ].join('\n\n')}
                    />
                  )}
                </div>
              </div>
              <dl className="flex flex-col gap-3.5">
                {linhas.map((linha) => (
                  <div key={linha.q.id} className="grid grid-cols-1 gap-0.5">
                    <dt className="flex items-start justify-between gap-2 text-xs text-text-muted">
                      <span>
                        {linha.q.label}
                        {linha.nossa && (
                          <span className="ml-1.5 font-label text-[10px] uppercase tracking-[0.12em] text-text-muted/80">
                            · preenchido por nós, cliente não mexeu
                          </span>
                        )}
                      </span>
                      {!linha.vazia && (
                        <CopyMini titulo="Copiar esta resposta" text={textoDaLinha(linha)} />
                      )}
                    </dt>
                    <dd>
                      <Resposta linha={linha} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}

          {/* Resposta de pergunta que saiu do questionário. Sem isso ela fica
              gravada no banco e invisível na tela — foi o caso do catálogo
              pré-preenchido da Aiedem. */}
          {lido.orfas.length > 0 && (
            <section className="py-5 last:pb-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-label text-[11px] uppercase tracking-[0.18em] text-text-muted">
                  Fora do questionário atual
                </p>
                <CopyMini
                  titulo="Copiar estas respostas"
                  text={lido.orfas.map((o) => `${o.id}\n${o.val}`).join('\n\n')}
                />
              </div>
              <p className="mb-3 text-xs text-text-muted">
                O cliente respondeu, e depois a pergunta saiu do briefing. Fica aqui para não
                se perder.
              </p>
              <dl className="flex flex-col gap-3.5">
                {lido.orfas.map((o) => (
                  <div key={o.id} className="grid grid-cols-1 gap-0.5">
                    <dt className="flex items-start justify-between gap-2 font-mono text-[11px] text-text-muted">
                      <span>{o.id}</span>
                      <CopyMini titulo="Copiar esta resposta" text={o.val} />
                    </dt>
                    <dd className="whitespace-pre-wrap text-sm text-text-primary">
                      <TextoComLinks text={o.val} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Arquivo no bucket que nenhuma pergunta reclama. */}
          {lido.soltos.length > 0 && (
            <section className="py-5 last:pb-0">
              <p className="mb-2 font-label text-[11px] uppercase tracking-[0.18em] text-text-muted">
                Outros anexos
              </p>
              <div className="flex flex-wrap gap-1.5">
                {lido.soltos.map((a) => (
                  <AnexoChip key={a.name} anexo={a} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
