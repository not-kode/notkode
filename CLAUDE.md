# Notkode — instruções do repositório

## Criar task no sistema ao trabalhar aqui (OBRIGATÓRIO)

Sempre que iniciar um trabalho substantivo neste repositório (uma frente/iniciativa, uma investigação, uma implementação com várias etapas), **crie uma task no sistema da Notkode** para não perder contexto entre sessões. O sistema é a fonte da verdade das tarefas; o SimbOS não é mais usado para isso.

Use o servidor MCP `notkode` (ferramentas `criar_tarefa`, `listar_tarefas`, `atualizar_tarefa`, `concluir_tarefas`, `panorama`, `detalhar_projeto`):

- Projeto: **Notkode — sistema e site** (basta passar `projeto: "Notkode"`).
- A tarefa já nasce com a Camila Gregório como responsável.
- Preencha a `descricao` com o contexto real do que foi alinhado (decisões, arquivos, próximos passos), não só o título.
- Não crie task para pedidos triviais/one-off (uma dúvida, um comando rápido, um ajuste de uma linha). Use bom senso: se o trabalho tem contexto que valeria retomar depois, cria; se é descartável, não.
- Ao terminar uma task, mova para `revisao` (nunca `feito` — só a Camila marca como concluída).

O mesmo MCP serve para o resto do CRM (contratos, cronograma, recebíveis, funil, briefings). O código dele está em `src/lib/mcp/` e a rota em `src/app/api/mcp/route.ts`.

O servidor vem do `.mcp.json` deste repositório, então ele existe em qualquer lugar onde o repositório for aberto: terminal, Claude Code no navegador, na máquina de qualquer um da equipe. Ninguém copia token: na primeira chamada o servidor responde 401 dizendo onde autenticar, o navegador abre no login do /admin e a pessoa libera o acesso numa tela. O token nasce no nome dela, e é esse nome que carimba tarefa e comentário. Quem preferir pode gerar um token à mão em /admin/usuarios. O `MCP_TOKEN` do ambiente continua valendo como chave geral da casa, sem nome atrelado.

## Onde este projeto mora (e o que NÃO é dele)

A infraestrutura da Notkode é só esta:

- **Supabase**: projeto `qaftinthgdrnvifordho`, acessado pelo MCP `supabase-notkode`. Se ele não conectar, o mesmo `SUPABASE_ACCESS_TOKEN` está na config do MCP em `~/.claude.json` e serve para rodar SQL e migração pela Management API (`POST https://api.supabase.com/v1/projects/qaftinthgdrnvifordho/database/query`). Atenção: o Cloudflare de lá barra o user-agent do `urllib` do Python com 403 "error code: 1010"; com `curl` passa.
- **Vercel**: projeto `notkode/notkode`, deploy automático no push para a `main`. O `VERCEL_TOKEN` está no `.env.local`, usado como variável de ambiente e nunca na flag `--token`.
- **GitHub**: `not-kode/notkode`.

**Qualquer outra conta que apareça nesta máquina é de outro cliente e não se toca.** Em particular, o CLI `npx supabase` e o MCP `claude.ai Supabase` estão logados na conta do **ipe.fiscal**, que é cliente da Camila em outro projeto: eles não enxergam o banco da Notkode, e um 403 vindo dali não significa "sem acesso", significa "conta errada". Nunca rodar migração, consulta ou deploy em backend que não seja o da Notkode; na dúvida sobre a qual projeto algo pertence, perguntar antes.
