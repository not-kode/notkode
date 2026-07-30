// Catálogo das ferramentas do MCP da Notkode.

import { hoje, objeto, reais, somaDias, supabase, texto, type Ferramenta } from './nucleo';
import { ferramentasDeProjeto } from './projetos';
import { ferramentasDeTarefa } from './tarefas';
import { ferramentasDeNegocio } from './negocios';

/**
 * Uma chamada só para se situar: o que está atrasado, o que é de hoje, o que
 * está em andamento e como está o mês no dinheiro. É por onde vale começar
 * quando a conversa é "e aí, como estamos?".
 */
const panorama: Ferramenta = {
  nome: 'panorama',
  descricao:
    'Visão geral do momento: tarefas atrasadas e de hoje, o que está sendo tocado, projetos ativos, negócios no ' +
    'funil e o dinheiro do mês. Use no começo da conversa para pegar contexto.',
  entrada: objeto({ dias: { type: 'number', description: 'Janela do "próximos dias". Padrão: 7.' } }),
  async executar(args) {
    const db = supabase();
    const hj = hoje();
    const janela = typeof args.dias === 'number' ? args.dias : 7;

    const [{ data: tarefas }, { data: engs }, { data: deals }, { data: receb }] = await Promise.all([
      db.from('project_tasks').select('id, engagement_id, title, status, due_date, assignee, parent_task_id, timer_started_at'),
      db.from('engagements').select('id, title, lifecycle, archived_at, mrr, valor, organizations(name)'),
      db.from('deals').select('id, stage, valor_pontual, mrr, organizations(name)'),
      db.from('receivables').select('id, amount, due_date, status, organizations(name)'),
    ]);

    const projetos = ((engs ?? []) as unknown as {
      id: string; title: string | null; lifecycle: string; archived_at: string | null;
      mrr: number | null; valor: number | null; organizations: { name: string | null } | null;
    }[]).filter((e) => !e.archived_at);
    const nomeDe = new Map(projetos.map((p) => [p.id, p.organizations?.name ?? p.title ?? 'Sem nome']));

    const abertas = ((tarefas ?? []) as {
      id: string; engagement_id: string; title: string; status: string; due_date: string | null;
      assignee: string | null; parent_task_id: string | null; timer_started_at: string | null;
    }[]).filter((t) => t.status !== 'feito' && !t.parent_task_id && nomeDe.has(t.engagement_id));

    const enxuta = (t: (typeof abertas)[number]) => ({
      id: t.id, titulo: t.title, projeto: nomeDe.get(t.engagement_id), prazo: t.due_date, quem: t.assignee,
    });

    const recebiveis = ((receb ?? []) as unknown as {
      id: string; amount: number; due_date: string; status: string; organizations: { name: string | null } | null;
    }[]);
    const doMes = recebiveis.filter((r) => r.due_date?.slice(0, 7) === hj.slice(0, 7));
    const soma = (l: typeof recebiveis) => l.reduce((s, r) => s + Number(r.amount ?? 0), 0);

    const negocios = ((deals ?? []) as unknown as {
      id: string; stage: string; valor_pontual: number | null; mrr: number | null; organizations: { name: string | null } | null;
    }[]).filter((d) => d.stage !== 'ganho' && d.stage !== 'perdido');

    return {
      hoje: hj,
      tarefas: {
        atrasadas: abertas.filter((t) => !!t.due_date && t.due_date < hj).map(enxuta),
        de_hoje: abertas.filter((t) => t.due_date === hj).map(enxuta),
        proximos_dias: abertas
          .filter((t) => !!t.due_date && t.due_date > hj && t.due_date <= somaDias(hj, janela))
          .map(enxuta),
        fazendo: abertas.filter((t) => t.status === 'fazendo').map(enxuta),
        cronometro_ligado: abertas.filter((t) => t.timer_started_at).map(enxuta),
        abertas_no_total: abertas.length,
      },
      projetos: projetos
        .filter((p) => p.lifecycle !== 'encerrado')
        .map((p) => ({
          id: p.id,
          nome: p.organizations?.name ?? p.title,
          situacao: p.lifecycle,
          tarefas_abertas: abertas.filter((t) => t.engagement_id === p.id).length,
        })),
      funil: negocios.map((d) => ({
        id: d.id, cliente: d.organizations?.name, estagio: d.stage, valor: d.valor_pontual, mrr: d.mrr,
      })),
      dinheiro: {
        mes: hj.slice(0, 7),
        a_receber_no_mes: reais(soma(doMes.filter((r) => r.status === 'pendente'))),
        recebido_no_mes: reais(soma(doMes.filter((r) => r.status === 'recebido'))),
        atrasado: reais(soma(recebiveis.filter((r) => r.status === 'pendente' && r.due_date < hj))),
        mrr_ativo: reais(projetos.filter((p) => p.lifecycle === 'ativo').reduce((s, p) => s + Number(p.mrr ?? 0), 0)),
      },
    };
  },
};

const ajuda: Ferramenta = {
  nome: 'ajuda',
  descricao: 'Explica o que este servidor faz e lista as ferramentas por assunto.',
  entrada: objeto({ assunto: texto('Filtra por um pedaço do nome da ferramenta.') }),
  async executar(args) {
    const filtro = typeof args.assunto === 'string' ? args.assunto.toLowerCase() : null;
    return {
      servidor: 'Sistema da Notkode (CRM, entregas e financeiro)',
      como_usar:
        'Quase tudo aceita o nome do cliente no lugar de id. Comece por "panorama" ou "listar_projetos"; ' +
        'para trabalhar num cliente, "detalhar_projeto" traz contrato, cronograma, tarefas e financeiro juntos.',
      ferramentas: todas
        .filter((f) => !filtro || f.nome.includes(filtro))
        .map((f) => ({ nome: f.nome, faz: f.descricao })),
    };
  },
};

export const todas: Ferramenta[] = [
  panorama,
  ...ferramentasDeProjeto,
  ...ferramentasDeTarefa,
  ...ferramentasDeNegocio,
  ajuda,
];

export const acharFerramenta = (nome: string): Ferramenta | undefined => todas.find((f) => f.nome === nome);
