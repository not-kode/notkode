// Peças comuns das ferramentas do MCP da Notkode.
//
// A ideia do MCP daqui: do terminal, de qualquer repositório, dá para consultar
// e mexer no sistema (projetos, tarefas, cronograma, financeiro, propostas,
// briefing) sem abrir a tela. Quem fala com o banco é sempre o service role,
// porque quem chama já provou quem é pelo token do servidor.

import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type Ferramenta = {
  nome: string;
  descricao: string;
  /** JSON Schema dos argumentos, como o MCP espera. */
  entrada: Record<string, unknown>;
  executar: (args: Record<string, unknown>) => Promise<unknown>;
};

/** Açúcar para declarar o schema sem repetir "type: object" toda hora. */
export const objeto = (
  propriedades: Record<string, unknown>,
  obrigatorios: string[] = [],
): Record<string, unknown> => ({
  type: 'object',
  properties: propriedades,
  required: obrigatorios,
  additionalProperties: false,
});

export const texto = (descricao: string) => ({ type: 'string', description: descricao });
export const numero = (descricao: string) => ({ type: 'number', description: descricao });
export const booleano = (descricao: string) => ({ type: 'boolean', description: descricao });
export const opcoes = (valores: readonly string[], descricao: string) => ({
  type: 'string', enum: [...valores], description: descricao,
});
export const lista = (descricao: string) => ({
  type: 'array', items: { type: 'string' }, description: descricao,
});

/** Erro que vira mensagem para quem chamou, em vez de estouro genérico. */
export class ErroDeUso extends Error {}

export const str = (args: Record<string, unknown>, chave: string): string | null => {
  const v = args[chave];
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s : null;
};

export const obrigatorio = (args: Record<string, unknown>, chave: string): string => {
  const v = str(args, chave);
  if (!v) throw new ErroDeUso(`Falta "${chave}".`);
  return v;
};

export const num = (args: Record<string, unknown>, chave: string): number | null => {
  const v = args[chave];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v.replace(/\./g, '').replace(',', '.'));
    if (Number.isFinite(n)) return n;
  }
  return null;
};

export const bool = (args: Record<string, unknown>, chave: string): boolean | null => {
  const v = args[chave];
  if (typeof v === 'boolean') return v;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return null;
};

/** Data AAAA-MM-DD; aceita "hoje", "amanhã" e "+N" dias, que é como se fala. */
export const data = (args: Record<string, unknown>, chave: string): string | null => {
  const v = str(args, chave);
  if (!v) return null;
  const limpo = v.toLowerCase();
  if (limpo === 'hoje') return hoje();
  if (limpo === 'amanha' || limpo === 'amanhã') return somaDias(hoje(), 1);
  const relativo = limpo.match(/^\+(\d+)$/);
  if (relativo) return somaDias(hoje(), Number(relativo[1]));
  if (/^\d{4}-\d{2}-\d{2}$/.test(limpo)) return limpo;
  const brasileira = limpo.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brasileira) return `${brasileira[3]}-${brasileira[2]}-${brasileira[1]}`;
  throw new ErroDeUso(`Data inválida em "${chave}": use AAAA-MM-DD, DD/MM/AAAA, "hoje", "amanhã" ou "+7".`);
};

export const hoje = (): string => new Date().toISOString().slice(0, 10);
export const somaDias = (d: string, n: number): string =>
  new Date(Date.parse(`${d}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

export const supabase = () => getSupabaseAdmin();

// ── Achar as coisas por nome ────────────────────────────────────────────────
//
// Ninguém decora uuid. Todas as ferramentas aceitam id OU um pedaço do nome, e
// quando o pedaço casa com mais de um a resposta diz quais são, em vez de
// escolher sozinha e mexer no cliente errado.

const EH_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ProjetoAchado = {
  id: string;
  titulo: string | null;
  cliente: string | null;
  organization_id: string | null;
  repoPath: string | null;
  arquivado: boolean;
  nome: string;
};

/** Parece caminho de pasta? Então a busca é pelo repositório, não pelo nome. */
const ehCaminho = (termo: string) => termo.startsWith('/') || termo.startsWith('~') || termo.startsWith('.');

/** Sem barra no fim e com o ~ resolvido: dois jeitos de escrever a mesma pasta. */
export const arrumarCaminho = (caminho: string): string => {
  const semTil = caminho.startsWith('~') ? caminho.replace(/^~/, process.env.HOME ?? '/Users/camila') : caminho;
  return semTil.replace(/\/+$/, '');
};

/**
 * Projeto (engagement) por id, por título, pelo nome do cliente ou pelo caminho
 * do repositório em que se está trabalhando. O caminho é o que faz a tarefa
 * criada do terminal cair no cliente certo sem ninguém dizer o nome.
 */
export async function acharProjeto(termo: string): Promise<ProjetoAchado> {
  const db = supabase();
  const { data: linhas } = await db
    .from('engagements')
    .select('id, title, organization_id, repo_path, archived_at, organizations(name)')
    .order('created_at', { ascending: false });

  const todos = ((linhas ?? []) as unknown as {
    id: string; title: string | null; organization_id: string | null; repo_path: string | null;
    archived_at: string | null; organizations: { name: string | null } | null;
  }[]).map((e) => ({
    id: e.id,
    titulo: e.title,
    cliente: e.organizations?.name ?? null,
    organization_id: e.organization_id,
    repoPath: e.repo_path,
    arquivado: !!e.archived_at,
    nome: e.organizations?.name ?? e.title ?? 'Sem nome',
  }));

  if (ehCaminho(termo)) {
    const caminho = arrumarCaminho(termo);
    // A pasta de dentro do repositório também vale: quem chama pode estar em
    // src/ ou packages/x e continua sendo o mesmo cliente. Projeto arquivado
    // também é reconhecido (senão trabalho antigo vira "pasta desconhecida"),
    // mas o ativo ganha quando os dois apontam para a mesma pasta.
    const doRepo = todos
      .filter((p) => p.repoPath && (caminho === p.repoPath || caminho.startsWith(p.repoPath + '/')))
      .sort((a, b) =>
        Number(a.arquivado) - Number(b.arquivado) || (b.repoPath?.length ?? 0) - (a.repoPath?.length ?? 0));
    if (!doRepo.length) {
      throw new ErroDeUso(
        `Nenhum projeto está ligado à pasta ${caminho}. Ligue com "definir_repositorio" ou diga o nome do cliente.`,
      );
    }
    return doRepo[0];
  }

  if (EH_UUID.test(termo)) {
    const exato = todos.find((p) => p.id === termo);
    if (!exato) throw new ErroDeUso(`Não existe projeto com o id ${termo}.`);
    return exato;
  }

  const alvo = termo.toLowerCase();
  const casam = todos.filter(
    (p) => (p.cliente ?? '').toLowerCase().includes(alvo) || (p.titulo ?? '').toLowerCase().includes(alvo),
  );

  if (casam.length === 0) {
    throw new ErroDeUso(
      `Nenhum projeto com "${termo}". Os que existem: ${todos.map((p) => p.nome).join(', ') || 'nenhum'}.`,
    );
  }
  if (casam.length > 1) {
    const iguais = casam.filter((p) => (p.cliente ?? '').toLowerCase() === alvo || (p.titulo ?? '').toLowerCase() === alvo);
    if (iguais.length === 1) return iguais[0];
    throw new ErroDeUso(
      `"${termo}" casa com mais de um projeto: ${casam.map((p) => `${p.nome} (${p.id})`).join(' | ')}. Diga qual.`,
    );
  }
  return casam[0];
}

/** Tarefa por id ou por um pedaço do título, opcionalmente dentro de um projeto. */
export async function acharTarefa(termo: string, projetoId?: string): Promise<{
  id: string; title: string; engagement_id: string; status: string;
}> {
  const db = supabase();
  if (EH_UUID.test(termo)) {
    const { data: t } = await db
      .from('project_tasks')
      .select('id, title, engagement_id, status')
      .eq('id', termo)
      .maybeSingle();
    if (!t) throw new ErroDeUso(`Não existe tarefa com o id ${termo}.`);
    return t as { id: string; title: string; engagement_id: string; status: string };
  }

  let q = db.from('project_tasks').select('id, title, engagement_id, status').ilike('title', `%${termo}%`);
  if (projetoId) q = q.eq('engagement_id', projetoId);
  const { data: achadas } = await q.limit(20);

  const lista = (achadas ?? []) as { id: string; title: string; engagement_id: string; status: string }[];
  if (lista.length === 0) throw new ErroDeUso(`Nenhuma tarefa com "${termo}"${projetoId ? ' neste projeto' : ''}.`);
  if (lista.length > 1) {
    const iguais = lista.filter((t) => t.title.toLowerCase() === termo.toLowerCase());
    if (iguais.length === 1) return iguais[0];
    throw new ErroDeUso(
      `"${termo}" casa com ${lista.length} tarefas: ${lista.map((t) => `${t.title} (${t.id})`).join(' | ')}. Diga qual.`,
    );
  }
  return lista[0];
}

/** Cliente (organization) por id ou por um pedaço do nome. */
export async function acharCliente(termo: string): Promise<{ id: string; name: string }> {
  const db = supabase();
  if (EH_UUID.test(termo)) {
    const { data: o } = await db.from('organizations').select('id, name').eq('id', termo).maybeSingle();
    if (!o) throw new ErroDeUso(`Não existe cliente com o id ${termo}.`);
    return o as { id: string; name: string };
  }

  const { data: achados } = await db.from('organizations').select('id, name').ilike('name', `%${termo}%`).limit(20);
  const lista = (achados ?? []) as { id: string; name: string }[];
  if (lista.length === 0) throw new ErroDeUso(`Nenhum cliente com "${termo}".`);
  if (lista.length > 1) {
    const iguais = lista.filter((o) => o.name.toLowerCase() === termo.toLowerCase());
    if (iguais.length === 1) return iguais[0];
    throw new ErroDeUso(`"${termo}" casa com: ${lista.map((o) => `${o.name} (${o.id})`).join(' | ')}. Diga qual.`);
  }
  return lista[0];
}

/** Etapa do cronograma por id ou nome, dentro de um projeto. */
export async function acharEtapa(termo: string, projetoId: string): Promise<{ id: string; name: string }> {
  const db = supabase();
  const { data: achadas } = await db
    .from('project_phases')
    .select('id, name')
    .eq('engagement_id', projetoId);

  const lista = (achadas ?? []) as { id: string; name: string }[];
  if (EH_UUID.test(termo)) {
    const exata = lista.find((e) => e.id === termo);
    if (!exata) throw new ErroDeUso(`Este projeto não tem etapa com o id ${termo}.`);
    return exata;
  }
  const casam = lista.filter((e) => e.name.toLowerCase().includes(termo.toLowerCase()));
  if (casam.length === 0) {
    throw new ErroDeUso(`Nenhuma etapa com "${termo}". As do projeto: ${lista.map((e) => e.name).join(', ') || 'nenhuma'}.`);
  }
  if (casam.length > 1) throw new ErroDeUso(`"${termo}" casa com: ${casam.map((e) => e.name).join(' | ')}. Diga qual.`);
  return casam[0];
}

/** Dinheiro em real, do jeito que se lê num resumo. */
export const reais = (v: number | null | undefined): string =>
  v == null ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
