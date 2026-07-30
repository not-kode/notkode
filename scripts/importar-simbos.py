#!/usr/bin/env python3
"""Importa o export do SimbOS para o banco do sistema.

Rodou uma vez, em 30/07/2026, quando as tarefas mudaram de casa: o SimbOS
deixou de ser usado e o dono do workspace mandou o dump completo. Fica no repo
porque é idempotente e serve de registro do que entrou e de como foi mapeado.

  export SUPABASE_ACCESS_TOKEN=...   # token de gestão do Supabase
  python3 scripts/importar-simbos.py <pasta-do-export> [--valendo]

Sem --valendo ele só conta o que faria. A dedupe é por `simbos_task_id`,
`notes.origem_id` e `task_comments.origem_id`, então rodar duas vezes não
duplica nada.
"""

import json
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

PROJETO = 'qaftinthgdrnvifordho'
API = f'https://api.supabase.com/v1/projects/{PROJETO}/database/query'
RESPONSAVEL_PADRAO = 'Camila Gregório'

STATUS = {'backlog': 'backlog', 'todo': 'a_fazer', 'in_progress': 'fazendo', 'review': 'revisao', 'done': 'feito'}
PRIORIDADE = {'low': 'baixa', 'medium': 'media', 'high': 'alta', 'urgent': 'urgente'}

# Projetos do SimbOS sem par no sistema que valem virar projeto aqui (os outros
# estão vazios: nenhuma tarefa e nenhuma nota).
CRIAR = {
    'receba_casos': {'titulo': 'Receba — casos', 'interno': True},
    'Conteúdo @c4msg': {'titulo': 'Conteúdo @c4msg', 'interno': True},
}


def sql(query: str):
    """Roda SQL pela API de gestão do Supabase (curl, porque o SSL do python daqui implica)."""
    token = os.environ['SUPABASE_ACCESS_TOKEN']
    entrada = json.dumps({'query': query})
    saida = subprocess.run(
        ['curl', '-s', '-X', 'POST', API, '-H', f'Authorization: Bearer {token}',
         '-H', 'Content-Type: application/json', '--data-binary', '@-'],
        input=entrada, capture_output=True, text=True, check=True,
    ).stdout
    try:
        resposta = json.loads(saida)
    except json.JSONDecodeError:
        raise SystemExit(f'Resposta estranha do banco: {saida[:400]}')
    if isinstance(resposta, dict) and resposta.get('message'):
        raise SystemExit(f'Erro no banco: {resposta["message"]}\nSQL: {query[:300]}')
    return resposta


def txt(valor) -> str:
    """Literal SQL, tratando os 'None' que o export grava como string."""
    if valor is None or valor == 'None' or valor == '':
        return 'null'
    return "'" + str(valor).replace("'", "''") + "'"


def normalizar(s: str) -> str:
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


def data_iso(valor) -> str:
    """O export traz timestamp; due_date aqui é date."""
    if not valor or valor == 'None':
        return 'null'
    return txt(str(valor)[:10])


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    base = Path(sys.argv[1])
    bruto = base / 'dados-brutos'
    valendo = '--valendo' in sys.argv

    ler = lambda nome: json.loads((bruto / f'{nome}.json').read_text())
    tarefas_simbos = ler('tasks')
    projetos_simbos = ler('projects')
    relacoes = ler('entity_relations')
    comentarios = ler('task_comments')
    notas = ler('notes')
    usuarios = {u['id']: u['name'] for u in ler('users')}

    projeto_da_tarefa = {r['source_id']: r['target_id'] for r in relacoes
                         if r['source_type'] == 'task' and r['target_type'] == 'project'}
    pessoa_da_tarefa = {r['source_id']: r['target_id'] for r in relacoes
                        if r['source_type'] == 'task' and r['target_type'] == 'note' and r['relation_type'] == 'assigned_to'}
    projeto_da_nota = {r['source_id']: r['target_id'] for r in relacoes
                       if r['source_type'] == 'note' and r['target_type'] == 'project'}
    nome_da_nota = {n['id']: n['title'] for n in notas}
    projeto_simbos = {p['id']: p for p in projetos_simbos}

    # ── o que já existe aqui ────────────────────────────────────────────────
    engs = sql("select id, title, simbos_project_id, organization_id from public.engagements")
    tarefas_locais = sql("select id, simbos_task_id, title, engagement_id, sort from public.project_tasks")
    ja_notas = {r['origem_id'] for r in sql("select origem_id from public.notes where origem_id is not null")}
    ja_comentarios = {r['origem_id'] for r in sql("select origem_id from public.task_comments where origem_id is not null")}

    por_simbos_proj = {e['simbos_project_id']: e['id'] for e in engs if e['simbos_project_id']}
    local_por_simbos_task = {t['simbos_task_id']: t['id'] for t in tarefas_locais if t['simbos_task_id']}
    titulos_locais = {(t['engagement_id'], normalizar(t['title'])) for t in tarefas_locais}
    proximo_sort = {}
    for t in tarefas_locais:
        proximo_sort[t['engagement_id']] = max(proximo_sort.get(t['engagement_id'], -1), t['sort'] or 0)

    # ── projetos que ainda não existem aqui ─────────────────────────────────
    criados = []
    for p in projetos_simbos:
        if p['id'] in por_simbos_proj or p['name'] not in CRIAR:
            continue
        cfg = CRIAR[p['name']]
        arquivado = p['status'] != 'active'
        if valendo:
            org = sql(f"insert into public.organizations (name) values ({txt(cfg['titulo'])}) returning id")[0]['id']
            novo = sql(
                "insert into public.engagements (organization_id, type, status, lifecycle, title, is_internal, "
                f"simbos_project_id, archived_at, notes) values ({txt(org)}, 'pontual', 'aguardando', 'ativo', "
                f"{txt(cfg['titulo'])}, {str(cfg['interno']).lower()}, {txt(p['id'])}, "
                f"{'now()' if arquivado else 'null'}, {txt(p.get('description'))}) returning id"
            )[0]['id']
            por_simbos_proj[p['id']] = novo
        criados.append(cfg['titulo'])

    # ── tarefas ─────────────────────────────────────────────────────────────
    # Primeiro as de primeiro nível: a subtarefa precisa da mãe já com id daqui.
    entram = []
    for t in sorted(tarefas_simbos, key=lambda x: (x.get('parent_task_id') not in (None, 'None'), x['created_at'])):
        if t['id'] in local_por_simbos_task:
            continue
        engagement = por_simbos_proj.get(projeto_da_tarefa.get(t['id']))
        if not engagement:
            continue  # projeto vazio que não virou projeto aqui
        if (engagement, normalizar(t['title'])) in titulos_locais:
            continue  # veio antes pela sincronização, com outro id
        entram.append((t, engagement))

    inseridas = 0
    for t, engagement in entram:
        pai = t.get('parent_task_id')
        pai_local = local_por_simbos_task.get(pai) if pai and pai != 'None' else None
        responsavel = nome_da_nota.get(pessoa_da_tarefa.get(t['id']), RESPONSAVEL_PADRAO)
        status = STATUS.get(t['status'], 'a_fazer')
        proximo_sort[engagement] = proximo_sort.get(engagement, -1) + 1

        if valendo:
            novo = sql(
                "insert into public.project_tasks (engagement_id, parent_task_id, title, notes, status, priority, "
                "due_date, assignee, sort, simbos_task_id, created_at, done_at) values ("
                f"{txt(engagement)}, {txt(pai_local)}, {txt(t['title'][:300])}, {txt(t.get('description'))}, "
                f"{txt(status)}, {txt(PRIORIDADE.get(t['priority'], 'media'))}, {data_iso(t.get('due_date'))}, "
                f"{txt(responsavel)}, {proximo_sort[engagement]}, {txt(t['id'])}, {txt(t['created_at'])}, "
                f"{txt(t['updated_at']) if status == 'feito' else 'null'}) returning id"
            )[0]['id']
            local_por_simbos_task[t['id']] = novo
        inseridas += 1

    # ── comentários ─────────────────────────────────────────────────────────
    comentarios_entram = [
        c for c in comentarios
        if c['id'] not in ja_comentarios and local_por_simbos_task.get(c['task_id'])
    ]
    for c in comentarios_entram:
        if valendo:
            sql(
                "insert into public.task_comments (task_id, author, content, created_at, origem, origem_id) values ("
                f"{txt(local_por_simbos_task[c['task_id']])}, {txt(usuarios.get(c['author_user_id']))}, "
                f"{txt(c['content'])}, {txt(c['created_at'])}, 'simbos', {txt(c['id'])})"
            )

    # ── notas ───────────────────────────────────────────────────────────────
    def especie(tags: str) -> str:
        t = tags or ''
        if 'person' in t:
            return 'pessoa'
        if 'learning' in t:
            return 'aprendizado'
        if 'resource' in t:
            return 'recurso'
        return 'nota'

    notas_entram = [n for n in notas if n['id'] not in ja_notas]
    for n in notas_entram:
        engagement = por_simbos_proj.get(projeto_da_nota.get(n['id']))
        try:
            tags = [str(x) for x in eval(n.get('tags') or '[]')]  # o export grava lista em repr do python
        except Exception:
            tags = []
        arranjo = 'array[' + ','.join(txt(x) for x in tags) + ']::text[]' if tags else "'{}'::text[]"
        if valendo:
            sql(
                "insert into public.notes (engagement_id, title, content, tags, kind, created_at, updated_at, "
                "origem, origem_id) values ("
                f"{txt(engagement)}, {txt(n['title'])}, {txt(n.get('content'))}, {arranjo}, "
                f"{txt(especie(n.get('tags')))}, {txt(n['created_at'])}, {txt(n['updated_at'])}, 'simbos', {txt(n['id'])})"
            )

    print(f"{'IMPORTADO' if valendo else 'SIMULAÇÃO'}:")
    print(f"  projetos criados:    {len(criados)} {criados}")
    print(f"  tarefas inseridas:   {inseridas} (de {len(tarefas_simbos)} no export)")
    print(f"  comentários:         {len(comentarios_entram)} (de {len(comentarios)})")
    print(f"  notas:               {len(notas_entram)} (de {len(notas)})")
    if not valendo:
        print('\nRode de novo com --valendo para gravar.')


if __name__ == '__main__':
    main()
