// Ferramentas de tarefa e cronograma. É o que mais se usa do terminal: abrir o
// repositório de um cliente, jogar as tarefas do que a gente combinou e ir
// fechando conforme entrega.

import {
  ErroDeUso, acharEtapa, acharProjeto, acharTarefa, bool, data, hoje, lista, num,
  objeto, obrigatorio, opcoes, somaDias, str, supabase, texto, type Ferramenta,
} from './nucleo';
import { PRIORITIES, RESPONSAVEL_PADRAO, TASK_STATUSES } from '@/app/admin/(app)/entregas/status';

const QUANDO = ['hoje', 'atrasadas', 'semana', 'mes', 'sem_prazo', 'tudo'] as const;

type TarefaRow = {
  id: string; engagement_id: string; phase_id: string | null; parent_task_id: string | null;
  title: string; notes: string | null; status: string; priority: string;
  start_date: string | null; due_date: string | null; assignee: string | null;
  client_visible: boolean; sort: number | null; time_spent_seconds: number | null;
  timer_started_at: string | null; created_at: string;
};

const daTarefa = (t: TarefaRow) => ({
  id: t.id,
  titulo: t.title,
  status: t.status,
  prioridade: t.priority,
  prazo: t.due_date,
  inicio: t.start_date,
  responsavel: t.assignee,
  etapa_id: t.phase_id,
  subtarefa_de: t.parent_task_id,
  tempo_minutos: Math.round((t.time_spent_seconds ?? 0) / 60),
  cronometro_ligado: !!t.timer_started_at,
  cliente_ve: t.client_visible,
  descricao: t.notes,
});

export const ferramentasDeTarefa: Ferramenta[] = [
  {
    nome: 'listar_tarefas',
    descricao:
      'As tarefas do sistema, com filtro de projeto, status, responsável e recorte de prazo (hoje, atrasadas, ' +
      'semana, mês). Sem filtro de projeto, traz de todos, que é a pergunta "o que eu tenho para hoje".',
    entrada: objeto({
      projeto: texto('Nome do cliente, título ou id. Sem isso, traz de todos os projetos.'),
      status: opcoes(TASK_STATUSES, 'Filtra por um status.'),
      quando: opcoes(QUANDO, 'Recorte de prazo. Padrão: tudo.'),
      responsavel: texto('Filtra por um pedaço do nome de quem toca.'),
      incluir_feitas: { type: 'boolean', description: 'Traz também as concluídas. Padrão: não.' },
      limite: { type: 'number', description: 'Máximo de tarefas na resposta. Padrão: 100.' },
    }),
    async executar(args) {
      const db = supabase();
      const projetoTermo = str(args, 'projeto');
      const alvo = projetoTermo ? await acharProjeto(projetoTermo) : null;

      let q = db.from('project_tasks').select('*').order('sort');
      if (alvo) q = q.eq('engagement_id', alvo.id);
      const { data: linhas } = await q;

      const { data: engs } = await db.from('engagements').select('id, title, organizations(name)');
      const nomeDoProjeto = new Map(
        ((engs ?? []) as unknown as { id: string; title: string | null; organizations: { name: string | null } | null }[])
          .map((e) => [e.id, e.organizations?.name ?? e.title ?? 'Sem nome']),
      );

      const hj = hoje();
      const quando = str(args, 'quando') ?? 'tudo';
      const responsavel = str(args, 'responsavel')?.toLowerCase();
      const status = str(args, 'status');
      const incluirFeitas = bool(args, 'incluir_feitas') === true;
      const limite = Math.min(Math.max(num(args, 'limite') ?? 100, 1), 500);

      const passaPrazo = (t: TarefaRow) => {
        switch (quando) {
          case 'hoje': return t.due_date === hj;
          case 'atrasadas': return !!t.due_date && t.due_date < hj && t.status !== 'feito';
          case 'semana': return !!t.due_date && t.due_date >= hj && t.due_date <= somaDias(hj, 7);
          case 'mes': return !!t.due_date && t.due_date.slice(0, 7) === hj.slice(0, 7);
          case 'sem_prazo': return !t.due_date;
          default: return true;
        }
      };

      const todas = (linhas ?? []) as TarefaRow[];
      const filtradas = todas
        .filter((t) => (status ? t.status === status : incluirFeitas || t.status !== 'feito'))
        .filter((t) => !responsavel || (t.assignee ?? '').toLowerCase().includes(responsavel))
        .filter(passaPrazo)
        .sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999'));

      return {
        total: filtradas.length,
        mostrando: Math.min(filtradas.length, limite),
        tarefas: filtradas.slice(0, limite).map((t) => ({
          ...daTarefa(t),
          projeto: nomeDoProjeto.get(t.engagement_id) ?? null,
          projeto_id: t.engagement_id,
        })),
      };
    },
  },

  {
    nome: 'criar_tarefa',
    descricao:
      'Cria uma tarefa num projeto. Sem responsável dito, nasce com a Camila. Para várias de uma vez, chame de novo ' +
      'ou use "titulos".',
    entrada: objeto(
      {
        projeto: texto('Nome do cliente, título ou id.'),
        titulo: texto('O que precisa ser feito.'),
        titulos: lista('Vários títulos de uma vez; cria uma tarefa para cada.'),
        descricao: texto('Contexto da tarefa.'),
        status: opcoes(TASK_STATUSES, 'Padrão: a_fazer.'),
        prioridade: opcoes(PRIORITIES, 'Padrão: media.'),
        prazo: texto('AAAA-MM-DD, DD/MM/AAAA, "hoje", "amanhã" ou "+7".'),
        inicio: texto('Quando começa.'),
        etapa: texto('Nome ou id da etapa do cronograma.'),
        responsavel: texto('Quem toca.'),
        subtarefa_de: texto('Id ou título da tarefa-mãe.'),
        cliente_ve: { type: 'boolean', description: 'Aparece no link de acompanhamento. Padrão: sim.' },
      },
      ['projeto'],
    ),
    async executar(args) {
      const alvo = await acharProjeto(obrigatorio(args, 'projeto'));
      const db = supabase();

      const varios = Array.isArray(args.titulos) ? (args.titulos as unknown[]).map(String).filter(Boolean) : [];
      const um = str(args, 'titulo');
      const titulos = varios.length ? varios : um ? [um] : [];
      if (!titulos.length) throw new ErroDeUso('Falta "titulo" (ou "titulos").');

      const etapaTermo = str(args, 'etapa');
      const etapa = etapaTermo ? await acharEtapa(etapaTermo, alvo.id) : null;
      const maeTermo = str(args, 'subtarefa_de');
      const mae = maeTermo ? await acharTarefa(maeTermo, alvo.id) : null;

      const status = str(args, 'status');
      const prioridade = str(args, 'prioridade');
      const clienteVe = bool(args, 'cliente_ve');

      const { data: ultima } = await db
        .from('project_tasks')
        .select('sort')
        .eq('engagement_id', alvo.id)
        .order('sort', { ascending: false })
        .limit(1);
      let ordem = ((ultima?.[0]?.sort as number | undefined) ?? -1) + 1;

      const criadas: { id: string; titulo: string }[] = [];
      for (const titulo of titulos) {
        const { data: nova, error } = await db
          .from('project_tasks')
          .insert({
            engagement_id: alvo.id,
            phase_id: etapa?.id ?? null,
            parent_task_id: mae?.id ?? null,
            title: titulo.slice(0, 300),
            notes: str(args, 'descricao'),
            status: status && TASK_STATUSES.includes(status as never) ? status : 'a_fazer',
            priority: prioridade && PRIORITIES.includes(prioridade as never) ? prioridade : 'media',
            start_date: data(args, 'inicio'),
            due_date: data(args, 'prazo'),
            assignee: str(args, 'responsavel') ?? RESPONSAVEL_PADRAO,
            client_visible: clienteVe ?? true,
            sort: ordem++,
          })
          .select('id')
          .maybeSingle();

        if (error) throw new ErroDeUso(`Não deu para criar "${titulo}": ${error.message}`);
        criadas.push({ id: String(nova?.id), titulo });
      }

      return { criadas: criadas.length, projeto: alvo.nome, tarefas: criadas };
    },
  },

  {
    nome: 'atualizar_tarefa',
    descricao:
      'Muda uma tarefa: status, prazo, prioridade, responsável, etapa, título ou descrição. Só mexe no que vier.',
    entrada: objeto(
      {
        tarefa: texto('Id ou um pedaço do título.'),
        projeto: texto('Ajuda a achar a tarefa quando o título se repete entre clientes.'),
        titulo: texto('Novo título.'),
        descricao: texto('Nova descrição.'),
        status: opcoes(TASK_STATUSES, 'Novo status.'),
        prioridade: opcoes(PRIORITIES, 'Nova prioridade.'),
        prazo: texto('Novo prazo; vazio limpa.'),
        inicio: texto('Novo começo; vazio limpa.'),
        responsavel: texto('Quem toca; vazio limpa.'),
        etapa: texto('Nome ou id da etapa; vazio tira da etapa.'),
        cliente_ve: { type: 'boolean', description: 'Aparece no link do cliente.' },
      },
      ['tarefa'],
    ),
    async executar(args) {
      const projetoTermo = str(args, 'projeto');
      const doProjeto = projetoTermo ? await acharProjeto(projetoTermo) : null;
      const tarefa = await acharTarefa(obrigatorio(args, 'tarefa'), doProjeto?.id);

      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (args.titulo !== undefined) patch.title = str(args, 'titulo');
      if (args.descricao !== undefined) patch.notes = str(args, 'descricao');
      if (args.prazo !== undefined) patch.due_date = data(args, 'prazo');
      if (args.inicio !== undefined) patch.start_date = data(args, 'inicio');
      if (args.responsavel !== undefined) patch.assignee = str(args, 'responsavel');
      if (args.cliente_ve !== undefined) patch.client_visible = bool(args, 'cliente_ve') ?? true;

      if (args.etapa !== undefined) {
        const termo = str(args, 'etapa');
        patch.phase_id = termo ? (await acharEtapa(termo, tarefa.engagement_id)).id : null;
      }

      const prioridade = str(args, 'prioridade');
      if (prioridade) {
        if (!PRIORITIES.includes(prioridade as never)) throw new ErroDeUso(`Prioridade inválida: use ${PRIORITIES.join(', ')}.`);
        patch.priority = prioridade;
      }

      const status = str(args, 'status');
      if (status) {
        if (!TASK_STATUSES.includes(status as never)) throw new ErroDeUso(`Status inválido: use ${TASK_STATUSES.join(', ')}.`);
        patch.status = status;
        patch.done_at = status === 'feito' ? new Date().toISOString() : null;
        if (status === 'feito') Object.assign(patch, await pararRelogio(tarefa.id));
      }

      if (Object.keys(patch).length === 1) throw new ErroDeUso('Nada para mudar: informe pelo menos um campo.');

      const { error } = await supabase().from('project_tasks').update(patch).eq('id', tarefa.id);
      if (error) throw new ErroDeUso(`Não deu para salvar: ${error.message}`);
      return { atualizada: tarefa.title, campos: Object.keys(patch).filter((k) => k !== 'updated_at') };
    },
  },

  {
    nome: 'concluir_tarefas',
    descricao: 'Marca uma ou várias tarefas como feitas (e para o cronômetro de quem estava contando).',
    entrada: objeto(
      {
        tarefas: lista('Ids ou títulos das tarefas.'),
        projeto: texto('Ajuda a achar pelos títulos.'),
        reabrir: { type: 'boolean', description: 'true devolve para "a fazer" em vez de concluir.' },
      },
      ['tarefas'],
    ),
    async executar(args) {
      const termos = Array.isArray(args.tarefas) ? (args.tarefas as unknown[]).map(String).filter(Boolean) : [];
      if (!termos.length) throw new ErroDeUso('Falta "tarefas".');

      const projetoTermo = str(args, 'projeto');
      const doProjeto = projetoTermo ? await acharProjeto(projetoTermo) : null;
      const reabrir = bool(args, 'reabrir') === true;
      const db = supabase();

      const feitas: string[] = [];
      for (const termo of termos) {
        const t = await acharTarefa(termo, doProjeto?.id);
        await db
          .from('project_tasks')
          .update({
            status: reabrir ? 'a_fazer' : 'feito',
            done_at: reabrir ? null : new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...(reabrir ? {} : await pararRelogio(t.id)),
          })
          .eq('id', t.id);
        feitas.push(t.title);
      }

      return { [reabrir ? 'reabertas' : 'concluidas']: feitas };
    },
  },

  {
    nome: 'apagar_tarefa',
    descricao: 'Apaga uma tarefa de vez. As subtarefas dela vão junto.',
    entrada: objeto({ tarefa: texto('Id ou título.'), projeto: texto('Ajuda a achar pelo título.') }, ['tarefa']),
    async executar(args) {
      const projetoTermo = str(args, 'projeto');
      const doProjeto = projetoTermo ? await acharProjeto(projetoTermo) : null;
      const tarefa = await acharTarefa(obrigatorio(args, 'tarefa'), doProjeto?.id);
      await supabase().from('project_tasks').delete().eq('id', tarefa.id);
      return { apagada: tarefa.title };
    },
  },

  {
    nome: 'cronometro',
    descricao: 'Liga ou desliga o cronômetro de uma tarefa. Só um relógio corre por vez em todo o sistema.',
    entrada: objeto(
      { tarefa: texto('Id ou título.'), acao: opcoes(['iniciar', 'parar'], 'Padrão: iniciar.'), projeto: texto('Ajuda a achar.') },
      ['tarefa'],
    ),
    async executar(args) {
      const projetoTermo = str(args, 'projeto');
      const doProjeto = projetoTermo ? await acharProjeto(projetoTermo) : null;
      const tarefa = await acharTarefa(obrigatorio(args, 'tarefa'), doProjeto?.id);
      const db = supabase();

      if ((str(args, 'acao') ?? 'iniciar') === 'parar') {
        const patch = await pararRelogio(tarefa.id);
        if (!Object.keys(patch).length) return { aviso: 'O cronômetro desta tarefa já estava parado.' };
        await db.from('project_tasks').update(patch).eq('id', tarefa.id);
        return { parado: tarefa.title, tempo_minutos: Math.round(Number(patch.time_spent_seconds ?? 0) / 60) };
      }

      const { data: correndo } = await db.from('project_tasks').select('id').not('timer_started_at', 'is', null);
      for (const t of (correndo ?? []) as { id: string }[]) {
        await db.from('project_tasks').update(await pararRelogio(t.id)).eq('id', t.id);
      }
      await db.from('project_tasks').update({ timer_started_at: new Date().toISOString() }).eq('id', tarefa.id);
      return { contando: tarefa.title };
    },
  },

  // ── Cronograma ────────────────────────────────────────────────────────────

  {
    nome: 'listar_etapas',
    descricao: 'As etapas do cronograma de um projeto, com datas, situação e quantas tarefas cada uma tem.',
    entrada: objeto({ projeto: texto('Nome do cliente, título ou id.') }, ['projeto']),
    async executar(args) {
      const alvo = await acharProjeto(obrigatorio(args, 'projeto'));
      const db = supabase();
      const [{ data: etapas }, { data: tarefas }] = await Promise.all([
        db.from('project_phases').select('*').eq('engagement_id', alvo.id).order('sort'),
        db.from('project_tasks').select('id, phase_id, status').eq('engagement_id', alvo.id),
      ]);

      const todas = (tarefas ?? []) as { id: string; phase_id: string | null; status: string }[];
      return {
        projeto: alvo.nome,
        etapas: ((etapas ?? []) as Record<string, unknown>[]).map((e) => ({
          id: e.id, nome: e.name, situacao: e.status, inicio: e.start_date, fim: e.end_date,
          cliente_ve: e.client_visible, descricao: e.description,
          tarefas: todas.filter((t) => t.phase_id === e.id).length,
          tarefas_feitas: todas.filter((t) => t.phase_id === e.id && t.status === 'feito').length,
        })),
        tarefas_sem_etapa: todas.filter((t) => !t.phase_id).length,
      };
    },
  },

  {
    nome: 'criar_etapa',
    descricao:
      'Cria uma etapa no cronograma do projeto. As etapas são o que o cliente vê no link de acompanhamento, e é ' +
      'dentro delas que as tarefas entram na linha do tempo.',
    entrada: objeto(
      {
        projeto: texto('Nome do cliente, título ou id.'),
        nome: texto('Nome da etapa (ex: Descoberta, Implementação).'),
        inicio: texto('Começo da etapa.'),
        fim: texto('Fim previsto.'),
        descricao: texto('O que acontece nesta etapa.'),
        cliente_ve: { type: 'boolean', description: 'Padrão: sim.' },
      },
      ['projeto', 'nome'],
    ),
    async executar(args) {
      const alvo = await acharProjeto(obrigatorio(args, 'projeto'));
      const db = supabase();
      const { data: ultima } = await db
        .from('project_phases')
        .select('sort')
        .eq('engagement_id', alvo.id)
        .order('sort', { ascending: false })
        .limit(1);

      const { data: criada, error } = await db
        .from('project_phases')
        .insert({
          engagement_id: alvo.id,
          name: obrigatorio(args, 'nome'),
          description: str(args, 'descricao'),
          start_date: data(args, 'inicio'),
          end_date: data(args, 'fim'),
          client_visible: bool(args, 'cliente_ve') ?? true,
          sort: ((ultima?.[0]?.sort as number | undefined) ?? -1) + 1,
        })
        .select('id')
        .maybeSingle();

      if (error) throw new ErroDeUso(`Não deu para criar a etapa: ${error.message}`);
      return { criada: true, etapa_id: criada?.id, projeto: alvo.nome };
    },
  },

  {
    nome: 'atualizar_etapa',
    descricao: 'Muda nome, datas, situação ou visibilidade de uma etapa do cronograma.',
    entrada: objeto(
      {
        projeto: texto('Nome do cliente, título ou id.'),
        etapa: texto('Nome ou id da etapa.'),
        nome: texto('Novo nome.'),
        situacao: opcoes(['pendente', 'em_andamento', 'concluida', 'pausada'], 'Situação da etapa.'),
        inicio: texto('Novo começo.'),
        fim: texto('Novo fim.'),
        descricao: texto('Nova descrição.'),
        cliente_ve: { type: 'boolean', description: 'Se aparece no link do cliente.' },
      },
      ['projeto', 'etapa'],
    ),
    async executar(args) {
      const alvo = await acharProjeto(obrigatorio(args, 'projeto'));
      const etapa = await acharEtapa(obrigatorio(args, 'etapa'), alvo.id);

      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (args.nome !== undefined) patch.name = str(args, 'nome');
      if (args.descricao !== undefined) patch.description = str(args, 'descricao');
      if (args.inicio !== undefined) patch.start_date = data(args, 'inicio');
      if (args.fim !== undefined) patch.end_date = data(args, 'fim');
      if (args.cliente_ve !== undefined) patch.client_visible = bool(args, 'cliente_ve') ?? true;
      const situacao = str(args, 'situacao');
      if (situacao) patch.status = situacao;

      if (Object.keys(patch).length === 1) throw new ErroDeUso('Nada para mudar.');
      const { error } = await supabase().from('project_phases').update(patch).eq('id', etapa.id);
      if (error) throw new ErroDeUso(`Não deu para salvar: ${error.message}`);
      return { atualizada: etapa.name };
    },
  },

  {
    nome: 'apagar_etapa',
    descricao: 'Apaga uma etapa. As tarefas dela não somem: viram tarefas sem etapa.',
    entrada: objeto({ projeto: texto('Nome do cliente, título ou id.'), etapa: texto('Nome ou id.') }, ['projeto', 'etapa']),
    async executar(args) {
      const alvo = await acharProjeto(obrigatorio(args, 'projeto'));
      const etapa = await acharEtapa(obrigatorio(args, 'etapa'), alvo.id);
      await supabase().from('project_phases').delete().eq('id', etapa.id);
      return { apagada: etapa.name };
    },
  },
];

/** Fecha o cronômetro somando o que correu; vazio se já estava parado. */
async function pararRelogio(id: string): Promise<Record<string, unknown>> {
  const { data: t } = await supabase()
    .from('project_tasks')
    .select('time_spent_seconds, timer_started_at')
    .eq('id', id)
    .maybeSingle();

  const desde = t?.timer_started_at as string | null | undefined;
  if (!desde) return {};
  const corrido = Math.max(0, Math.round((Date.now() - Date.parse(desde)) / 1000));
  return { time_spent_seconds: ((t?.time_spent_seconds as number | null) ?? 0) + corrido, timer_started_at: null };
}
