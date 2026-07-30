# Notkode — instruções do repositório

## Criar task no sistema ao trabalhar aqui (OBRIGATÓRIO)

Sempre que iniciar um trabalho substantivo neste repositório (uma frente/iniciativa, uma investigação, uma implementação com várias etapas), **crie uma task no sistema da Notkode** para não perder contexto entre sessões. O sistema é a fonte da verdade das tarefas; o SimbOS não é mais usado para isso.

Use o servidor MCP `notkode` (ferramentas `criar_tarefa`, `listar_tarefas`, `atualizar_tarefa`, `concluir_tarefas`, `panorama`, `detalhar_projeto`):

- Projeto: **Notkode — sistema e site** (basta passar `projeto: "Notkode"`).
- A tarefa já nasce com a Camila Gregório como responsável.
- Preencha a `descricao` com o contexto real do que foi alinhado (decisões, arquivos, próximos passos), não só o título.
- Não crie task para pedidos triviais/one-off (uma dúvida, um comando rápido, um ajuste de uma linha). Use bom senso: se o trabalho tem contexto que valeria retomar depois, cria; se é descartável, não.
- Ao terminar uma task, mova para `revisao` (nunca `feito` — só a Camila marca como concluída).

O mesmo MCP serve para o resto do CRM (contratos, cronograma, recebíveis, funil, briefings). O código dele está em `src/lib/mcp/` e a rota em `src/app/api/mcp/route.ts`; a autenticação é o `MCP_TOKEN` do ambiente.
