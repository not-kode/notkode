'use client';

// Peças do quadro de Entregas. Aqui a linguagem visual é de ferramenta de tarefas
// (cartão com sombra, avatar, chip de prioridade, prazo com calendário), e não a
// do site: o que ajuda a bater o olho e entender é cor e forma, não sobriedade.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Check, ChevronDown, Pause, Play, Plus, X } from 'lucide-react';
import {
  PRIORITIES, PRIORITY_LABELS, TAG_COLORS, TAG_COLOR_LABELS, TAG_DOT, TAG_TOM, corDaTag,
  type Priority, type TagColor,
} from './status';
import type { Pessoa, TagView } from './types';

export const inputCls =
  'w-full rounded-sm border border-black/[0.08] bg-white px-2.5 py-1.5 text-sm text-text-primary ' +
  'outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10';

export const fmtDate = (d: string | null | undefined) => {
  if (!d) return null;
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y.slice(2)}`;
};

/** "3 ago" — data curta, como se lê num cartão. */
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const fmtCurto = (d: string | null | undefined) => {
  if (!d) return null;
  const [, m, day] = d.split('-');
  return `${Number(day)} ${MESES[Number(m) - 1]}`;
};

export const hoje = () => new Date().toISOString().slice(0, 10);

/** Diferença em dias entre duas datas AAAA-MM-DD (b − a). */
export const diffDias = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

export const somaDias = (d: string, n: number) =>
  new Date(Date.parse(`${d}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

// ── Avatar ───────────────────────────────────────────────────────────────────

const CORES_AVATAR = [
  'bg-cyan-600', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-600',
  'bg-rose-600', 'bg-teal-600', 'bg-indigo-600', 'bg-orange-600',
];

const iniciais = (nome: string) =>
  nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';

const corDoNome = (nome: string) =>
  CORES_AVATAR[[...nome].reduce((a, c) => a + c.charCodeAt(0), 0) % CORES_AVATAR.length];

/**
 * Mesma bolinha do avatar, mas sem clique: serve para marcar a empresa dona da
 * tarefa. Fica dentro de um botão (o nome da empresa), e botão dentro de botão
 * não é HTML válido.
 */
export function Sigla({ nome }: { nome: string }) {
  return (
    <span
      title={nome}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${corDoNome(nome)}`}
    >
      {iniciais(nome)}
    </span>
  );
}

/**
 * Círculo com as iniciais de quem toca a tarefa; a cor é estável por nome.
 *
 * É um span, não um botão: o avatar aparece sempre dentro do botão que abre a
 * escolha de responsável, e botão dentro de botão é HTML inválido — o React
 * reclamava disso no console e quebrava a hidratação da página.
 */
export function Avatar({ nome }: { nome: string | null }) {
  if (!nome?.trim()) {
    return (
      <span
        title="Definir responsável"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-black/20 text-[10px] text-text-muted transition-colors"
      >
        +
      </span>
    );
  }
  return <Sigla nome={nome} />;
}

// ── Menu suspenso ────────────────────────────────────────────────────────────

/**
 * Fecha ao clicar fora ou apertar Esc. `extra` existe para o menu que sai em
 * portal: ele fica fora da árvore do gatilho, e sem isso o mousedown no item
 * seria lido como clique fora e fecharia antes do clique chegar.
 */
function useForaDoElemento(aberto: boolean, fechar: () => void, extra?: React.RefObject<HTMLElement | null>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (extra?.current?.contains(alvo)) return;
      if (ref.current && !ref.current.contains(alvo)) fechar();
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar(); };
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', fora); document.removeEventListener('keydown', esc); };
  }, [aberto, fechar, extra]);
  return ref;
}

/**
 * Onde desenhar um menu suspenso que precisa escapar da tabela. Devolve
 * coordenadas de tela (o menu vai em portal, com position fixed) e vira o menu
 * para cima ou para a esquerda quando encostaria na borda da janela.
 *
 * Existe porque a visão Lista rola na horizontal, e qualquer overflow recorta
 * elementos filhos: menu preso na célula aparecia cortado.
 */
function usePosicaoMenu(aberto: boolean, botaoRef: React.RefObject<HTMLButtonElement | null>, largura: number, altura: number) {
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!aberto) { setPos(null); return; }
    const b = botaoRef.current?.getBoundingClientRect();
    if (!b) return;
    const abaixo = b.bottom + altura < window.innerHeight;
    setPos({
      left: Math.max(8, Math.min(b.left, window.innerWidth - largura - 8)),
      top: abaixo ? b.bottom + 4 : Math.max(8, b.top - altura - 4),
    });
  }, [aberto, botaoRef, largura, altura]);

  // Rolar com o menu aberto deixaria a lista longe do chip: fecha.
  return pos;
}

/**
 * Fecha o menu quando a página rola ou a janela muda de tamanho — o menu vai em
 * portal com posição fixa, então rolar a tela o deixaria longe do chip.
 *
 * Rolar DENTRO do menu não conta: a lista de responsáveis tem barra própria, e
 * sem esta exceção o menu se fechava sozinho na primeira rolagem (inclusive na
 * que o navegador faz ao dar foco no campo de busca), antes de dar para clicar
 * em alguém.
 */
function useFechaAoRolar(aberto: boolean, fechar: () => void, dentro?: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!aberto) return;
    const aoRolar = (e: Event) => {
      const alvo = e.target as Node | null;
      if (alvo && dentro?.current?.contains(alvo)) return;
      fechar();
    };
    window.addEventListener('scroll', aoRolar, true);
    window.addEventListener('resize', fechar);
    return () => {
      window.removeEventListener('scroll', aoRolar, true);
      window.removeEventListener('resize', fechar);
    };
  }, [aberto, fechar, dentro]);
}

const PRIORITY_DOT: Record<Priority, string> = {
  baixa: 'bg-neutral-300',
  media: 'bg-primary',
  alta: 'bg-warning',
  urgente: 'bg-danger',
};

/**
 * Só o urgente ganha cor de fundo. "Alta" é a prioridade da maioria das tarefas
 * aqui, e uma coluna inteira de tarja âmbar não é aviso nenhum: vira ruído em
 * cima do que realmente pede olho (prazo vencido, sprint parada). O tom da
 * prioridade fica no pontinho.
 */
const PRIORITY_CHIP: Record<Priority, string> = {
  baixa: 'bg-black/[0.04] text-text-muted',
  media: 'bg-black/[0.04] text-text-secondary',
  alta: 'bg-black/[0.04] text-text-secondary',
  urgente: 'bg-danger/12 text-danger',
};

/**
 * A prioridade só de ler. Existe separada do chip clicável porque a mesma
 * linguagem visual vale para a tela do cliente, onde nada se edita — e um chip
 * que parece botão e não faz nada é pior do que texto.
 */
export function PriorityTag({ value, compacto }: { value: Priority; compacto?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_CHIP[value]}`}
      title={PRIORITY_LABELS[value]}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[value]}`} />
      {!compacto && PRIORITY_LABELS[value]}
    </span>
  );
}

/** Chip de prioridade que abre a escolha ao clicar. */
export function PriorityChip({ value, onChange, compacto }: {
  value: Priority;
  onChange: (v: Priority) => void;
  compacto?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const ref = useForaDoElemento(aberto, () => setAberto(false), menuRef);
  const pos = usePosicaoMenu(aberto, botaoRef, 128, 150);
  useFechaAoRolar(aberto, () => setAberto(false), menuRef);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={botaoRef}
        onClick={() => setAberto((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium transition-opacity hover:opacity-80 ${PRIORITY_CHIP[value]}`}
        title="Prioridade"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[value]}`} />
        {!compacto && PRIORITY_LABELS[value]}
      </button>

      {aberto && pos && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 w-32 overflow-hidden rounded-md border border-black/[0.08] bg-white py-1 shadow-[0_8px_24px_rgba(16,24,40,0.14)]"
          style={{ left: pos.left, top: pos.top }}
        >
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => { onChange(p); setAberto(false); }}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs text-text-secondary transition-colors hover:bg-black/[0.04]"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[p]}`} />
              {PRIORITY_LABELS[p]}
              {p === value && <Check className="ml-auto h-3 w-3 text-primary" />}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

/**
 * Menu do botão direito, aberto onde o cursor está. Serve para o que é ação de
 * exceção (apagar, reabrir) e não merece um botão fixo ocupando a linha.
 */
export function MenuContexto({ em, itens, fechar }: {
  em: { x: number; y: number };
  itens: { label: string; onClick: () => void; perigo?: boolean }[];
  fechar: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const ref = useForaDoElemento(true, fechar, menuRef);
  useFechaAoRolar(true, fechar, menuRef);

  // Perto da borda o menu abre para dentro, senão fica cortado pela janela.
  const left = Math.min(em.x, (typeof window !== 'undefined' ? window.innerWidth : 0) - 184);
  const top = Math.min(em.y, (typeof window !== 'undefined' ? window.innerHeight : 0) - 8 - itens.length * 32);

  return createPortal(
    <div ref={ref}>
      <div
        ref={menuRef}
        className="fixed z-50 w-44 overflow-hidden rounded-md border border-black/[0.08] bg-white py-1 shadow-[0_8px_24px_rgba(16,24,40,0.16)]"
        style={{ left: Math.max(8, left), top: Math.max(8, top) }}
      >
        {itens.map((i) => (
          <button
            key={i.label}
            onClick={() => { i.onClick(); fechar(); }}
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
              i.perigo
                ? 'text-danger hover:bg-danger/[0.07]'
                : 'text-text-secondary hover:bg-black/[0.04]'
            }`}
          >
            {i.label}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Quem toca a tarefa, escolhido numa lista em vez de digitado.
 *
 * Digitar o nome toda vez fazia a mesma pessoa virar três ("Camila", "camila
 * gregório", "Cami") e nenhuma busca por responsável fechava a conta. A lista
 * traz a equipe (quem tem login) e os nomes que já respondem por alguma tarefa;
 * nome que ainda não existe entra digitando, e da próxima vez já aparece na
 * lista. A agenda de contatos não entra: são dezenas de nomes, com a mesma
 * pessoa aparecendo como contato e como empresa, para escolher entre três.
 */
export function PessoaSelect({ value, pessoas, onChange, compacto = false }: {
  value: string | null;
  pessoas: Pessoa[];
  onChange: (v: string) => void;
  /** Só o avatar, para caber na célula da lista e no card do quadro. */
  compacto?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const buscaRef = useRef<HTMLInputElement>(null);
  const ref = useForaDoElemento(aberto, () => setAberto(false), menuRef);
  const pos = usePosicaoMenu(aberto, botaoRef, 208, 288);

  // Foco sem rolar: `autoFocus` fazia o navegador trazer o campo para a vista, e
  // essa rolagem fechava o menu recém-aberto antes de dar para escolher alguém.
  useEffect(() => {
    if (aberto && pos) buscaRef.current?.focus({ preventScroll: true });
  }, [aberto, pos]);
  useFechaAoRolar(aberto, () => setAberto(false), menuRef);

  const termo = busca.trim().toLowerCase();
  const achadas = pessoas.filter((p) => !termo || p.nome.toLowerCase().includes(termo));
  const nomeNovo = busca.trim();
  const inedito = nomeNovo.length > 1 && !pessoas.some((p) => p.nome.toLowerCase() === nomeNovo.toLowerCase());

  const escolher = (nome: string) => {
    onChange(nome);
    setBusca('');
    setAberto(false);
  };

  const grupos: { titulo: string; itens: Pessoa[] }[] = [
    { titulo: 'Equipe', itens: achadas.filter((p) => p.tipo === 'equipe') },
    { titulo: 'Outros', itens: achadas.filter((p) => p.tipo === 'externo') },
  ].filter((g) => g.itens.length > 0);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={botaoRef}
        onClick={() => setAberto((v) => !v)}
        title={value || 'Definir responsável'}
        className={compacto ? '' : 'inline-flex max-w-[10rem] items-center gap-1.5 rounded-full px-1 py-0.5 text-[12px] text-text-secondary transition-opacity hover:opacity-80'}
      >
        <Avatar nome={value} />
        {!compacto && <span className="truncate">{value || 'quem toca'}</span>}
      </button>

      {aberto && pos && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 w-52 overflow-hidden rounded-md border border-black/[0.08] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.14)]"
          style={{ left: pos.left, top: pos.top }}
        >
          <input
            ref={buscaRef}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inedito) escolher(nomeNovo);
              if (e.key === 'Enter' && !inedito && achadas[0]) escolher(achadas[0].nome);
            }}
            placeholder="Buscar ou escrever"
            className="w-full border-b border-black/[0.06] px-2.5 py-2 text-xs outline-none placeholder:text-text-muted"
          />

          <div className="max-h-56 overflow-y-auto py-1">
            {inedito && (
              <button
                onClick={() => escolher(nomeNovo)}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs text-primary transition-colors hover:bg-primary/[0.06]"
              >
                <Plus className="h-3 w-3 shrink-0" />
                <span className="truncate">usar “{nomeNovo}”</span>
              </button>
            )}

            {grupos.map((g) => (
              <div key={g.titulo}>
                <p className="px-2.5 pb-0.5 pt-1.5 font-label text-[9px] uppercase tracking-[0.14em] text-text-muted">
                  {g.titulo}
                </p>
                {g.itens.map((p) => (
                  <button
                    key={`${p.tipo}-${p.nome}`}
                    onClick={() => escolher(p.nome)}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs text-text-secondary transition-colors hover:bg-black/[0.04]"
                  >
                    <Avatar nome={p.nome} />
                    <span className="truncate">{p.nome}</span>
                    {p.nome === value && <Check className="ml-auto h-3 w-3 shrink-0 text-primary" />}
                  </button>
                ))}
              </div>
            ))}

            {value && (
              <button
                onClick={() => escolher('')}
                className="mt-1 flex w-full items-center gap-2 border-t border-black/[0.06] px-2.5 py-1.5 text-left text-xs text-text-muted transition-colors hover:bg-black/[0.04]"
              >
                sem responsável
              </button>
            )}

            {grupos.length === 0 && !inedito && (
              <p className="px-2.5 py-2 text-xs text-text-muted">Ninguém com esse nome.</p>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

/** Menu genérico (status, etapa) com a mesma cara do chip de prioridade. */
export function ChipSelect({ value, options, onChange, tone = 'bg-black/[0.04] text-text-secondary', titulo, placeholder }: {
  value: string;
  options: { value: string; label: string; dot?: string }[];
  onChange: (v: string) => void;
  tone?: string;
  titulo?: string;
  placeholder?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const ref = useForaDoElemento(aberto, () => setAberto(false), menuRef);
  const pos = usePosicaoMenu(aberto, botaoRef, 176, 224);
  useFechaAoRolar(aberto, () => setAberto(false), menuRef);
  const atual = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={botaoRef}
        onClick={() => setAberto((v) => !v)}
        title={titulo}
        className={`inline-flex max-w-[9rem] items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-opacity hover:opacity-80 ${tone}`}
      >
        {atual?.dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${atual.dot}`} />}
        <span className="truncate">{atual?.label ?? placeholder ?? '—'}</span>
        <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
      </button>

      {aberto && pos && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 max-h-56 w-44 overflow-y-auto rounded-md border border-black/[0.08] bg-white py-1 shadow-[0_8px_24px_rgba(16,24,40,0.14)]"
          style={{ left: pos.left, top: pos.top }}
        >
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setAberto(false); }}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs text-text-secondary transition-colors hover:bg-black/[0.04]"
            >
              {o.dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${o.dot}`} />}
              <span className="truncate">{o.label}</span>
              {o.value === value && <Check className="ml-auto h-3 w-3 shrink-0 text-primary" />}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────

/**
 * Data só de ler, com o mesmo desenho do chip editável: calendário, vermelho
 * quando venceu, vermelho lavado quando é hoje ou amanhã.
 *
 * whitespace-nowrap: "12 mai" quebrando em duas linhas empilhava a data e
 * esticava a altura da linha inteira da tabela.
 */
export function DateTag({ value, atrasada, quieta, placeholder = 'prazo', curto = true }: {
  value: string | null;
  atrasada?: boolean;
  /** Data que não cobra mais nada (tarefa concluída): fica cinza, sem alarme. */
  quieta?: boolean;
  placeholder?: string;
  curto?: boolean;
}) {
  // "Próxima" é hoje ou amanhã, não qualquer coisa no passado: sem o piso em
  // zero, um prazo de duas semanas atrás saía em âmbar como se fosse pra já.
  const dias = value ? diffDias(hoje(), value) : null;
  const proxima = !quieta && dias !== null && !atrasada && dias >= 0 && dias <= 1;
  // Prazo é assunto de vermelho: vencido no tom cheio, vencendo hoje ou amanhã
  // num vermelho lavado. O âmbar saiu daqui porque disputava a atenção com o
  // âmbar da sprint pausada e o da revisão, e no fim nada mais gritava.
  const tom = atrasada && !quieta
    ? 'bg-danger/12 text-danger'
    : proxima
      ? 'bg-danger/[0.06] text-danger/85'
      : value
        ? 'bg-black/[0.04] text-text-secondary'
        : 'text-text-muted';

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums ${tom}`}
      title={(value ? fmtDate(value) : undefined) ?? undefined}
    >
      <Calendar className="h-3 w-3" />
      {(curto ? fmtCurto(value) : fmtDate(value)) ?? placeholder}
    </span>
  );
}

/** Prazo como chip com calendário: vermelho quando venceu, âmbar quando é hoje ou amanhã. */
export function DateChip({ value, onSave, atrasada, quieta, placeholder = 'prazo', curto = true }: {
  value: string | null;
  onSave: (v: string) => void;
  atrasada?: boolean;
  /** Data que não cobra mais nada (tarefa concluída): fica cinza, sem alarme. */
  quieta?: boolean;
  placeholder?: string;
  curto?: boolean;
}) {
  const dias = value ? diffDias(hoje(), value) : null;
  const proxima = !quieta && dias !== null && !atrasada && dias >= 0 && dias <= 1;

  // whitespace-nowrap no chip: "12 mai" quebrando em duas linhas empilhava a data
  // e esticava a altura da linha inteira da tabela.
  //
  // Vencido no vermelho cheio, vencendo hoje ou amanhã num vermelho lavado: o
  // âmbar saiu daqui porque disputava a atenção com o da sprint pausada e o da
  // revisão, e no fim nada mais gritava.
  const tom = atrasada && !quieta
    ? 'bg-danger/12 text-danger'
    : proxima
      ? 'bg-danger/[0.06] text-danger/85'
      : value
        ? 'bg-black/[0.04] text-text-secondary'
        : 'text-text-muted hover:bg-black/[0.04]';

  /**
   * O chip nunca sai da tela: o campo de data fica invisível por cima dele e é
   * quem abre o calendário. Antes o chip virava um input, que é bem mais largo,
   * e a linha inteira se mexia a cada clique — escolher a data empurrava as
   * colunas de lugar e depois tudo voltava a encolher.
   */
  return (
    <span className="relative inline-flex">
      <span
        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums transition-colors ${tom}`}
        title={value ? `Prazo: ${fmtDate(value)}` : 'Definir prazo'}
      >
        <Calendar className="h-3 w-3" />
        {(curto ? fmtCurto(value) : fmtDate(value)) ?? placeholder}
      </span>
      <input
        type="date"
        value={value ?? ''}
        aria-label={value ? `Prazo ${fmtDate(value)}` : 'Definir prazo'}
        onChange={(e) => { if (e.target.value !== (value ?? '')) onSave(e.target.value); }}
        onClick={(e) => e.currentTarget.showPicker?.()}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </span>
  );
}

// ── Cronômetro ───────────────────────────────────────────────────────────────

/** "1h20", "45min", "—". Tempo de trabalho se lê arredondado, não em segundos. */
export const fmtDuracao = (segundos: number): string => {
  if (segundos < 60) return segundos > 0 ? 'menos de 1min' : '—';
  const min = Math.round(segundos / 60);
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto ? `${h}h${String(resto).padStart(2, '0')}` : `${h}h`;
};

/** Enquanto corre, o relógio anda de verdade: 12:04, 1:12:04. */
const fmtRelogio = (segundos: number): string => {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0');
  return `${h ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
};

/**
 * Play/pause do tempo gasto na tarefa. O acumulado vem do banco; o que está
 * correndo é contado aqui na tela a partir do instante em que foi ligado, então
 * fechar o navegador não perde nem inventa tempo.
 */
export function TimerChip({ segundos, rodandoDesde, onToggle, desabilitado }: {
  segundos: number;
  rodandoDesde: string | null;
  onToggle: () => void;
  desabilitado?: boolean;
}) {
  // Só depois de montar, senão o servidor renderiza um relógio diferente do cliente.
  const [agora, setAgora] = useState<number | null>(null);
  useEffect(() => {
    if (!rodandoDesde) { setAgora(null); return; }
    setAgora(Date.now());
    const i = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(i);
  }, [rodandoDesde]);

  const correndo = !!rodandoDesde;
  const emCurso = correndo && agora ? Math.max(0, Math.round((agora - Date.parse(rodandoDesde!)) / 1000)) : 0;
  const total = segundos + emCurso;

  return (
    <button
      onClick={onToggle}
      disabled={desabilitado}
      title={correndo ? 'Pausar o cronômetro' : total > 0 ? `Retomar (${fmtDuracao(total)} até agora)` : 'Começar a contar o tempo'}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums transition-colors disabled:opacity-40 ${
        correndo
          ? 'bg-primary/12 text-primary'
          : total > 0
            ? 'bg-black/[0.04] text-text-secondary hover:bg-black/[0.07]'
            : 'text-text-muted hover:bg-black/[0.04]'
      }`}
    >
      {correndo ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
      {correndo ? fmtRelogio(total) : total > 0 ? fmtDuracao(total) : 'tempo'}
    </button>
  );
}

// ── Texto editável ───────────────────────────────────────────────────────────

/**
 * Texto que vira campo ao clicar e salva ao sair. É assim que se renomeia uma
 * tarefa ou uma etapa: sem abrir modal, sem botão de salvar.
 */
export function InlineText({
  value, onSave, placeholder, className = '', title, abrirAoMontar,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  className?: string;
  title?: string;
  abrirAoMontar?: boolean;
}) {
  const [editando, setEditando] = useState(!!abrirAoMontar);
  const [rascunho, setRascunho] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => setRascunho(value), [value]);
  useEffect(() => { if (editando) ref.current?.select(); }, [editando]);

  const confirmar = () => {
    setEditando(false);
    const limpo = rascunho.trim();
    if (limpo && limpo !== value) onSave(limpo);
    else setRascunho(value);
  };

  if (editando) {
    return (
      <input
        ref={ref}
        value={rascunho}
        onChange={(e) => setRascunho(e.target.value)}
        onBlur={confirmar}
        onKeyDown={(e) => {
          if (e.key === 'Enter') confirmar();
          if (e.key === 'Escape') { setRascunho(value); setEditando(false); }
        }}
        className="w-full rounded-sm border border-primary/40 bg-white px-1.5 py-0.5 text-inherit outline-none"
        placeholder={placeholder}
      />
    );
  }

  return (
    <button
      onClick={() => setEditando(true)}
      title={title ?? 'Clique para renomear'}
      className={`min-w-0 truncate rounded-sm px-1 py-0.5 text-left transition-colors hover:bg-black/[0.04] ${className}`}
    >
      {value || <span className="text-text-muted">{placeholder ?? '—'}</span>}
    </button>
  );
}

// ── Tags ─────────────────────────────────────────────────────────────────────

/** A tag como o mundo vê: nome curto num chip da cor escolhida no cadastro. */
export function TagChip({ nome, cor, compacto = false }: { nome: string; cor: string; compacto?: boolean }) {
  return (
    <span
      className={`inline-flex max-w-[8rem] items-center rounded-full font-medium ${TAG_TOM[corDaTag(cor)]} ${
        compacto ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-[11px]'
      }`}
      title={nome}
    >
      <span className="truncate">{nome}</span>
    </span>
  );
}

/**
 * As tags de uma tarefa. O popover é onde a tag VIVE: marca, desmarca, cria uma
 * nova ali mesmo (digitando o nome e escolhendo a cor), troca a cor de uma que
 * já existe e apaga do projeto. Não existe tela de cadastro à parte — tag nasce
 * dentro da tarefa, que é onde você percebe que precisa dela.
 */
export function TagsSelect({ value, tags, onChange, onCriar, onCor, onApagar, compacto = false }: {
  value: string[];
  tags: TagView[];
  onChange: (ids: string[]) => void;
  /** Cria a tag no projeto e já marca esta tarefa com ela. */
  onCriar?: (nome: string, cor: string) => void;
  onCor?: (id: string, cor: string) => void;
  onApagar?: (tag: TagView) => void;
  compacto?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [cor, setCor] = useState<TagColor>('azul');
  const menuRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const ref = useForaDoElemento(aberto, () => setAberto(false), menuRef);
  const pos = usePosicaoMenu(aberto, botaoRef, 224, 300);
  useFechaAoRolar(aberto, () => setAberto(false), menuRef);

  const marcadas = tags.filter((t) => value.includes(t.id));
  const alternar = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  const limpo = busca.trim();
  const filtradas = limpo
    ? tags.filter((t) => t.nome.toLowerCase().includes(limpo.toLowerCase()))
    : tags;
  // Nome que ainda não existe: o popover oferece criar em vez de dizer "nada encontrado".
  const podeCriar = !!limpo && !tags.some((t) => t.nome.toLowerCase() === limpo.toLowerCase());

  const criar = () => {
    if (!podeCriar || !onCriar) return;
    onCriar(limpo, cor);
    setBusca('');
    setAberto(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        ref={botaoRef}
        onClick={() => setAberto((v) => !v)}
        title="Tags da tarefa"
        className="flex max-w-full flex-wrap items-center gap-1 rounded-sm px-1 py-0.5 text-left transition-colors hover:bg-black/[0.04]"
      >
        {marcadas.length > 0 ? (
          marcadas.slice(0, 2).map((t) => <TagChip key={t.id} nome={t.nome} cor={t.cor} compacto={compacto} />)
        ) : (
          <span className="inline-flex items-center gap-0.5 text-[11px] text-text-muted/70">
            <Plus className="h-3 w-3" />
            tag
          </span>
        )}
        {marcadas.length > 2 && (
          <span className="text-[10px] tabular-nums text-text-muted">+{marcadas.length - 2}</span>
        )}
      </button>

      {aberto && pos && createPortal(
        <div
          ref={menuRef}
          className="fixed z-50 w-56 overflow-hidden rounded-md border border-black/[0.08] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.14)]"
          style={{ left: pos.left, top: pos.top }}
        >
          {onCriar && (
            <div className="border-b border-black/[0.06] px-2 py-2">
              <input
                autoFocus
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') criar(); }}
                placeholder="Buscar ou criar tag"
                className="w-full text-[12px] text-text-primary outline-none placeholder:text-text-muted"
              />
              {podeCriar && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {TAG_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCor(c)}
                        title={TAG_COLOR_LABELS[c]}
                        aria-label={TAG_COLOR_LABELS[c]}
                        className={`h-3.5 w-3.5 rounded-full ${TAG_DOT[c]} ${
                          cor === c ? 'ring-2 ring-offset-1 ring-text-primary/50' : ''
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={criar}
                    className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white transition hover:opacity-90"
                  >
                    criar “{limpo.slice(0, 12)}”
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="max-h-56 overflow-y-auto py-1">
            {filtradas.length === 0 ? (
              <p className="px-2.5 py-2 text-[11px] leading-snug text-text-muted">
                {onCriar ? 'Digite o nome para criar a primeira tag.' : 'Nenhuma tag neste projeto.'}
              </p>
            ) : (
              filtradas.map((t) => (
                <div key={t.id} className="group/tag flex items-center gap-1 px-2 py-1 hover:bg-black/[0.03]">
                  <button onClick={() => alternar(t.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                    <TagChip nome={t.nome} cor={t.cor} />
                    {value.includes(t.id) && <Check className="ml-auto h-3 w-3 shrink-0 text-primary" />}
                  </button>

                  {/* Cor e apagar aparecem só com o mouse na linha: a ação de todo
                      dia é marcar, não administrar a tag. */}
                  {(onCor || onApagar) && (
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/tag:opacity-100">
                      {onCor && TAG_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => onCor(t.id, c)}
                          title={`Pintar de ${TAG_COLOR_LABELS[c].toLowerCase()}`}
                          aria-label={`Pintar de ${TAG_COLOR_LABELS[c].toLowerCase()}`}
                          className={`h-2.5 w-2.5 rounded-full ${TAG_DOT[c]} ${
                            corDaTag(t.cor) === c ? 'ring-1 ring-text-primary/50' : ''
                          }`}
                        />
                      ))}
                      {onApagar && (
                        <button
                          onClick={() => onApagar(t)}
                          title="Apagar a tag do projeto"
                          aria-label={`Apagar a tag ${t.nome}`}
                          className="ml-0.5 rounded p-0.5 text-text-muted/60 transition-colors hover:text-danger"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
