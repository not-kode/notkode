// Ferramentas de projeto/contrato: o que está rodando, o que cada contrato diz,
// e as mudanças de contrato que a gente combina conversando (escopo, valores,
// prazos, encerramento).

import {
  ErroDeUso, acharCliente, acharProjeto, bool, data, num, objeto, obrigatorio,
  opcoes, reais, str, supabase, texto, hoje, type Ferramenta,
} from './nucleo';

const LIFECYCLES = ['ativo', 'pausado', 'encerrado'] as const;
const STATUSES = [
  'aguardando', 'onboarding', 'em_desenvolvimento', 'revisao', 'entregue',
  'encerrado', 'ativo', 'pausado', 'churn',
] as const;

type EngRow = {
  id: string; title: string | null; type: string; status: string; lifecycle: string;
  start_date: string | null; end_date: string | null; valor: number | null; mrr: number | null;
  billing_cycle: string | null; notes: string | null; scope: string | null;
  client_obligations: string | null; provider_obligations: string | null; renewal_note: string | null;
  proposal_name: string | null; client_token: string | null; is_internal: boolean | null;
  archived_at: string | null; organization_id: string | null;
  organizations: { name: string | null } | null;
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';

const resumo = (e: EngRow) => ({
  id: e.id,
  cliente: e.organizations?.name ?? null,
  titulo: e.title,
  situacao: e.lifecycle,
  etapa_do_contrato: e.status,
  cobranca: e.type,
  valor: e.valor,
  mrr: e.mrr,
  inicio: e.start_date,
  fim: e.end_date,
  interno: e.is_internal ?? false,
  arquivado: !!e.archived_at,
});

export const ferramentasDeProjeto: Ferramenta[] = [
  {
    nome: 'listar_projetos',
    descricao:
      'Lista os projetos/contratos do sistema, com cliente, situação, valores e quantas tarefas estão abertas. ' +
      'Use para saber o que existe antes de criar ou mexer em alguma coisa.',
    entrada: objeto({
      cliente: texto('Filtra por um pedaço do nome do cliente.'),
      incluir_arquivados: { type: 'boolean', description: 'Traz também os arquivados. Padrão: não.' },
      incluir_encerrados: { type: 'boolean', description: 'Traz também os encerrados. Padrão: sim.' },
    }),
    async executar(args) {
      const db = supabase();
      const { data: linhas } = await db
        .from('engagements')
        .select(
          'id, title, type, status, lifecycle, start_date, end_date, valor, mrr, billing_cycle, notes, scope, ' +
            'client_obligations, provider_obligations, renewal_note, proposal_name, client_token, is_internal, ' +
            'archived_at, organization_id, organizations(name)',
        )
        .order('created_at', { ascending: false });

      const { data: tarefas } = await db.from('project_tasks').select('engagement_id, status');
      const abertas = new Map<string, number>();
      for (const t of (tarefas ?? []) as { engagement_id: string; status: string }[]) {
        if (t.status !== 'feito') abertas.set(t.engagement_id, (abertas.get(t.engagement_id) ?? 0) + 1);
      }

      const filtroCliente = str(args, 'cliente')?.toLowerCase();
      const projetos = ((linhas ?? []) as unknown as EngRow[])
        .filter((e) => (bool(args, 'incluir_arquivados') ? true : !e.archived_at))
        .filter((e) => (bool(args, 'incluir_encerrados') === false ? e.lifecycle !== 'encerrado' : true))
        .filter((e) =>
          !filtroCliente ||
          (e.organizations?.name ?? '').toLowerCase().includes(filtroCliente) ||
          (e.title ?? '').toLowerCase().includes(filtroCliente))
        .map((e) => ({ ...resumo(e), tarefas_abertas: abertas.get(e.id) ?? 0 }));

      return { total: projetos.length, projetos };
    },
  },

  {
    nome: 'detalhar_projeto',
    descricao:
      'Tudo de um projeto: dados do contrato, etapas do cronograma, tarefas por status, recebíveis, briefing e o ' +
      'link de acompanhamento do cliente. É a chamada para se situar antes de trabalhar num cliente.',
    entrada: objeto({ projeto: texto('Nome do cliente, título do projeto ou id.') }, ['projeto']),
    async executar(args) {
      const alvo = await acharProjeto(obrigatorio(args, 'projeto'));
      const db = supabase();

      const [{ data: eng }, { data: etapas }, { data: tarefas }, { data: recebiveis }, { data: briefings }] =
        await Promise.all([
          db
            .from('engagements')
            .select(
              'id, title, type, status, lifecycle, start_date, end_date, valor, mrr, billing_cycle, notes, scope, ' +
                'client_obligations, provider_obligations, renewal_note, proposal_name, client_token, is_internal, ' +
                'archived_at, organization_id, organizations(name)',
            )
            .eq('id', alvo.id)
            .maybeSingle(),
          db.from('project_phases').select('*').eq('engagement_id', alvo.id).order('sort'),
          db.from('project_tasks').select('*').eq('engagement_id', alvo.id).order('sort'),
          db.from('receivables').select('*').eq('engagement_id', alvo.id).order('due_date'),
          alvo.organization_id
            ? db
                .from('onboarding_briefings')
                .select('id, product_name, scope, status, submitted_at, token')
                .eq('organization_id', alvo.organization_id)
                .order('created_at', { ascending: false })
            : Promise.resolve({ data: [] }),
        ]);

      if (!eng) throw new ErroDeUso('Projeto sumiu no meio da consulta.');
      const e = eng as unknown as EngRow;

      const todas = (tarefas ?? []) as Record<string, unknown>[];
      const porStatus = (s: string) =>
        todas
          .filter((t) => t.status === s && !t.parent_task_id)
          .map((t) => ({
            id: t.id, titulo: t.title, prazo: t.due_date, prioridade: t.priority,
            responsavel: t.assignee, etapa: t.phase_id,
            subtarefas: todas.filter((x) => x.parent_task_id === t.id).length,
          }));

      return {
        projeto: {
          ...resumo(e),
          escopo: e.scope,
          observacoes: e.notes,
          obrigacoes_do_cliente: e.client_obligations,
          obrigacoes_da_notkode: e.provider_obligations,
          renovacao: e.renewal_note,
          proposta_anexada: e.proposal_name,
          link_do_cliente: e.client_token ? `${SITE}/acompanhamento/${e.client_token}` : null,
        },
        cronograma: ((etapas ?? []) as Record<string, unknown>[]).map((f) => ({
          id: f.id, nome: f.name, situacao: f.status, inicio: f.start_date, fim: f.end_date,
          cliente_ve: f.client_visible,
          tarefas: todas.filter((t) => t.phase_id === f.id).length,
        })),
        tarefas: {
          a_fazer: porStatus('a_fazer'),
          fazendo: porStatus('fazendo'),
          revisao: porStatus('revisao'),
          backlog: porStatus('backlog'),
          feitas: todas.filter((t) => t.status === 'feito' && !t.parent_task_id).length,
          sem_etapa: todas.filter((t) => !t.phase_id && !t.parent_task_id).length,
        },
        financeiro: ((recebiveis ?? []) as Record<string, unknown>[]).map((r) => ({
          id: r.id, descricao: r.description, valor: r.amount, vencimento: r.due_date,
          situacao: r.status, pago_em: r.paid_at,
        })),
        briefings: ((briefings ?? []) as Record<string, unknown>[]).map((b) => ({
          id: b.id, produto: b.product_name, escopo: b.scope, situacao: b.status,
          enviado_em: b.submitted_at, link: `${SITE}/onboarding/${b.token}`,
        })),
      };
    },
  },

  {
    nome: 'criar_projeto',
    descricao:
      'Cria um contrato/projeto para um cliente que já existe no sistema. Use quando fechamos um trabalho novo e ' +
      'ele ainda não tem projeto para pendurar tarefas e cronograma.',
    entrada: objeto(
      {
        cliente: texto('Nome do cliente (organização) já cadastrado, ou o id dele.'),
        titulo: texto('Como o projeto se chama (ex: "Site institucional", "Agente de WhatsApp").'),
        cobranca: opcoes(['pontual', 'recorrente'], 'Como é cobrado. Padrão: pontual.'),
        valor: { type: 'number', description: 'Valor total, para trabalho pontual.' },
        mrr: { type: 'number', description: 'Mensalidade, para trabalho recorrente.' },
        inicio: texto('Data de início (AAAA-MM-DD, "hoje", "+7").'),
        fim: texto('Data prevista de entrega.'),
        escopo: texto('O que está incluso, em texto.'),
        interno: { type: 'boolean', description: 'Frente da própria casa, sem cliente do outro lado.' },
      },
      ['cliente', 'titulo'],
    ),
    async executar(args) {
      const cliente = await acharCliente(obrigatorio(args, 'cliente'));
      const cobranca = str(args, 'cobranca') === 'recorrente' ? 'recorrente' : 'pontual';

      const { data: criado, error } = await supabase()
        .from('engagements')
        .insert({
          organization_id: cliente.id,
          title: obrigatorio(args, 'titulo'),
          type: cobranca,
          status: 'aguardando',
          lifecycle: 'ativo',
          start_date: data(args, 'inicio'),
          end_date: data(args, 'fim'),
          valor: num(args, 'valor'),
          mrr: num(args, 'mrr'),
          scope: str(args, 'escopo'),
          is_internal: bool(args, 'interno') ?? false,
        })
        .select('id')
        .maybeSingle();

      if (error) throw new ErroDeUso(`Não deu para criar: ${error.message}`);
      return { criado: true, projeto_id: criado?.id, cliente: cliente.name };
    },
  },

  {
    nome: 'atualizar_projeto',
    descricao:
      'Muda os dados de um projeto/contrato: título, escopo, datas, valores, situação, observações e as obrigações ' +
      'de cada lado. Só mexe no que você mandar.',
    entrada: objeto(
      {
        projeto: texto('Nome do cliente, título ou id.'),
        titulo: texto('Novo título.'),
        escopo: texto('Escopo do contrato.'),
        situacao: opcoes(LIFECYCLES, 'ativo, pausado ou encerrado.'),
        etapa_do_contrato: opcoes(STATUSES, 'Estágio da entrega (onboarding, em_desenvolvimento, entregue...).'),
        inicio: texto('Data de início.'),
        fim: texto('Data de fim.'),
        valor: { type: 'number', description: 'Valor total.' },
        mrr: { type: 'number', description: 'Mensalidade.' },
        observacoes: texto('Anotações internas do contrato.'),
        obrigacoes_do_cliente: texto('O que o cliente precisa entregar.'),
        obrigacoes_da_notkode: texto('O que a Notkode se compromete a entregar.'),
        renovacao: texto('Condição de renovação.'),
      },
      ['projeto'],
    ),
    async executar(args) {
      const alvo = await acharProjeto(obrigatorio(args, 'projeto'));
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

      const mapa: [string, string][] = [
        ['titulo', 'title'], ['escopo', 'scope'], ['observacoes', 'notes'],
        ['obrigacoes_do_cliente', 'client_obligations'], ['obrigacoes_da_notkode', 'provider_obligations'],
        ['renovacao', 'renewal_note'],
      ];
      for (const [de, para] of mapa) if (args[de] !== undefined) patch[para] = str(args, de);

      if (args.inicio !== undefined) patch.start_date = data(args, 'inicio');
      if (args.fim !== undefined) patch.end_date = data(args, 'fim');
      if (args.valor !== undefined) patch.valor = num(args, 'valor');
      if (args.mrr !== undefined) patch.mrr = num(args, 'mrr');

      const situacao = str(args, 'situacao');
      if (situacao) {
        if (!LIFECYCLES.includes(situacao as (typeof LIFECYCLES)[number])) {
          throw new ErroDeUso(`Situação inválida: use ${LIFECYCLES.join(', ')}.`);
        }
        patch.lifecycle = situacao;
      }
      const etapa = str(args, 'etapa_do_contrato');
      if (etapa) {
        if (!STATUSES.includes(etapa as (typeof STATUSES)[number])) {
          throw new ErroDeUso(`Etapa inválida: use ${STATUSES.join(', ')}.`);
        }
        patch.status = etapa;
      }

      if (Object.keys(patch).length === 1) throw new ErroDeUso('Nada para mudar: informe pelo menos um campo.');

      const { error } = await supabase().from('engagements').update(patch).eq('id', alvo.id);
      if (error) throw new ErroDeUso(`Não deu para salvar: ${error.message}`);
      return { atualizado: alvo.nome, campos: Object.keys(patch).filter((k) => k !== 'updated_at') };
    },
  },

  {
    nome: 'encerrar_projeto',
    descricao:
      'Fecha o projeto: marca como encerrado e carimba a data de fim. Use quando a entrega acabou. Não apaga nada e ' +
      'não mexe nas tarefas.',
    entrada: objeto(
      { projeto: texto('Nome do cliente, título ou id.'), data_de_fim: texto('Padrão: hoje.') },
      ['projeto'],
    ),
    async executar(args) {
      const alvo = await acharProjeto(obrigatorio(args, 'projeto'));
      const fim = data(args, 'data_de_fim') ?? hoje();
      const { error } = await supabase()
        .from('engagements')
        .update({ lifecycle: 'encerrado', status: 'encerrado', end_date: fim, updated_at: new Date().toISOString() })
        .eq('id', alvo.id);
      if (error) throw new ErroDeUso(`Não deu para encerrar: ${error.message}`);
      return { encerrado: alvo.nome, fim };
    },
  },

  {
    nome: 'arquivar_projeto',
    descricao: 'Arquiva (ou desarquiva) o projeto: ele sai da lista do dia a dia sem perder nada.',
    entrada: objeto(
      { projeto: texto('Nome do cliente, título ou id.'), desarquivar: { type: 'boolean', description: 'true para desarquivar.' } },
      ['projeto'],
    ),
    async executar(args) {
      const alvo = await acharProjeto(obrigatorio(args, 'projeto'));
      const desarquivar = bool(args, 'desarquivar') === true;
      await supabase()
        .from('engagements')
        .update({ archived_at: desarquivar ? null : new Date().toISOString() })
        .eq('id', alvo.id);
      return { [desarquivar ? 'desarquivado' : 'arquivado']: alvo.nome };
    },
  },

  {
    nome: 'link_de_acompanhamento',
    descricao:
      'Mostra, gera ou revoga o link público em que o cliente acompanha o cronograma (só o que estiver marcado como ' +
      'visível para ele).',
    entrada: objeto(
      {
        projeto: texto('Nome do cliente, título ou id.'),
        acao: opcoes(['ver', 'gerar', 'revogar'], 'Padrão: ver.'),
      },
      ['projeto'],
    ),
    async executar(args) {
      const alvo = await acharProjeto(obrigatorio(args, 'projeto'));
      const acao = str(args, 'acao') ?? 'ver';
      const db = supabase();

      if (acao === 'gerar') {
        const token = crypto.randomUUID().replace(/-/g, '');
        await db.from('engagements').update({ client_token: token }).eq('id', alvo.id);
        return { link: `${SITE}/acompanhamento/${token}` };
      }
      if (acao === 'revogar') {
        await db.from('engagements').update({ client_token: null }).eq('id', alvo.id);
        return { revogado: true };
      }

      const { data: e } = await db.from('engagements').select('client_token').eq('id', alvo.id).maybeSingle();
      const token = e?.client_token as string | null | undefined;
      return { link: token ? `${SITE}/acompanhamento/${token}` : null };
    },
  },

  {
    nome: 'listar_clientes',
    descricao: 'Os clientes cadastrados, com contratos, contatos e o que cada um representa de dinheiro.',
    entrada: objeto({ busca: texto('Filtra por um pedaço do nome.') }),
    async executar(args) {
      const db = supabase();
      const [{ data: orgs }, { data: engs }, { data: receb }] = await Promise.all([
        db.from('organizations').select('id, name, domain, market, tax_id, legal_name, notes').order('name'),
        db.from('engagements').select('id, organization_id, title, lifecycle, valor, mrr'),
        db.from('receivables').select('organization_id, amount, status'),
      ]);

      const busca = str(args, 'busca')?.toLowerCase();
      const contratos = (engs ?? []) as { id: string; organization_id: string | null; title: string | null; lifecycle: string; valor: number | null; mrr: number | null }[];
      const recebiveis = (receb ?? []) as { organization_id: string | null; amount: number; status: string }[];

      const clientes = ((orgs ?? []) as Record<string, unknown>[])
        .filter((o) => !busca || String(o.name ?? '').toLowerCase().includes(busca))
        .map((o) => {
          const meus = contratos.filter((c) => c.organization_id === o.id);
          const aberto = recebiveis
            .filter((r) => r.organization_id === o.id && r.status === 'pendente')
            .reduce((s, r) => s + Number(r.amount ?? 0), 0);
          return {
            id: o.id,
            nome: o.name,
            documento: o.tax_id,
            razao_social: o.legal_name,
            mercado: o.market,
            contratos: meus.map((c) => ({ id: c.id, titulo: c.title, situacao: c.lifecycle })),
            mrr: meus.reduce((s, c) => s + Number(c.mrr ?? 0), 0),
            a_receber: aberto,
            a_receber_formatado: reais(aberto),
          };
        });

      return { total: clientes.length, clientes };
    },
  },
];
