// Ferramentas do que vem antes e do que vem depois da entrega: negócios em
// negociação (com proposta), dinheiro a receber e briefing de onboarding.

import { randomUUID } from 'crypto';
import {
  ErroDeUso, acharCliente, acharProjeto, bool, data, hoje, lista, num, objeto,
  obrigatorio, opcoes, reais, str, supabase, texto, type Ferramenta,
} from './nucleo';
import { DEAL_STAGES } from '@/app/admin/(app)/pipeline/stages';
import {
  isRecurring, monthlyDescription, pendingMonthly, type RecurringEng,
} from '@/app/admin/(app)/financeiro/recurring';
import {
  ONBOARDING_TEMPLATES, PREFILL_KEY, getOnboardingTemplate, prefilledIds, templateQuestionIds,
} from '@/lib/onboarding-schema';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notkode.com.br';
const STATUS_RECEBIVEL = ['pendente', 'recebido', 'atrasado', 'cancelado'] as const;

/** Quantos meses à frente a projeção alcança quando ninguém pede um mês específico. */
const HORIZONTE_PREVISAO = 6;

type ItemRecebivel = {
  id: string | null;
  cliente: string | null;
  descricao: string | null;
  valor: number;
  vencimento: string;
  situacao: string;
  pago_em: string | null;
  valor_pago: number | null;
  forma: string | null;
};

/** Mês seguinte de um AAAA-MM. */
const mesSeguinte = (m: string): string => {
  const [y, mm] = m.split('-').map(Number);
  return mm === 12 ? `${y + 1}-01` : `${y}-${String(mm + 1).padStart(2, '0')}`;
};

/**
 * Mensalidades de contrato recorrente que ainda não viraram cobrança, como itens
 * previstos — a mesma régua das linhas previstas do Financeiro.
 *
 * Só do mês corrente em diante: no passado vale o que aconteceu. Com um mês
 * pedido, projeta só ele (mesmo lá na frente); sem mês, vai até
 * HORIZONTE_PREVISAO meses à frente, senão a resposta viraria uma lista de
 * cobrança até o fim de todo contrato.
 */
async function projetarMensalidades(engagementId: string | null, mes?: string): Promise<ItemRecebivel[]> {
  const db = supabase();
  const mesAtual = hoje().slice(0, 7);
  const meses: string[] = [];
  if (mes) {
    if (mes < mesAtual) return [];
    meses.push(mes);
  } else {
    for (let m = mesAtual, i = 0; i <= HORIZONTE_PREVISAO; m = mesSeguinte(m), i++) meses.push(m);
  }

  let q = db
    .from('engagements')
    .select('id, title, type, lifecycle, mrr, start_date, end_date, organizations(name)')
    .eq('type', 'recorrente');
  if (engagementId) q = q.eq('id', engagementId);
  const { data } = await q;

  const engs = ((data ?? []) as unknown as (RecurringEng & {
    title: string | null; organizations: { name: string | null } | null;
  })[]).filter(isRecurring);
  if (engs.length === 0) return [];

  const { data: recData } = await db
    .from('receivables')
    .select('engagement_id, due_date')
    .in('engagement_id', engs.map((e) => e.id));

  const dues = new Map<string, string[]>();
  for (const r of (recData ?? []) as { engagement_id: string | null; due_date: string }[]) {
    if (!r.engagement_id) continue;
    dues.set(r.engagement_id, [...(dues.get(r.engagement_id) ?? []), r.due_date]);
  }

  return meses.flatMap((m) =>
    pendingMonthly(engs, dues, m).map(({ eng, due_date }) => ({
      id: null,
      cliente: eng.organizations?.name ?? eng.title,
      descricao: monthlyDescription(m),
      valor: eng.mrr ?? 0,
      vencimento: due_date,
      situacao: 'prevista',
      pago_em: null,
      valor_pago: null,
      forma: null,
    })),
  );
}

export const ferramentasDeNegocio: Ferramenta[] = [
  {
    nome: 'listar_negocios',
    descricao:
      'Os negócios do funil (pipeline), com estágio, valores, previsão de fechamento e se já tem proposta anexada.',
    entrada: objeto({
      estagio: opcoes(DEAL_STAGES, 'Filtra por estágio.'),
      cliente: texto('Filtra por um pedaço do nome do cliente.'),
      incluir_fechados: { type: 'boolean', description: 'Traz ganhos e perdidos. Padrão: não.' },
    }),
    async executar(args) {
      const { data: linhas } = await supabase()
        .from('deals')
        .select('id, stage, valor_pontual, mrr, expected_close, source, service_tags, notes, proposal_name, created_at, organizations(name)')
        .order('created_at', { ascending: false });

      const estagio = str(args, 'estagio');
      const cliente = str(args, 'cliente')?.toLowerCase();
      const fechados = bool(args, 'incluir_fechados') === true;

      const negocios = ((linhas ?? []) as unknown as Record<string, unknown>[])
        .map((d) => ({
          id: d.id,
          cliente: (d.organizations as { name?: string } | null)?.name ?? null,
          estagio: d.stage,
          valor: d.valor_pontual,
          mrr: d.mrr,
          previsao: d.expected_close,
          origem: d.source,
          servicos: d.service_tags,
          proposta: d.proposal_name,
          observacoes: d.notes,
        }))
        .filter((d) => (estagio ? d.estagio === estagio : fechados || (d.estagio !== 'ganho' && d.estagio !== 'perdido')))
        .filter((d) => !cliente || (d.cliente ?? '').toLowerCase().includes(cliente));

      return { total: negocios.length, negocios };
    },
  },

  {
    nome: 'criar_negocio',
    descricao:
      'Abre um negócio no funil para um cliente. Use quando aparece uma oportunidade nova e a gente combina o que ' +
      'vai propor.',
    entrada: objeto(
      {
        cliente: texto('Nome do cliente. Se não existir no sistema, é criado.'),
        estagio: opcoes(DEAL_STAGES, 'Padrão: novo.'),
        valor: { type: 'number', description: 'Valor pontual proposto.' },
        mrr: { type: 'number', description: 'Mensalidade proposta.' },
        previsao: texto('Previsão de fechamento (data).'),
        origem: texto('De onde veio (indicação, site, Instagram...).'),
        servicos: lista('Serviços envolvidos (ex: site, agente, consultoria).'),
        observacoes: texto('O que foi conversado.'),
      },
      ['cliente'],
    ),
    async executar(args) {
      const db = supabase();
      const nome = obrigatorio(args, 'cliente');

      let organizationId: string;
      try {
        organizationId = (await acharCliente(nome)).id;
      } catch {
        const { data: nova, error } = await db.from('organizations').insert({ name: nome }).select('id').maybeSingle();
        if (error) throw new ErroDeUso(`Não deu para criar o cliente: ${error.message}`);
        organizationId = String(nova?.id);
      }

      const estagio = str(args, 'estagio');
      const servicos = Array.isArray(args.servicos) ? (args.servicos as unknown[]).map(String) : [];

      const { data: criado, error } = await db
        .from('deals')
        .insert({
          organization_id: organizationId,
          stage: estagio && DEAL_STAGES.includes(estagio as never) ? estagio : 'novo',
          valor_pontual: num(args, 'valor') ?? 0,
          mrr: num(args, 'mrr') ?? 0,
          expected_close: data(args, 'previsao'),
          source: str(args, 'origem'),
          service_tags: servicos,
          notes: str(args, 'observacoes'),
        })
        .select('id')
        .maybeSingle();

      if (error) throw new ErroDeUso(`Não deu para criar o negócio: ${error.message}`);
      return { criado: true, negocio_id: criado?.id, cliente: nome };
    },
  },

  {
    nome: 'atualizar_negocio',
    descricao:
      'Mexe num negócio do funil: estágio, valores, previsão, observações. Para marcar como ganho e já virar ' +
      'contrato, prefira fazer pela tela do pipeline, que cria o projeto e as parcelas junto.',
    entrada: objeto(
      {
        negocio: texto('Id do negócio, ou nome do cliente quando ele só tem um.'),
        estagio: opcoes(DEAL_STAGES, 'Novo estágio.'),
        valor: { type: 'number', description: 'Valor pontual.' },
        mrr: { type: 'number', description: 'Mensalidade.' },
        previsao: texto('Previsão de fechamento.'),
        observacoes: texto('Observações.'),
      },
      ['negocio'],
    ),
    async executar(args) {
      const db = supabase();
      const termo = obrigatorio(args, 'negocio');

      const { data: todos } = await db.from('deals').select('id, stage, organizations(name)');
      const linhas = ((todos ?? []) as unknown as { id: string; stage: string; organizations: { name: string | null } | null }[]);
      let alvo = linhas.find((d) => d.id === termo);
      if (!alvo) {
        const casam = linhas.filter((d) => (d.organizations?.name ?? '').toLowerCase().includes(termo.toLowerCase()));
        if (casam.length === 0) throw new ErroDeUso(`Nenhum negócio de "${termo}".`);
        if (casam.length > 1) throw new ErroDeUso(`"${termo}" tem ${casam.length} negócios: ${casam.map((d) => `${d.organizations?.name} ${d.stage} (${d.id})`).join(' | ')}.`);
        alvo = casam[0];
      }

      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      const estagio = str(args, 'estagio');
      if (estagio) {
        if (!DEAL_STAGES.includes(estagio as never)) throw new ErroDeUso(`Estágio inválido: use ${DEAL_STAGES.join(', ')}.`);
        patch.stage = estagio;
      }
      if (args.valor !== undefined) patch.valor_pontual = num(args, 'valor') ?? 0;
      if (args.mrr !== undefined) patch.mrr = num(args, 'mrr') ?? 0;
      if (args.previsao !== undefined) patch.expected_close = data(args, 'previsao');
      if (args.observacoes !== undefined) patch.notes = str(args, 'observacoes');

      if (Object.keys(patch).length === 1) throw new ErroDeUso('Nada para mudar.');
      const { error } = await db.from('deals').update(patch).eq('id', alvo.id);
      if (error) throw new ErroDeUso(`Não deu para salvar: ${error.message}`);
      return { atualizado: alvo.organizations?.name ?? alvo.id, campos: Object.keys(patch).filter((k) => k !== 'updated_at') };
    },
  },

  // ── Dinheiro ──────────────────────────────────────────────────────────────

  {
    nome: 'listar_recebiveis',
    descricao:
      'O que há para receber e o que já entrou, com filtro de projeto, cliente, situação e mês. ' +
      'Mensalidade de contrato recorrente que ainda não virou cobrança aparece como "prevista".',
    entrada: objeto({
      projeto: texto('Nome do cliente, título ou id do projeto.'),
      situacao: opcoes(STATUS_RECEBIVEL, 'Filtra por situação.'),
      mes: texto('Mês no formato AAAA-MM. Padrão: todos.'),
    }),
    async executar(args) {
      const db = supabase();
      const projetoTermo = str(args, 'projeto');
      const alvo = projetoTermo ? await acharProjeto(projetoTermo) : null;

      let q = db
        .from('receivables')
        .select('id, description, amount, due_date, status, paid_at, paid_amount, method, engagement_id, organizations(name)')
        .order('due_date');
      if (alvo) q = q.eq('engagement_id', alvo.id);
      const { data: linhas } = await q;

      const situacao = str(args, 'situacao');
      const mes = str(args, 'mes');
      const lancados = ((linhas ?? []) as unknown as Record<string, unknown>[]).map((r) => ({
        id: r.id as string | null,
        cliente: (r.organizations as { name?: string } | null)?.name ?? null,
        descricao: r.description as string | null,
        valor: Number(r.amount ?? 0),
        vencimento: r.due_date as string,
        situacao: r.status as string,
        pago_em: r.paid_at as string | null,
        valor_pago: r.paid_amount as number | null,
        forma: r.method as string | null,
      }));

      // Mensalidade de contrato recorrente só vira cobrança quando é lançada no
      // Financeiro. Sem projetar, um mês à frente responderia bem menos do que o
      // contratado — o mesmo buraco que a tela do Financeiro fecha com as linhas
      // previstas. Só entra do mês corrente em diante: o passado é o que houve.
      const previstos = situacao ? [] : await projetarMensalidades(alvo?.id ?? null, mes ?? undefined);

      const itens = [...lancados, ...previstos]
        .filter((r) => !situacao || r.situacao === situacao)
        .filter((r) => !mes || String(r.vencimento ?? '').slice(0, 7) === mes)
        .sort((a, b) => String(a.vencimento).localeCompare(String(b.vencimento)));

      const soma = (f: (r: (typeof itens)[number]) => boolean) =>
        itens.filter(f).reduce((s, r) => s + Number(r.valor ?? 0), 0);
      const hj = hoje();
      const previsto = soma((r) => r.situacao === 'prevista');

      return {
        total: itens.length,
        // "A receber" é o contratado do recorte: o que já foi cobrado mais o que
        // ainda vai ser. `previsto` diz quanto desse total falta lançar.
        a_receber: reais(soma((r) => r.situacao === 'pendente') + previsto),
        previsto: reais(previsto),
        atrasado: reais(soma((r) => r.situacao === 'pendente' && String(r.vencimento ?? '') < hj)),
        recebido: reais(soma((r) => r.situacao === 'recebido')),
        recebiveis: itens,
      };
    },
  },

  {
    nome: 'criar_recebivel',
    descricao: 'Registra uma cobrança de um projeto (valor e vencimento).',
    entrada: objeto(
      {
        projeto: texto('Nome do cliente, título ou id.'),
        descricao: texto('Do que é a cobrança (ex: "Parcela 1/3").'),
        valor: { type: 'number', description: 'Valor em reais.' },
        vencimento: texto('Data de vencimento.'),
      },
      ['projeto', 'valor', 'vencimento'],
    ),
    async executar(args) {
      const alvo = await acharProjeto(obrigatorio(args, 'projeto'));
      const valor = num(args, 'valor');
      const vencimento = data(args, 'vencimento');
      if (!valor || !vencimento) throw new ErroDeUso('Preciso de "valor" e "vencimento".');

      const { data: criado, error } = await supabase()
        .from('receivables')
        .insert({
          engagement_id: alvo.id,
          organization_id: alvo.organization_id,
          description: str(args, 'descricao'),
          amount: valor,
          due_date: vencimento,
          status: 'pendente',
        })
        .select('id')
        .maybeSingle();

      if (error) throw new ErroDeUso(`Não deu para criar: ${error.message}`);
      return { criado: true, recebivel_id: criado?.id, valor: reais(valor), vencimento };
    },
  },

  {
    nome: 'registrar_pagamento',
    descricao: 'Marca uma cobrança como recebida, com data, valor e forma de pagamento.',
    entrada: objeto(
      {
        recebivel: texto('Id da cobrança.'),
        valor_pago: { type: 'number', description: 'Padrão: o valor da cobrança.' },
        data_do_pagamento: texto('Padrão: hoje.'),
        forma: texto('Pix, boleto, cartão...'),
      },
      ['recebivel'],
    ),
    async executar(args) {
      const db = supabase();
      const id = obrigatorio(args, 'recebivel');
      const { data: r } = await db.from('receivables').select('id, amount, description').eq('id', id).maybeSingle();
      if (!r) throw new ErroDeUso(`Não existe cobrança com o id ${id}. Use listar_recebiveis para achar.`);

      const { error } = await db
        .from('receivables')
        .update({
          status: 'recebido',
          paid_at: data(args, 'data_do_pagamento') ?? hoje(),
          paid_amount: num(args, 'valor_pago') ?? r.amount,
          method: str(args, 'forma'),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw new ErroDeUso(`Não deu para registrar: ${error.message}`);
      return { recebido: r.description ?? id, valor: reais(Number(num(args, 'valor_pago') ?? r.amount)) };
    },
  },

  // ── Briefing ──────────────────────────────────────────────────────────────

  {
    nome: 'listar_briefings',
    descricao: 'Os briefings de onboarding, com situação (rascunho ou enviado) e o link público de cada um.',
    entrada: objeto({ cliente: texto('Filtra por um pedaço do nome do cliente.') }),
    async executar(args) {
      const { data: linhas } = await supabase()
        .from('onboarding_briefings')
        .select('id, product_name, scope, status, submitted_at, token, created_at, organizations(name)')
        .order('created_at', { ascending: false });

      const cliente = str(args, 'cliente')?.toLowerCase();
      const briefings = ((linhas ?? []) as unknown as Record<string, unknown>[])
        .map((b) => ({
          id: b.id,
          cliente: (b.organizations as { name?: string } | null)?.name ?? null,
          produto: b.product_name,
          escopo: b.scope,
          situacao: b.status,
          enviado_em: b.submitted_at,
          link: `${SITE}/onboarding/${b.token}`,
        }))
        .filter((b) => !cliente || (b.cliente ?? '').toLowerCase().includes(cliente));

      return { total: briefings.length, briefings };
    },
  },

  {
    nome: 'ler_briefing',
    descricao: 'As respostas que o cliente deu no briefing de onboarding, para usar como contexto do trabalho.',
    entrada: objeto({ briefing: texto('Id do briefing, ou nome do cliente.') }, ['briefing']),
    async executar(args) {
      const db = supabase();
      const termo = obrigatorio(args, 'briefing');
      const { data: linhas } = await db
        .from('onboarding_briefings')
        .select('id, product_name, scope, status, respostas, submitted_at, organizations(name)')
        .order('created_at', { ascending: false });

      const todos = (linhas ?? []) as unknown as Record<string, unknown>[];
      let alvo = todos.find((b) => b.id === termo);
      if (!alvo) {
        const casam = todos.filter((b) =>
          ((b.organizations as { name?: string } | null)?.name ?? '').toLowerCase().includes(termo.toLowerCase()));
        if (casam.length === 0) throw new ErroDeUso(`Nenhum briefing de "${termo}".`);
        alvo = casam[0]; // o mais recente do cliente
      }

      return {
        cliente: (alvo.organizations as { name?: string } | null)?.name ?? null,
        produto: alvo.product_name,
        escopo: alvo.scope,
        situacao: alvo.status,
        enviado_em: alvo.submitted_at,
        respostas: alvo.respostas,
      };
    },
  },

  {
    nome: 'criar_briefing',
    descricao: 'Cria um briefing de onboarding para o cliente e devolve o link público para mandar para ele.',
    entrada: objeto(
      {
        cliente: texto('Nome do cliente já cadastrado, ou id.'),
        produto: texto('O que está sendo contratado (ex: "Site institucional").'),
        escopo: texto('Resumo do escopo, opcional. Uma linha: aparece como rótulo na abertura.'),
        modelo: texto(`Template do formulário. Opções: ${Object.keys(ONBOARDING_TEMPLATES).join(', ')}. Padrão: produto.`),
        respostas: {
          type: 'object',
          additionalProperties: true,
          description:
            'Respostas já preenchidas pela Notkode, no formato {id_da_pergunta: "valor"} (use lista de textos nas perguntas de múltipla escolha). ' +
            'O cliente vê o campo preenchido, marcado para conferir, e só corrige o que estiver errado. Ids que não existem no template são ignorados.',
        },
      },
      ['cliente', 'produto'],
    ),
    async executar(args) {
      const cliente = await acharCliente(obrigatorio(args, 'cliente'));
      const modelo = str(args, 'modelo') ?? 'produto';
      const template_key = modelo in ONBOARDING_TEMPLATES ? modelo : 'produto';
      const token = randomUUID();

      // Pré-preenchimento: só entra o que é pergunta do template escolhido, e
      // a lista do que veio pronto vai junto para o formulário pedir conferência.
      const respostas: Record<string, string | string[]> = {};
      // Alguns clientes MCP mandam o objeto já serializado; aceitar os dois.
      let brutas: unknown = args.respostas;
      if (typeof brutas === 'string' && brutas.trim()) {
        try {
          brutas = JSON.parse(brutas);
        } catch {
          throw new ErroDeUso('O campo "respostas" não é um JSON válido.');
        }
      }
      if (brutas && typeof brutas === 'object' && !Array.isArray(brutas)) {
        const validos = templateQuestionIds(getOnboardingTemplate(template_key));
        for (const [id, valor] of Object.entries(brutas as Record<string, unknown>)) {
          if (!validos.has(id)) continue;
          if (typeof valor === 'string' && valor.trim()) respostas[id] = valor.trim();
          else if (Array.isArray(valor)) {
            const itens = valor.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
            if (itens.length > 0) respostas[id] = itens;
          }
        }
      }
      const preenchidos = Object.keys(respostas);
      if (preenchidos.length > 0) respostas[PREFILL_KEY] = preenchidos;

      const { error } = await supabase().from('onboarding_briefings').insert({
        organization_id: cliente.id,
        product_name: obrigatorio(args, 'produto'),
        scope: str(args, 'escopo'),
        template_key,
        token,
        status: 'rascunho',
        respostas,
      });

      if (error) throw new ErroDeUso(`Não deu para criar o briefing: ${error.message}`);
      return {
        criado: true,
        cliente: cliente.name,
        link: `${SITE}/onboarding/${token}`,
        pre_preenchidas: preenchidos.length,
      };
    },
  },

  {
    nome: 'apagar_briefing',
    descricao:
      'Apaga um briefing de onboarding em rascunho e sem nenhuma resposta do cliente, para limpar link duplicado ou criado errado. ' +
      'Briefing enviado, ou que o cliente já começou a responder, não é apagado.',
    entrada: objeto({ briefing: texto('Id do briefing ou o token do link público.') }, ['briefing']),
    async executar(args) {
      const chave = obrigatorio(args, 'briefing');
      if (!/^[0-9a-f-]{36}$/i.test(chave)) {
        throw new ErroDeUso('Informe o id do briefing ou o token do link (o trecho depois de /onboarding/).');
      }

      const { data, error } = await supabase()
        .from('onboarding_briefings')
        .select('id, token, status, respostas, product_name')
        .or(`id.eq.${chave},token.eq.${chave}`)
        .maybeSingle();
      if (error) throw new ErroDeUso(`Não deu para ler o briefing: ${error.message}`);
      if (!data) throw new ErroDeUso('Nenhum briefing com esse id ou token.');

      if (data.status !== 'rascunho') {
        throw new ErroDeUso('Esse briefing já foi enviado pelo cliente; apagar teria que ser na mão, no banco.');
      }
      // O que nós mesmos pré-preenchemos não conta como resposta do cliente.
      const guardadas = (data.respostas ?? {}) as Record<string, string | string[]>;
      const nossas = new Set(prefilledIds(guardadas));
      const respondidas = Object.keys(guardadas).filter((k) => k !== PREFILL_KEY && !nossas.has(k));
      if (respondidas.length > 0) {
        throw new ErroDeUso(
          `O cliente já respondeu ${respondidas.length} ${respondidas.length === 1 ? 'pergunta' : 'perguntas'} nesse briefing. Não apaguei.`,
        );
      }

      const { error: erroDel } = await supabase().from('onboarding_briefings').delete().eq('id', data.id);
      if (erroDel) throw new ErroDeUso(`Não deu para apagar: ${erroDel.message}`);
      return { apagado: true, produto: data.product_name };
    },
  },
];
