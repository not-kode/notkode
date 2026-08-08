// ─────────────────────────────────────────────────────────────────────────
// Questionário de onboarding de cliente — definição versionada.
//
// Princípios de design:
//   • 1 pergunta = 1 dado (nada de perguntas empacotadas).
//   • Tipo certo por dado (Sim/Não, chips, texto curto, área).
//   • Ordem lógica (ex.: o formato de venda vem ANTES do preço).
//   • Condicionais: perguntas que só aparecem quando fazem sentido (showIf).
//
// As respostas são gravadas em onboarding_briefings.respostas (jsonb),
// chaveadas por `id`. Trocar/adicionar pergunta = editar este arquivo e
// subir a versão; o banco não muda (mesma tabela serve todo cliente).
//
// ⭐ star = essencial para destravar a configuração do dia 10 (uso interno;
//    não é exibido ao cliente — serve para ordenar/priorizar no backend).
// ─────────────────────────────────────────────────────────────────────────

export const ONBOARDING_VERSION = 'v1';

/**
 * Chave de controle dentro de `respostas`: lista dos ids que já chegaram
 * preenchidos pela Notkode, para o cliente conferir em vez de digitar.
 * Mora no mesmo jsonb (nenhuma coluna nova) e não é uma pergunta, então
 * quem percorre o questionário por id nunca esbarra nela.
 */
export const PREFILL_KEY = '__prefill';

/** Ids pré-preenchidos gravados no briefing. */
export function prefilledIds(answers: Record<string, string | string[]>): string[] {
  const v = answers[PREFILL_KEY];
  return Array.isArray(v) ? v : [];
}

/** Todos os ids de pergunta de um template (valida o que o MCP manda pré-preencher). */
export function templateQuestionIds(template: OnboardingTemplate): Set<string> {
  return new Set(template.sections.flatMap((s) => s.questions.map((q) => q.id)));
}

export type QuestionType = 'text' | 'area' | 'chips' | 'file';

/** Mostra a pergunta só quando a resposta de `q` estiver entre `in`. */
export type ShowIf = { q: string; in: string[] };

export type OnboardingQuestion = {
  /** Chave estável usada em respostas[id]. Nunca reutilizar/renomear. */
  id: string;
  label: string;
  hint?: string;
  type: QuestionType;
  /** Placeholder do campo (text/area). */
  ph?: string;
  /** Opções (type: 'chips'). */
  options?: string[];
  /** Permite marcar mais de uma opção (chips). */
  multi?: boolean;
  /** Condicional: só renderiza quando a dependência for satisfeita. */
  showIf?: ShowIf;
  /** Essencial para o start do dia 10 (uso interno). */
  star?: boolean;
};

export type OnboardingSection = {
  id: string;
  title: string;
  lede: string;
  /** Renderiza a caixa de instrução de acessos no topo da seção. */
  access?: boolean;
  questions: OnboardingQuestion[];
};

export const ACCESS_INSTRUCTION =
  'Em cada plataforma, convide camila@notkode.com.br com o maior nível de acesso ' +
  'disponível (administrador/proprietário) — nunca compartilhe senha. ' +
  'Se a conta ainda não existir, crie-a e depois nos convide.';

export const ACCESS_EMAIL = 'camila@notkode.com.br';

export const ONBOARDING_SECTIONS: OnboardingSection[] = [
  // ── 1. Produto & Operação ──────────────────────────────────────────────
  {
    id: 'produto',
    title: 'Produto & Operação',
    lede: 'O essencial sobre o que vendemos e como ele chega ao cliente.',
    questions: [
      { id: 'produto_oque', type: 'area',
        label: 'O que é o produto e qual problema ele resolve?' },
      { id: 'modelo_venda', type: 'chips', multi: true,
        options: ['Unidade', 'Kit', 'Assinatura/recorrência'],
        label: 'Como o produto é vendido?' },
      { id: 'preco_venda', type: 'area', ph: 'Ex: 1 un R$ 149 · kit 3 R$ 390 · plano R$ 99/mês',
        label: 'Qual é o preço de venda?',
        hint: 'De cada versão, kit ou plano, se houver mais de um.' },
      { id: 'custo_unidade', type: 'text', ph: 'R$ ...',
        label: 'Qual é o seu custo por unidade (produção ou aquisição)?' },
      { id: 'entrega', type: 'area', ph: 'Ex: Correios, 5–7 dias úteis',
        label: 'Como funciona a entrega e qual o prazo médio ao cliente?' },
      { id: 'entrega_abrangencia', type: 'chips', options: ['Brasil todo', 'Só minha região', 'Outra'],
        label: 'Qual a abrangência da entrega?' },
    ],
  },

  // ── 2. Cliente & Mercado ───────────────────────────────────────────────
  {
    id: 'cliente-mercado',
    title: 'Cliente & Mercado',
    lede: 'Para quem vendemos, onde encontrá-los e contra quem competimos. Quanto mais preciso aqui, melhor a segmentação dos anúncios.',
    questions: [
      { id: 'tem_estudo', type: 'chips', options: ['Sim, tenho', 'Não tenho'],
        label: 'Você já tem algum estudo do seu público?',
        hint: 'Pesquisa, ICP, persona, planilha de vendas ou qualquer material sobre quem compra.' },
      { id: 'estudo_anexo', type: 'file', showIf: { q: 'tem_estudo', in: ['Sim, tenho'] },
        label: 'Anexe o estudo.', hint: 'PDF, planilha, apresentação, documento.' },
      { id: 'estudo_link', type: 'text', ph: 'https:// (Drive, Notion, PDF...)',
        showIf: { q: 'tem_estudo', in: ['Sim, tenho'] },
        label: '…ou cole o link do material.' },

      { id: 'cliente_idade', type: 'chips', multi: true,
        options: ['18–24', '25–34', '35–44', '45–54', '55+'],
        label: 'Qual a faixa etária do cliente ideal?',
        hint: 'Marque as principais.' },
      { id: 'cliente_genero', type: 'chips',
        options: ['Majoritariamente mulheres', 'Majoritariamente homens', 'Ambos'],
        label: 'Predominância de gênero?' },
      { id: 'cliente_regiao', type: 'chips', multi: true,
        options: ['Brasil todo', 'Sudeste', 'Sul', 'Nordeste', 'Norte', 'Centro-Oeste'],
        label: 'Em qual região está o público?' },
      { id: 'cliente_perfil', type: 'area',
        ph: 'Ex: mães de primeira viagem, preocupadas com saúde, que compram por indicação e valorizam praticidade...',
        label: 'Descreva o perfil desse cliente.',
        hint: 'Momento de vida, interesses, o que ele valoriza e como costuma comprar.' },
      { id: 'cliente_nao', type: 'text', ph: 'Ex: quem busca só o mais barato',
        label: 'E quem NÃO é seu cliente?' },

      { id: 'dor_desejo', type: 'area',
        label: 'Qual a principal dor ou desejo que leva a pessoa a comprar?' },
      { id: 'onde_publico', type: 'area', ph: '@perfis, páginas, grupos, comunidades, canais...',
        label: 'Onde esse público passa o tempo?',
        hint: 'Perfis, influencers, páginas ou grupos que ele já segue — é o que usamos pra segmentar os anúncios.' },
      { id: 'concorrentes', type: 'area', ph: '@concorrente1, @concorrente2 ...',
        label: 'Cite de 3 a 5 concorrentes (com @ ou link) e o que te diferencia deles.' },
    ],
  },

  // ── 3. Funil & Vendas ──────────────────────────────────────────────────
  // Esta seção é a que mais alimenta a estrutura do CRM: a jornada vira as
  // etapas do pipeline, a qualificação vira o score do contato, e as
  // objeções alimentam o atendimento por IA.
  {
    id: 'funil-vendas',
    title: 'Funil & Vendas',
    lede: 'Como a venda acontece do primeiro contato ao fechamento. É o que desenha o seu CRM. Como você é pré-lançamento, responda como você IMAGINA que vai funcionar.',
    questions: [
      { id: 'jornada_compra', type: 'area',
        ph: 'Ex: vê o anúncio → chama no WhatsApp → tira dúvidas → recebe link de pagamento → compra',
        label: 'Como você imagina o caminho do cliente, do primeiro contato até a compra?',
        hint: 'Descreva os passos — eles viram as etapas do seu funil no CRM.' },
      { id: 'destino_lead', type: 'chips', multi: true,
        options: ['WhatsApp', 'Checkout', 'DM', 'Formulário'],
        label: 'Para onde o lead deve ser direcionado?',
        hint: 'Checkout = venda direta; WhatsApp/DM = conversa antes do fechamento.' },
      { id: 'checkout_onde', type: 'chips',
        options: ['Loja própria / site', 'Kiwify', 'Hotmart', 'Link de pagamento', 'WhatsApp / manual', 'Ainda definir'],
        label: 'Onde a venda é fechada (checkout/pagamento)?' },
      { id: 'lead_qualificado', type: 'text', ph: 'Ex: já tentou outras soluções, tem urgência, orçamento...',
        label: 'O que faz um contato ser um bom lead pra você?' },
      { id: 'objecoes', type: 'area',
        label: 'Quais dúvidas ou objeções mais aparecem antes de comprar?',
        hint: 'Alimenta o atendimento por IA e os argumentos dos anúncios.' },
      { id: 'atendimento_tipo', type: 'chips',
        options: ['100% por IA', 'IA + humano', '100% humano'],
        label: 'Como será o atendimento?' },
      { id: 'atendimento_detalhe', type: 'text', ph: 'Ex: Maria · seg–sex, 9h–18h',
        showIf: { q: 'atendimento_tipo', in: ['IA + humano', '100% humano'] },
        label: 'Quem faz o atendimento humano e em qual horário?' },
    ],
  },

  // ── 4. Metas & Investimento ────────────────────────────────────────────
  {
    id: 'metas-investimento',
    title: 'Metas & Investimento',
    lede: 'O objetivo de vendas, a recorrência e a verba de mídia.',
    questions: [
      { id: 'meta_vendas', type: 'text', ph: 'Ex: 100 vendas/mês em 90 dias',
        label: 'Quantas vendas por mês você quer atingir — e em quanto tempo?' },
      { id: 'recompra', type: 'chips', options: ['Sim, recorrente', 'Às vezes', 'Não / compra única'],
        label: 'O cliente costuma recomprar?' },
      { id: 'recompra_freq', type: 'text', ph: 'Ex: a cada 30 dias',
        showIf: { q: 'recompra', in: ['Sim, recorrente', 'Às vezes'] },
        label: 'Com que frequência ele recompra?' },
      { id: 'follow_up', type: 'chips', multi: true,
        options: ['Remarketing (anúncios)', 'WhatsApp', 'E-mail', 'Ligação', 'Nada ainda'],
        label: 'Quem demonstra interesse e não compra — o que fazer com ele?',
        hint: 'Vira as automações de acompanhamento no CRM.' },
      { id: 'orcamento_ads', type: 'text', ph: 'R$ / mês',
        label: 'Qual o orçamento mensal disponível para anúncios?',
        hint: 'Verba de mídia, separada da nossa prestação de serviço.' },
    ],
  },

  // ── 5. Marca & Materiais ───────────────────────────────────────────────
  {
    id: 'marca',
    title: 'Marca & Materiais',
    lede: 'O que já existe pra montar a landing page e os criativos.',
    questions: [
      { id: 'tem_identidade', type: 'chips', options: ['Sim, completa', 'Parcial', 'Não tenho'],
        label: 'Você tem identidade visual (logo, cores, fontes)?' },
      { id: 'link_materiais', type: 'text', ph: 'Link do Drive / Dropbox / pasta',
        showIf: { q: 'tem_identidade', in: ['Sim, completa', 'Parcial'] },
        label: 'Compartilhe o link da pasta de materiais.' },
      { id: 'tem_fotos', type: 'chips', options: ['Sim, prontos', 'Alguns', 'Ainda não'],
        label: 'Tem fotos e vídeos reais do produto em uso?' },
    ],
  },

  // ── 6. Acessos ─────────────────────────────────────────────────────────
  {
    id: 'acessos',
    title: 'Acessos',
    lede: 'Siga a instrução acima: convide o e-mail da Notkode como administrador. Se a conta ainda não existir, crie-a e depois nos convide.',
    access: true,
    questions: [
      { id: 'acesso_meta', type: 'chips',
        options: ['Convite enviado', 'Ainda não tenho'],
        label: 'Meta Business (Instagram/Facebook da marca)' },
      { id: 'acesso_google', type: 'chips',
        options: ['Convite enviado', 'Ainda não tenho'],
        label: 'Google Ads' },
      { id: 'acesso_google_id', type: 'text', ph: '000-000-0000',
        showIf: { q: 'acesso_google', in: ['Convite enviado'] },
        label: 'Informe o ID da conta Google Ads.' },
      { id: 'acesso_analytics', type: 'chips',
        options: ['Já tenho, convidei', 'Não tenho ainda'],
        label: 'GA4 / GTM / Pixel da Meta já existem?' },
      { id: 'acesso_dominio', type: 'text', ph: 'Ex: Registro.br, GoDaddy...',
        label: 'Onde o domínio está registrado (e você consegue dar acesso ao DNS)?' },
      { id: 'site_atual', type: 'chips', options: ['Sim', 'Não'],
        label: 'Já tem algum site ou página no ar?' },
      { id: 'site_url', type: 'text', ph: 'https://',
        showIf: { q: 'site_atual', in: ['Sim'] },
        label: 'Qual a URL?' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Templates de briefing por tipo de serviço. O ONBOARDING_SECTIONS acima é
// o briefing completo de PRODUTO/E-COMMERCE (v1); os demais reaproveitam
// seções comuns (marca, acessos) e têm perguntas próprias.
// ─────────────────────────────────────────────────────────────────────────

/** Acessos enxutos para serviços que não envolvem mídia paga/e-commerce. */
const ACESSOS_BASICOS: OnboardingSection = {
  id: 'acessos-basicos',
  title: 'Acessos & Materiais',
  lede: 'Siga a instrução acima: convide o e-mail da Notkode como administrador. Se a conta ainda não existir, crie-a e depois nos convide.',
  access: true,
  questions: [
    { id: 'acesso_dominio', type: 'text', ph: 'Ex: Registro.br, GoDaddy...',
      label: 'Onde o domínio está registrado (e você consegue dar acesso ao DNS)?' },
    { id: 'site_atual', type: 'chips', options: ['Sim', 'Não'],
      label: 'Já tem algum site ou página no ar?' },
    { id: 'site_url', type: 'text', ph: 'https://',
      showIf: { q: 'site_atual', in: ['Sim'] },
      label: 'Qual a URL?' },
    { id: 'link_materiais', type: 'text', ph: 'Link do Drive / Dropbox / pasta',
      label: 'Link da pasta com materiais da marca (se existir).' },
  ],
};

/**
 * Site institucional.
 *
 * A redação é da Notkode: o cliente não escreve o site, ele conta o que a gente
 * não tem como saber. Por isso aqui não se pergunta se os textos existem, nem
 * quais sites ele admira — nenhuma das duas coisas vira entrega, e perguntar
 * abre espaço para ele achar que precisa produzir conteúdo.
 *
 * O que a gente precisa mesmo é matéria-prima: como cada serviço funciona por
 * dentro, quem já é cliente, quais projetos podem ser contados e as fotos
 * disso. É essa a ordem das seções.
 */
const SITE_SECTIONS: OnboardingSection[] = [
  {
    id: 'empresa',
    title: 'A empresa',
    lede: 'O básico que a gente precisa saber para escrever sobre vocês sem inventar nada.',
    questions: [
      { id: 'emp_oque', type: 'area', star: true,
        ph: 'Ex: fazemos estudos ambientais para obras de infraestrutura...',
        label: 'O que a empresa faz e para quem?' },
      { id: 'emp_historia', type: 'area',
        ph: 'Quando começou, como chegou até aqui, o que mudou no caminho',
        label: 'Conte um pouco da história da empresa.' },
      { id: 'emp_regiao', type: 'text', ph: 'Ex: DF, GO, MG e projetos pontuais em outros estados',
        label: 'Onde vocês atuam?' },
      { id: 'emp_equipe', type: 'area', star: true,
        ph: 'Nome, formação e registro profissional de cada um',
        label: 'Quem é a equipe técnica?',
        hint: 'Entra na página como prova de que existe gente qualificada por trás.' },
      { id: 'emp_registros', type: 'area', ph: 'Ex: CREA, CTF/IBAMA, cadastros em órgãos ambientais',
        label: 'Quais registros e certificações a empresa tem?' },
      { id: 'emp_diferencial', type: 'area',
        label: 'Por que um cliente escolhe vocês e não o concorrente?' },
      { id: 'emp_quem_contrata', type: 'area',
        ph: 'Ex: construtoras e mineradoras; quem decide costuma ser o gerente ambiental',
        label: 'Quem costuma contratar vocês, e quem decide a contratação?' },
    ],
  },
  {
    id: 'servicos',
    title: 'Serviços',
    lede: 'Cada serviço vira uma página, então é aqui que a gente precisa de detalhe.',
    questions: [
      { id: 'serv_areas', type: 'area', star: true,
        ph: 'Uma por linha',
        label: 'Quais áreas de atuação viram página no site?' },
      { id: 'serv_como_funciona', type: 'area', star: true,
        ph: 'Ex: o EIA/RIMA entra na fase de licença prévia, é exigido pelo IBAMA ou órgão estadual, leva de 6 a 12 meses e entrega...',
        label: 'Explique como funciona cada área: o que é entregue, em que fase entra e qual órgão está envolvido.',
        hint: 'Pode escrever solto, do seu jeito. Quanto mais detalhe técnico, melhor fica o texto da página, e nada aqui vai para o ar sem você aprovar.' },
      { id: 'serv_procurados', type: 'area',
        label: 'Quais serviços mais trazem cliente hoje?' },
      { id: 'serv_duvidas', type: 'area',
        ph: 'Ex: quanto tempo demora, se acompanha a vistoria, se responde exigência do órgão',
        label: 'O que o cliente sempre pergunta antes de fechar?' },
      { id: 'serv_arquivos', type: 'file',
        label: 'Se tiver material técnico que ajude a explicar os serviços, anexe aqui.',
        hint: 'Apresentação, portfólio, proposta antiga: qualquer coisa que já descreva o trabalho.' },
    ],
  },
  {
    id: 'provas',
    title: 'Projetos & Clientes',
    lede: 'O que já foi feito é o melhor argumento de venda, e é o que costuma faltar no site.',
    questions: [
      { id: 'prova_projetos', type: 'area', star: true,
        ph: 'Um por linha: cliente, o que foi feito, onde e quando',
        label: 'Quais projetos executados podemos contar no site?' },
      { id: 'prova_fotos', type: 'file', star: true,
        label: 'Anexe fotos dos projetos.',
        hint: 'Foto de campo, equipe em obra, o empreendimento. Pode mandar várias, mesmo sem tratamento.' },
      { id: 'prova_videos', type: 'file',
        label: 'Se tiver vídeos, anexe também.' },
      { id: 'prova_clientes', type: 'area',
        ph: 'Um por linha',
        label: 'Quais clientes podemos citar pelo nome no site?',
        hint: 'A ideia é montar uma faixa com os logos deles. Só entra quem você autorizar.' },
      { id: 'prova_logos', type: 'file',
        label: 'Se tiver os logos desses clientes em arquivo, anexe.' },
      { id: 'prova_depoimento', type: 'chips', options: ['Sim', 'Não', 'Consigo pedir'],
        label: 'Quer colocar depoimento de cliente no site?' },
      { id: 'prova_depoimento_texto', type: 'area',
        showIf: { q: 'prova_depoimento', in: ['Sim'] },
        ph: 'Texto do depoimento, nome e cargo de quem falou',
        label: 'Cole os depoimentos que você já tem.' },
    ],
  },
  {
    id: 'contato-site',
    title: 'Contato',
    lede: 'Para onde vai quem pede orçamento pelo site.',
    questions: [
      { id: 'contato_campos', type: 'area', star: true,
        ph: 'Ex: empreendimento, fase do licenciamento, órgão e prazo',
        label: 'O que o formulário do site precisa perguntar?' },
      { id: 'contato_destino', type: 'text', ph: 'E-mail que recebe os pedidos',
        label: 'Para qual e-mail os pedidos devem chegar?' },
      { id: 'contato_whatsapp', type: 'text', ph: '(00) 00000-0000',
        label: 'Qual WhatsApp fica no site?' },
      { id: 'contato_endereco', type: 'text',
        label: 'Qual endereço aparece no site e na ficha do Google?' },
    ],
  },
  {
    id: 'acessos-site',
    title: 'Acessos & Materiais',
    lede: 'O que a gente precisa liberar para publicar o site no endereço de vocês.',
    access: true,
    questions: [
      { id: 'acesso_dominio', type: 'text', star: true, ph: 'Ex: Registro.br, GoDaddy, Locaweb...',
        label: 'Onde o domínio está registrado?',
        hint: 'Precisamos do acesso ao painel do domínio para apontar o site quando ele estiver pronto. Só isso, o resto da hospedagem já está com a gente.' },
      { id: 'acesso_dominio_status', type: 'chips',
        options: ['Já enviei o acesso', 'Não sei onde está', 'Prefiro fazer junto numa call'],
        label: 'Consegue liberar esse acesso?' },
      { id: 'acesso_google_negocio', type: 'chips',
        options: ['Sim, já existe', 'Não existe', 'Não sei'],
        label: 'A empresa já tem ficha no Google (aquele quadro que aparece na busca)?' },
      { id: 'logo_arquivo', type: 'file',
        label: 'Anexe o logo da empresa no melhor arquivo que tiver.',
        hint: 'De preferência PNG com fundo transparente, SVG, ou o arquivo original de quem criou.' },
    ],
  },
];

const SISTEMA_SECTIONS: OnboardingSection[] = [
  {
    id: 'operacao',
    title: 'Operação hoje',
    lede: 'Como o processo funciona hoje, antes do sistema existir.',
    questions: [
      { id: 'sis_processo', type: 'area',
        ph: 'Ex: pedido chega no WhatsApp → anoto na planilha → gero cobrança...',
        label: 'Descreva passo a passo o processo que o sistema vai cobrir.' },
      { id: 'sis_ferramentas', type: 'area', ph: 'Planilhas, CRM, ERP, WhatsApp, papel...',
        label: 'Quais ferramentas você usa nesse processo hoje?' },
      { id: 'sis_dor', type: 'area',
        label: 'Qual é a maior dor desse processo hoje?' },
      { id: 'sis_usuarios', type: 'text', ph: 'Ex: eu + 2 vendedores + 1 financeiro',
        label: 'Quem vai usar o sistema (quantas pessoas e funções)?' },
      { id: 'sis_volume', type: 'text', ph: 'Ex: 200 pedidos/mês, 80 clientes ativos',
        label: 'Qual o volume mensal da operação?' },
    ],
  },
  {
    id: 'funcionalidades',
    title: 'Funcionalidades',
    lede: 'O que o sistema precisa fazer no dia 1 (dá pra crescer depois).',
    questions: [
      { id: 'sis_modulos', type: 'chips', multi: true,
        options: ['Clientes (CRM)', 'Vendas/Pedidos', 'Financeiro', 'Agenda', 'Estoque', 'Relatórios', 'WhatsApp', 'Outro'],
        label: 'Quais módulos são essenciais?' },
      { id: 'sis_fluxo_critico', type: 'area',
        label: 'Qual é o fluxo mais importante? Descreva do início ao fim.' },
      { id: 'sis_integracoes', type: 'area', ph: 'Ex: gateway de pagamento, Bling, Google Agenda...',
        label: 'Com quais sistemas ele precisa se integrar?' },
      { id: 'sis_ia', type: 'area', ph: 'Ex: responder clientes, resumir conversas, prever estoque...',
        label: 'Onde você imagina a IA ajudando?' },
      { id: 'sis_dados', type: 'chips', multi: true,
        options: ['Planilha', 'Sistema antigo', 'Papel', 'Começando do zero'],
        label: 'Onde estão os dados de hoje?' },
      { id: 'sis_dados_anexo', type: 'file',
        showIf: { q: 'sis_dados', in: ['Planilha', 'Sistema antigo'] },
        label: 'Anexe uma amostra dos dados (planilha ou export).' },
    ],
  },
  ACESSOS_BASICOS,
];

const AGENTES_SECTIONS: OnboardingSection[] = [
  {
    id: 'atendimento',
    title: 'Atendimento & Rotinas',
    lede: 'Como o atendimento e as tarefas repetitivas funcionam hoje.',
    questions: [
      { id: 'ag_canais', type: 'chips', multi: true,
        options: ['WhatsApp', 'Instagram', 'E-mail', 'Telefone', 'Site'],
        label: 'Por onde os clientes falam com você?' },
      { id: 'ag_volume', type: 'text', ph: 'Ex: 50 conversas/dia',
        label: 'Qual o volume de mensagens ou atendimentos?' },
      { id: 'ag_equipe', type: 'text', ph: 'Ex: 2 atendentes, seg–sáb 8h–18h',
        label: 'Quem atende hoje e em qual horário?' },
      { id: 'ag_faq', type: 'area',
        label: 'Quais são as perguntas mais frequentes dos clientes?' },
      { id: 'ag_repetitivo', type: 'area', ph: 'Ex: cobrar boleto, confirmar agendamento, lançar pedido...',
        label: 'Quais tarefas repetitivas o time faz manualmente?' },
      { id: 'ag_tom', type: 'chips', options: ['Descontraído', 'Neutro', 'Formal'],
        label: 'Qual o tom de voz do atendimento?' },
      { id: 'ag_humano', type: 'area', ph: 'Ex: negociação de valores, reclamação...',
        label: 'Em quais situações o agente deve passar pra um humano?' },
      { id: 'ag_ferramentas', type: 'area', ph: 'CRM, agenda, gateway, planilha...',
        label: 'Quais ferramentas o agente precisa consultar ou mexer?' },
    ],
  },
  ACESSOS_BASICOS,
];

const IDENTIDADE_SECTIONS: OnboardingSection[] = [
  {
    id: 'marca-hoje',
    title: 'A marca',
    lede: 'De onde a marca vem e pra onde ela vai.',
    questions: [
      { id: 'id_logo', type: 'chips',
        options: ['Tenho e quero manter', 'Tenho mas quero refazer', 'Não tenho'],
        label: 'Como está o logo hoje?' },
      { id: 'id_historia', type: 'area',
        label: 'Conte a história e o propósito da marca.' },
      { id: 'id_personalidade', type: 'chips', multi: true,
        options: ['Séria', 'Jovem', 'Sofisticada', 'Acessível', 'Tech', 'Artesanal', 'Divertida'],
        label: 'Qual a personalidade da marca?' },
      { id: 'id_cores_gosta', type: 'text',
        label: 'Cores que você gosta (ou que já usa)?' },
      { id: 'id_cores_evita', type: 'text',
        label: 'Cores que NÃO quer de jeito nenhum?' },
      { id: 'id_referencias', type: 'area', ph: '@marcas ou links + o que admira em cada uma',
        label: 'Quais marcas você admira visualmente e por quê?' },
      { id: 'id_aplicacoes', type: 'chips', multi: true,
        options: ['Instagram', 'Site', 'Embalagem', 'Uniforme', 'Papelaria', 'Fachada/placa'],
        label: 'Onde a identidade vai ser aplicada?' },
      { id: 'id_materiais', type: 'file',
        label: 'Anexe o que já existe (logo atual, fotos, artes).' },
    ],
  },
];

// ── Social media ──────────────────────────────────────────────────────────
// Coleta comercial de quem contrata conteúdo + criativo. A régua aqui é:
// só perguntamos o que depende do cliente. Perfil, fotos e histórico de
// campanha a gente já tem; oferta, preço e restrição só ele sabe.
const SOCIAL_SECTIONS: OnboardingSection[] = [
  {
    id: 'social-marca',
    title: 'Marca & público',
    lede: 'Quem é a marca e com quem ela fala nas redes.',
    questions: [
      { id: 'social_perfis', type: 'text', ph: '@ do Instagram e link da página no Facebook',
        label: 'Quais perfis vamos cuidar?' },
      { id: 'social_negocio', type: 'area',
        label: 'O que a marca vende e o que ela mais quer vender?' },
      { id: 'social_publico', type: 'area', ph: 'Ex: dono de obra pequena, pedreiro, síndico...',
        label: 'Quem é o cliente que você quer atrair?' },
      { id: 'social_regiao', type: 'text', ph: 'Ex: São Bernardo e região do ABC',
        label: 'Quais cidades ou bairros você atende?' },
      { id: 'social_tom', type: 'chips', options: ['Descontraído', 'Neutro', 'Técnico', 'Formal'],
        label: 'Qual o tom de voz da marca?' },
      { id: 'social_diferenciais', type: 'area',
        label: 'Por que o cliente compra de você e não do concorrente?' },
      { id: 'social_concorrentes', type: 'area', ph: '@perfis + o que você gosta ou não gosta em cada um',
        label: 'Quais perfis de concorrentes ou referências devemos acompanhar?' },
    ],
  },
  {
    id: 'social-oferta',
    title: 'Oferta & conteúdo do mês',
    lede: 'O conteúdo sai da sua oferta real, não do que a agência acha.',
    questions: [
      { id: 'social_ofertas', type: 'area', star: true,
        ph: 'Ex: persiana tela solar R$ 149,90/m² até 31/08',
        label: 'Quais produtos entram em promoção neste mês, com preço e validade?' },
      { id: 'social_destaques', type: 'area', star: true,
        ph: 'Estoque parado, mercadoria chegando, serviço que pouca gente sabe que existe...',
        label: 'O que você quer girar neste mês?' },
      { id: 'social_preco_publico', type: 'chips',
        options: ['Sim, pode divulgar', 'Só de alguns produtos', 'Não divulgar preço'],
        label: 'Podemos publicar preço nas artes?' },
      { id: 'social_condicoes', type: 'text', ph: 'Ex: 6x sem juros, 5% à vista, frete grátis na região',
        label: 'Quais condições de pagamento e frete podem aparecer nas artes?' },
      { id: 'social_restricoes', type: 'area', star: true,
        ph: 'Produto sem estoque, marca que proíbe divulgar preço, assunto que você não quer tocar...',
        label: 'O que NÃO pode ser anunciado?' },
      { id: 'social_datas', type: 'area',
        ph: 'Datas comemorativas, aniversário da loja, feriado local, evento, chegada de carga...',
        label: 'Quais datas deste mês devemos aproveitar?' },
    ],
  },
  {
    id: 'social-anuncios',
    title: 'Anúncios',
    // Destino, número de atendimento e quem opera a mídia são configuração
    // nossa, não pergunta de briefing. Aqui só o que a arte precisa dizer.
    lede: 'Os criativos de anúncio seguem fluxo próprio, separado do calendário de conteúdo.',
    questions: [
      { id: 'social_anuncios_produtos', type: 'area', star: true,
        ph: 'Produto, preço e condição de pagamento de cada anúncio',
        label: 'Quais produtos você quer anunciar neste mês?' },
      { id: 'social_anuncios_arte', type: 'area',
        ph: 'Ex: mostrar a persiana instalada, usar a foto do galpão, destacar o desconto à vista...',
        label: 'Tem alguma foto ou detalhe que precisa aparecer na arte desses anúncios?' },
    ],
  },
];

// ── Site com catálogo (B2B) ───────────────────────────────────────────────
// Indústria/distribuidora que não vende online: o site é catálogo + pedido de
// orçamento. O template "site" não serve aqui porque o que trava a produção
// não é objetivo nem referência visual, é insumo: a planilha de produtos, as
// fichas, as fotos, e as duas estruturas que só o cliente pode definir, os
// setores de atuação e quais produtos andam juntos.
//
// As categorias do catálogo entram pré-preenchidas pela Notkode (respostas do
// MCP) para o cliente só conferir, em vez de listar tudo de novo.
const CATALOGO_SECTIONS: OnboardingSection[] = [
  {
    id: 'cat-empresa',
    title: 'A empresa',
    lede: 'Esta parte é a que vira o texto do site. Responda como você contaria para alguém que nunca ouviu falar da empresa, sem se preocupar com formalidade.',
    questions: [
      { id: 'emp_historia', type: 'area', star: true,
        ph: 'Como começou, o que mudou desde então e do que vocês mais se orgulham hoje',
        label: 'Conte a história da empresa.' },
      { id: 'emp_fabrica_revende', type: 'chips',
        options: ['Fabricamos tudo', 'Fabricamos parte e revendemos o resto', 'Revendemos'],
        label: 'O que é fabricação de vocês e o que é revenda?',
        hint: 'Muda bastante o jeito de escrever o site.' },
      { id: 'emp_percepcao', type: 'chips', multi: true, star: true,
        options: [
          'Fábrica que entrega rápido',
          'Especialista técnico, que entende de norma e medida',
          'Quem tem o melhor preço',
          'Parceira de quem revende',
          'Empresa sólida, com anos de estrada',
          'Quem tem tudo no mesmo lugar, sem precisar procurar em três fornecedores',
        ],
        label: 'Quando a pessoa terminar de ver o site, como você quer que ela enxergue a empresa?',
        hint: 'Marque no máximo três. É o que a gente vai reforçar em cada página.' },
      { id: 'emp_percepcao_nao', type: 'text', ph: 'Ex: parecer uma loja de parafuso de bairro',
        label: 'E o que você NÃO quer que passe?' },
      { id: 'emp_elogio', type: 'text', ph: 'Ex: "vocês me atenderam no mesmo dia"',
        label: 'Qual é o elogio que vocês mais ouvem dos clientes?' },
      { id: 'emp_perde', type: 'text', ph: 'Ex: preço, prazo, o cliente achou mais barato...',
        label: 'Quando vocês perdem uma venda, normalmente é por quê?',
        hint: 'Serve para o site responder isso antes do cliente pensar nisso.' },
      { id: 'emp_site_falta', type: 'area', star: true,
        ph: 'Ex: não mostra que temos estoque próprio, não fala de quem já atendemos...',
        label: 'O site de hoje fala de prazo, qualidade e preço competitivo. O que falta lá que o cliente precisava saber?' },
      { id: 'emp_numeros', type: 'text', ph: 'Ex: 13 anos de mercado, 3 mil itens em linha',
        label: 'Tem algum número da empresa que valha destacar no site?' },
      { id: 'emp_regiao', type: 'text', ph: 'Ex: Brasil todo, com foco em SP e no ABC',
        label: 'Quais regiões vocês atendem?' },
      { id: 'emp_condicao_comercial', type: 'text', ph: 'Ex: pedido mínimo, venda só para CNPJ',
        label: 'Tem alguma regra de venda que o cliente precisa saber logo de cara?' },
    ],
  },
  {
    id: 'cat-contato',
    title: 'Contato',
    lede: 'Os dados que vão para o rodapé, a página de contato e os avisos do site.',
    questions: [
      { id: 'ct_razao_cnpj', type: 'text', ph: 'Razão social e CNPJ',
        label: 'Razão social e CNPJ da empresa.' },
      { id: 'ct_telefone', type: 'text', ph: '(00) 0000-0000',
        label: 'Telefone para contato no site.' },
      { id: 'ct_email', type: 'text', ph: 'contato@...',
        label: 'E-mail de contato que aparece no site.' },
      { id: 'ct_endereco', type: 'text', ph: 'Rua, número, bairro, cidade',
        label: 'Endereço da empresa.' },
      { id: 'ct_horario', type: 'text', ph: 'Ex: seg a sex, 8h às 18h',
        label: 'Horário de atendimento.' },
      { id: 'ct_email_revendedor', type: 'text', ph: 'comercial@...', star: true,
        label: 'Qual e-mail recebe os cadastros do formulário de revendedor?' },
    ],
  },
  {
    id: 'cat-publico',
    title: 'Quem compra',
    lede: 'Quanto mais concreto aqui, mais o texto do site vai falar a língua de quem lê. Pode responder do jeito que você falaria no balcão.',
    questions: [
      { id: 'pub_quem', type: 'chips', multi: true, star: true,
        options: [
          'Empresa de engenharia civil',
          'Empresa de engenharia elétrica',
          'Revendedor e distribuidor',
          'Loja de material de construção',
          'Loja de material elétrico',
          'Indústria',
          'Construtora e empreiteira',
        ],
        label: 'Quem procura vocês hoje?' },
      { id: 'pub_principal', type: 'text', ph: 'Ex: revendedor', star: true,
        label: 'Desses, quem traz mais faturamento?' },
      { id: 'pub_crescer', type: 'text', ph: 'Ex: revendedor', star: true,
        label: 'E qual deles vocês querem atrair mais com o site novo?' },
      { id: 'pub_compra', type: 'chips', multi: true,
        options: [
          'Compra por cento, no atacado',
          'Compra por lista de engenharia ou projeto',
          'Compra grande de obra, de vez em quando',
          'Compra para revender por unidade',
        ],
        label: 'Como é a compra desse cliente?' },
      { id: 'pub_decide', type: 'chips', multi: true, star: true,
        options: ['Preço', 'Prazo de entrega', 'Ter tudo no mesmo lugar', 'Qualidade e norma', 'Atendimento', 'Prazo de pagamento'],
        label: 'O que mais pesa na hora de ele escolher o fornecedor?' },
      { id: 'pub_duvidas', type: 'area', star: true,
        ph: 'Ex: "vocês têm pronta entrega?", "atende medida especial?", "qual o prazo?"',
        label: 'O que ele mais pergunta antes de fechar o pedido?' },
    ],
  },
  {
    id: 'cat-catalogo',
    title: 'Catálogo de produtos',
    lede: 'É o que mais demora a juntar e o que faz o prazo começar a contar. Cada campo de anexo aceita vários arquivos.',
    questions: [
      { id: 'cat_categorias', type: 'chips', multi: true, star: true,
        options: [
          'Abraçadeiras Metálicas', 'Eletrocalha e Acessórios', 'Perfilados e Acessórios',
          'Fitas Metálicas', 'Barra Roscada', 'Parafusos e Acessórios', 'Trilho DIN', 'Chumbadores',
        ],
        label: 'Confirme as categorias que vão para o site.',
        hint: 'Estas são as que identificamos no catálogo de vocês. Desmarque o que não entra.' },
      { id: 'cat_categorias_extra', type: 'text', ph: 'Ex: eletrodutos',
        label: 'Faltou alguma categoria? Escreva aqui.' },

      { id: 'cat_produtos_anexo', type: 'file', star: true,
        label: 'Envie a lista dos produtos que vão para o site.',
        hint: 'Planilha, catálogo em PDF ou os dois. Uma linha por produto, com nome, código, medidas e categoria, é o formato que mais acelera.' },
      { id: 'cat_produtos_link', type: 'text', ph: 'https:// (Drive, Dropbox, WeTransfer...)',
        label: '…ou cole o link da pasta com a lista.' },

      { id: 'cat_fotos_anexo', type: 'file', star: true,
        label: 'Envie as fotos dos produtos.',
        hint: 'Coloque o nome do produto no nome do arquivo, é assim que conseguimos ligar cada foto ao item certo.' },
      { id: 'cat_fotos_link', type: 'text', ph: 'https:// (Drive, Dropbox, WeTransfer...)',
        label: '…ou cole o link da pasta com as fotos.' },
      { id: 'cat_fotos_faltando', type: 'chips',
        options: ['Usar a foto da categoria', 'Vamos produzir as fotos que faltam'],
        label: 'Se algum produto ficar sem foto, o que vocês preferem?' },

      { id: 'cat_fichas_anexo', type: 'file', star: true,
        label: 'Envie as fichas técnicas dos produtos.',
        hint: 'Medidas, material, acabamento e norma. Pode anexar vários arquivos, um por vez.' },

      { id: 'cat_promocao', type: 'area', star: true,
        ph: 'Ex: perfilado 38x38 está com condição especial junto da abraçadeira 1/2',
        label: 'Quais produtos estão em promoção hoje, e com qual outro produto cada um está vinculado?',
        hint: 'No site, quem coloca um produto na cotação vê o produto vinculado como sugestão. Nenhum preço aparece.' },
      { id: 'cat_promocao_nome', type: 'chips',
        options: ['Leve também', 'Produtos que combinam', 'Acessórios recomendados'],
        label: 'Como preferem chamar essa sugestão no site?' },
    ],
  },
  {
    id: 'cat-setores',
    title: 'Setores',
    lede: 'Além da navegação por categoria, o site organiza os produtos por setor de atuação, para o cliente entrar pelo tipo de obra dele.',
    questions: [
      { id: 'set_lista', type: 'area', star: true,
        ph: 'Energia solar: perfilados e acessórios (categoria inteira), chumbadores mecânicos, barra roscada 3/8\nIndústria: eletrocalhas, abraçadeiras metálicas',
        label: 'Quais setores devem aparecer no site e quais produtos entram em cada um?',
        hint: 'Escreva um setor por linha e, na frente, as categorias ou os produtos daquele setor. Um produto pode estar em mais de um setor. Se preferir, marque o setor direto na planilha de produtos e anexe abaixo.' },
      { id: 'set_anexo', type: 'file',
        label: 'Se preferir, anexe a planilha com o setor de cada produto.' },
      { id: 'set_porque', type: 'area',
        ph: 'Ex: na energia solar o que pega é fixar o trilho no telhado sem furar a telha',
        label: 'Por que um cliente de cada setor procura vocês?',
        hint: 'O texto de cada setor é escrito por nós; isso aqui é o que ele precisa dizer.' },
    ],
  },
  {
    id: 'cat-cotacao',
    title: 'Atendimento & cotação',
    lede: 'O cliente monta a lista de produtos no site e envia tudo de uma vez pelo WhatsApp de vocês.',
    questions: [
      { id: 'wa_numero', type: 'text', ph: '(00) 00000-0000', star: true,
        label: 'Qual número recebe as cotações do site?' },
      { id: 'wa_extra', type: 'text', ph: 'Ex: nome da empresa e cidade',
        label: 'Além do produto e da categoria, precisa vir mais alguma informação na mensagem?' },
    ],
  },
  {
    id: 'cat-revendedor',
    title: 'Canal do revendedor',
    lede: 'Esta página é a que mais pode crescer, então vale caprichar nas respostas: é com elas que a gente escreve o argumento para quem revende.',
    questions: [
      { id: 'rev_ganho', type: 'area', star: true,
        ph: 'Ex: margem de revenda, preço de atacado, pronta entrega, condição de pagamento, apoio na primeira compra',
        label: 'O que o revendedor ganha comprando de vocês?',
        hint: 'É o coração do texto dessa página. Quanto mais concreto, melhor.' },
      { id: 'rev_perfil', type: 'text', ph: 'Ex: loja de material de construção que vende por unidade',
        label: 'Que tipo de revendedor vocês querem atrair?' },
      { id: 'rev_campos', type: 'chips', multi: true,
        options: ['Nome', 'Empresa e CNPJ', 'Cidade e estado', 'Ramo de atuação', 'Telefone e e-mail', 'Volume estimado'],
        label: 'Quais informações vocês precisam receber de quem se cadastra?' },
      { id: 'rev_requisitos', type: 'text', ph: 'Ex: ter CNPJ e comprar a partir de X',
        label: 'Existe algum requisito para ser revendedor que deva aparecer na página?' },
      { id: 'rev_material', type: 'chips', options: ['Sim, vamos anexar', 'Não temos'],
        label: 'Tem algum material para enviar a essas pessoas?',
        hint: 'Apresentação, tabela, condições comerciais.' },
      { id: 'rev_material_anexo', type: 'file', showIf: { q: 'rev_material', in: ['Sim, vamos anexar'] },
        label: 'Anexe o material do revendedor.' },
    ],
  },
  {
    id: 'cat-provas',
    title: 'Provas & conteúdo',
    lede: 'O que dá credibilidade para quem não conhece a empresa.',
    questions: [
      { id: 'prova_depoimentos', type: 'chips',
        options: ['Sim, temos', 'Podemos coletar', 'Não queremos usar'],
        label: 'Querem colocar depoimentos de clientes no site?' },
      { id: 'prova_logos', type: 'chips',
        options: ['Sim, pode usar', 'Só de alguns', 'Não pode'],
        label: 'Querem destacar empresas que já são clientes através dos logotipos delas?' },
      { id: 'prova_logos_quais', type: 'text', showIf: { q: 'prova_logos', in: ['Sim, pode usar', 'Só de alguns'] },
        label: 'Quais empresas podemos mostrar?' },
      { id: 'prova_certificacoes', type: 'text', ph: 'Ex: ISO 9001, normas ABNT',
        label: 'Têm certificações, normas ou selos que devam aparecer?' },
      { id: 'prova_fotos_empresa', type: 'chips',
        options: ['Sim, temos', 'Vamos produzir', 'Não temos'],
        label: 'Têm fotos da fábrica, do estoque ou da equipe?' },
    ],
  },
  {
    id: 'cat-acessos',
    title: 'Acessos & materiais',
    lede: 'Isso não trava o começo do projeto, mas precisa estar resolvido antes da publicação. Nenhuma senha aqui: onde dá, o acesso é por convite.',
    access: true,
    questions: [
      { id: 'link_materiais', type: 'text', ph: 'Link do Drive / Dropbox / pasta',
        label: 'Link da pasta com os materiais da marca.' },
      { id: 'acesso_dominio', type: 'text', ph: 'Ex: Registro.br, GoDaddy...',
        label: 'Onde o domínio está registrado?' },
      { id: 'acesso_dominio_quem', type: 'text', ph: 'Nome e WhatsApp de quem tem o login',
        star: true,
        label: 'Quem tem o login do domínio?',
        hint: 'Não escreva a senha aqui. A gente combina o acesso ao DNS direto com essa pessoa.' },
      { id: 'acesso_email_dominio', type: 'text', ph: 'Ex: Google Workspace, Locaweb',
        label: 'O e-mail da empresa usa esse mesmo domínio? Em qual serviço?',
        hint: 'Importante para não derrubar o e-mail de vocês na troca do site.' },
      { id: 'contas_criadas', type: 'chips', multi: true, star: true,
        options: ['GitHub', 'Vercel', 'Supabase'],
        label: 'O site fica em contas de vocês. Quais já foram criadas?',
        hint: 'GitHub guarda o código, Vercel publica o site, Supabase guarda os dados do catálogo. Todas em plano gratuito. Depois de criar, convide camila@notkode.com.br em cada uma.' },
      { id: 'contas_email', type: 'text', ph: 'Ex: ti@empresa.com.br',
        label: 'Qual e-mail vocês usaram para criar essas contas?' },
      { id: 'pixels', type: 'chips', multi: true,
        options: ['Google Ads', 'Meta (Facebook/Instagram)', 'Google Tag Manager', 'Google Analytics', 'Hotjar ou Clarity'],
        label: 'Quais pixels e ferramentas de medição vamos instalar no site?' },
      { id: 'pixels_ids', type: 'area',
        ph: 'Google Ads: AW-000000000\nMeta: 000000000000000\nGTM: GTM-XXXXXXX',
        label: 'Informe o ID de cada um.',
        hint: 'Só o ID basta para instalar. Se quiserem que a gente confirme que os eventos estão chegando na conta, convide camila@notkode.com.br como leitor.' },
      { id: 'lgpd_email', type: 'text', ph: 'contato@...',
        label: 'Qual e-mail publicamos na Política de Privacidade para contato sobre dados?' },
    ],
  },
];

export type OnboardingTemplateKey = 'produto' | 'site' | 'site-catalogo' | 'sistema-ia' | 'agentes' | 'identidade' | 'social';

export type OnboardingTemplate = {
  label: string;
  sections: OnboardingSection[];
};

export const ONBOARDING_TEMPLATES: Record<OnboardingTemplateKey, OnboardingTemplate> = {
  produto: { label: 'Produto / E-commerce', sections: ONBOARDING_SECTIONS },
  site: { label: 'Site / Landing Page', sections: SITE_SECTIONS },
  'site-catalogo': { label: 'Site com catálogo (B2B)', sections: CATALOGO_SECTIONS },
  'sistema-ia': { label: 'Sistema com IA', sections: SISTEMA_SECTIONS },
  agentes: { label: 'Agentes & Automação', sections: AGENTES_SECTIONS },
  identidade: { label: 'Identidade & Brandbook', sections: IDENTIDADE_SECTIONS },
  social: { label: 'Social Media & Criativo', sections: SOCIAL_SECTIONS },
};

/** Template pelo key gravado no briefing; desconhecido/nulo cai no de produto (v1). */
export function getOnboardingTemplate(key: string | null | undefined): OnboardingTemplate {
  return ONBOARDING_TEMPLATES[(key ?? 'produto') as OnboardingTemplateKey] ?? ONBOARDING_TEMPLATES.produto;
}

/**
 * Uma pergunta é visível quando não tem showIf, ou quando a resposta da
 * pergunta-dependência está entre os valores esperados. Suporta resposta
 * única (string) ou múltipla (string[] dos chips multi).
 */
export function isQuestionVisible(
  q: OnboardingQuestion,
  answers: Record<string, string | string[]>,
): boolean {
  if (!q.showIf) return true;
  const dep = answers[q.showIf.q];
  if (Array.isArray(dep)) return dep.some((v) => q.showIf!.in.includes(v));
  return typeof dep === 'string' && q.showIf.in.includes(dep);
}

/** Total de perguntas marcadas como essenciais (⭐) — uso interno. */
export const ESSENTIAL_COUNT = ONBOARDING_SECTIONS
  .flatMap((s) => s.questions)
  .filter((q) => q.star).length;
