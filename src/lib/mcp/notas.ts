// Base de notas e conversa das tarefas, pelo MCP: é o material que veio do
// SimbOS (diagnósticos, estratégias, decisões) e o histórico de cada tarefa.

import {
  ErroDeUso, acharProjeto, acharTarefa, num, objeto, obrigatorio, opcoes, str,
  supabase, texto, type Ferramenta,
} from './nucleo';

const TIPOS = ['nota', 'aprendizado', 'pessoa', 'recurso'] as const;

export const ferramentasDeNota: Ferramenta[] = [
  {
    nome: 'listar_notas',
    descricao:
      'A base de notas: diagnósticos, estratégias, decisões e fichas de pessoas. Busca no título, no texto e nas ' +
      'tags. Sem filtro de projeto, traz de tudo, inclusive as que não são de nenhum cliente.',
    entrada: objeto({
      projeto: texto('Nome do cliente, título ou id, para ver só as notas dele.'),
      busca: texto('Palavra a procurar no título, no conteúdo ou nas tags.'),
      tipo: opcoes(TIPOS, 'Filtra por tipo.'),
      limite: { type: 'number', description: 'Padrão: 40.' },
    }),
    async executar(args) {
      const db = supabase();
      const projetoTermo = str(args, 'projeto');
      const alvo = projetoTermo ? await acharProjeto(projetoTermo) : null;

      let q = db.from('notes').select('id, engagement_id, title, content, kind, tags, updated_at').order('updated_at', { ascending: false });
      if (alvo) q = q.eq('engagement_id', alvo.id);
      const tipo = str(args, 'tipo');
      if (tipo) q = q.eq('kind', tipo);
      const { data: linhas } = await q;

      const busca = str(args, 'busca')?.toLowerCase();
      const limite = Math.min(Math.max(num(args, 'limite') ?? 40, 1), 200);

      const notas = ((linhas ?? []) as Record<string, unknown>[])
        .filter((n) =>
          !busca ||
          String(n.title ?? '').toLowerCase().includes(busca) ||
          String(n.content ?? '').toLowerCase().includes(busca) ||
          (n.tags as string[] | null)?.some((t) => t.toLowerCase().includes(busca)))
        .slice(0, limite)
        .map((n) => ({
          id: n.id,
          titulo: n.title,
          tipo: n.kind,
          tags: n.tags,
          projeto_id: n.engagement_id,
          atualizada_em: n.updated_at,
          // O conteúdo inteiro vem em ler_nota; aqui só o começo, para caber.
          previa: String(n.content ?? '').slice(0, 240),
        }));

      return { total: notas.length, notas };
    },
  },

  {
    nome: 'ler_nota',
    descricao: 'O conteúdo inteiro de uma nota.',
    entrada: objeto({ nota: texto('Id da nota, ou um pedaço do título.') }, ['nota']),
    async executar(args) {
      const termo = obrigatorio(args, 'nota');
      const db = supabase();

      const { data: porId } = await db
        .from('notes')
        .select('id, engagement_id, title, content, kind, tags, created_at, updated_at')
        .eq('id', termo)
        .maybeSingle();

      let nota = porId as Record<string, unknown> | null;
      if (!nota) {
        const { data: achadas } = await db
          .from('notes')
          .select('id, engagement_id, title, content, kind, tags, created_at, updated_at')
          .ilike('title', `%${termo}%`)
          .limit(10);
        const lista = (achadas ?? []) as Record<string, unknown>[];
        if (lista.length === 0) throw new ErroDeUso(`Nenhuma nota com "${termo}".`);
        if (lista.length > 1) {
          throw new ErroDeUso(`"${termo}" casa com: ${lista.map((n) => `${n.title} (${n.id})`).join(' | ')}. Diga qual.`);
        }
        nota = lista[0];
      }

      return {
        id: nota.id, titulo: nota.title, tipo: nota.kind, tags: nota.tags,
        projeto_id: nota.engagement_id, criada_em: nota.created_at, atualizada_em: nota.updated_at,
        conteudo: nota.content,
      };
    },
  },

  {
    nome: 'criar_nota',
    descricao:
      'Guarda uma nota na base: contexto de um cliente, decisão de arquitetura, aprendizado. Presa a um projeto ' +
      'quando você disser qual.',
    entrada: objeto(
      {
        titulo: texto('Título da nota.'),
        conteudo: texto('O texto, em markdown.'),
        projeto: texto('Nome do cliente, título ou id. Sem isso, a nota fica em "Gerais".'),
        tipo: opcoes(TIPOS, 'Padrão: nota.'),
        tags: { type: 'array', items: { type: 'string' }, description: 'Etiquetas para achar depois.' },
      },
      ['titulo'],
    ),
    async executar(args) {
      const projetoTermo = str(args, 'projeto');
      const alvo = projetoTermo ? await acharProjeto(projetoTermo) : null;
      const tipo = str(args, 'tipo');
      const tags = Array.isArray(args.tags) ? (args.tags as unknown[]).map(String) : [];

      const { data: criada, error } = await supabase()
        .from('notes')
        .insert({
          engagement_id: alvo?.id ?? null,
          title: obrigatorio(args, 'titulo'),
          content: str(args, 'conteudo'),
          kind: tipo && TIPOS.includes(tipo as never) ? tipo : 'nota',
          tags,
        })
        .select('id')
        .maybeSingle();

      if (error) throw new ErroDeUso(`Não deu para salvar a nota: ${error.message}`);
      return { criada: true, nota_id: criada?.id, projeto: alvo?.nome ?? 'Gerais' };
    },
  },

  {
    nome: 'atualizar_nota',
    descricao: 'Muda título, conteúdo, tipo, tags ou o projeto de uma nota.',
    entrada: objeto(
      {
        nota: texto('Id da nota.'),
        titulo: texto('Novo título.'),
        conteudo: texto('Novo conteúdo.'),
        projeto: texto('Prende a nota a este projeto; vazio solta para "Gerais".'),
        tipo: opcoes(TIPOS, 'Novo tipo.'),
        tags: { type: 'array', items: { type: 'string' }, description: 'Substitui as etiquetas.' },
      },
      ['nota'],
    ),
    async executar(args) {
      const id = obrigatorio(args, 'nota');
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

      if (args.titulo !== undefined) patch.title = str(args, 'titulo');
      if (args.conteudo !== undefined) patch.content = str(args, 'conteudo');
      if (args.tipo !== undefined) patch.kind = str(args, 'tipo') ?? 'nota';
      if (args.tags !== undefined) patch.tags = Array.isArray(args.tags) ? (args.tags as unknown[]).map(String) : [];
      if (args.projeto !== undefined) {
        const termo = str(args, 'projeto');
        patch.engagement_id = termo ? (await acharProjeto(termo)).id : null;
      }

      if (Object.keys(patch).length === 1) throw new ErroDeUso('Nada para mudar.');
      const { error } = await supabase().from('notes').update(patch).eq('id', id);
      if (error) throw new ErroDeUso(`Não deu para salvar: ${error.message}`);
      return { atualizada: id, campos: Object.keys(patch).filter((k) => k !== 'updated_at') };
    },
  },

  {
    nome: 'comentar_tarefa',
    descricao: 'Escreve um comentário na tarefa. É onde fica registrado o que foi decidido no meio do caminho.',
    entrada: objeto(
      {
        tarefa: texto('Id ou título da tarefa.'),
        texto: texto('O comentário.'),
        projeto: texto('Ajuda a achar a tarefa quando o título se repete.'),
        autor: texto('Quem escreveu. Padrão: Camila Gregório.'),
      },
      ['tarefa', 'texto'],
    ),
    async executar(args) {
      const projetoTermo = str(args, 'projeto');
      const doProjeto = projetoTermo ? await acharProjeto(projetoTermo) : null;
      const tarefa = await acharTarefa(obrigatorio(args, 'tarefa'), doProjeto?.id);

      const { error } = await supabase().from('task_comments').insert({
        task_id: tarefa.id,
        content: obrigatorio(args, 'texto'),
        author: str(args, 'autor') ?? 'Camila Gregório',
      });

      if (error) throw new ErroDeUso(`Não deu para comentar: ${error.message}`);
      return { comentado_em: tarefa.title };
    },
  },

  {
    nome: 'listar_comentarios',
    descricao: 'A conversa registrada numa tarefa, em ordem.',
    entrada: objeto({ tarefa: texto('Id ou título.'), projeto: texto('Ajuda a achar.') }, ['tarefa']),
    async executar(args) {
      const projetoTermo = str(args, 'projeto');
      const doProjeto = projetoTermo ? await acharProjeto(projetoTermo) : null;
      const tarefa = await acharTarefa(obrigatorio(args, 'tarefa'), doProjeto?.id);

      const { data: linhas } = await supabase()
        .from('task_comments')
        .select('id, author, content, created_at')
        .eq('task_id', tarefa.id)
        .order('created_at');

      return {
        tarefa: tarefa.title,
        comentarios: ((linhas ?? []) as Record<string, unknown>[]).map((c) => ({
          quem: c.author, quando: c.created_at, texto: c.content,
        })),
      };
    },
  },
];
