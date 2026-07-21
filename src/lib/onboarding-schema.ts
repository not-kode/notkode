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

const MARCA_SECTION = ONBOARDING_SECTIONS.find((s) => s.id === 'marca')!;

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

const SITE_SECTIONS: OnboardingSection[] = [
  {
    id: 'objetivo-site',
    title: 'Objetivo & Conteúdo',
    lede: 'O que o site precisa alcançar e o que vai dentro dele.',
    questions: [
      { id: 'site_objetivo', type: 'chips', multi: true,
        options: ['Vender', 'Captar leads', 'Apresentar a empresa', 'Agendar contato', 'Portfólio'],
        label: 'Qual é o objetivo principal do site?' },
      { id: 'site_acao', type: 'text', ph: 'Ex: chamar no WhatsApp, pedir orçamento...',
        label: 'Qual AÇÃO o visitante deve fazer ao entrar?' },
      { id: 'site_paginas', type: 'chips', multi: true,
        options: ['Página única (landing)', 'Home', 'Sobre', 'Serviços/Produtos', 'Portfólio/Cases', 'Blog', 'Contato'],
        label: 'Quais páginas o site precisa ter?' },
      { id: 'site_publico', type: 'area',
        label: 'Quem é o público que vai visitar o site?' },
      { id: 'site_diferenciais', type: 'area',
        label: 'Quais são os seus diferenciais em relação aos concorrentes?' },
      { id: 'site_referencias', type: 'area', ph: 'Links de 2 ou 3 sites + o que você gosta em cada um',
        label: 'Quais sites você admira e por quê?' },
      { id: 'site_textos', type: 'chips',
        options: ['Tenho prontos', 'Tenho parte', 'Preciso que criem'],
        label: 'Os textos do site já existem?' },
      { id: 'site_depoimentos', type: 'chips', options: ['Sim, tenho', 'Não tenho'],
        label: 'Tem depoimentos ou avaliações de clientes pra usar?' },
    ],
  },
  MARCA_SECTION,
  ACESSOS_BASICOS,
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

export type OnboardingTemplateKey = 'produto' | 'site' | 'sistema-ia' | 'agentes' | 'identidade';

export type OnboardingTemplate = {
  label: string;
  /** Parágrafo de boas-vindas do formulário público. */
  welcome: string;
  sections: OnboardingSection[];
};

export const ONBOARDING_TEMPLATES: Record<OnboardingTemplateKey, OnboardingTemplate> = {
  produto: {
    label: 'Produto / E-commerce',
    welcome:
      'Este briefing nos dá tudo que precisamos para construir o CRM, rodar o tráfego pago e montar a landing page do seu novo produto.',
    sections: ONBOARDING_SECTIONS,
  },
  site: {
    label: 'Site / Landing Page',
    welcome: 'Este briefing nos dá tudo que precisamos para desenhar e construir o seu site do jeito certo.',
    sections: SITE_SECTIONS,
  },
  'sistema-ia': {
    label: 'Sistema com IA',
    welcome:
      'Este briefing nos dá tudo que precisamos para desenhar o seu sistema sob medida, do jeito que a sua operação funciona.',
    sections: SISTEMA_SECTIONS,
  },
  agentes: {
    label: 'Agentes & Automação',
    welcome:
      'Este briefing nos dá tudo que precisamos para montar seus agentes e automações sem quebrar o que já funciona.',
    sections: AGENTES_SECTIONS,
  },
  identidade: {
    label: 'Identidade & Brandbook',
    welcome: 'Este briefing nos dá tudo que precisamos para criar uma identidade com a cara da sua marca.',
    sections: IDENTIDADE_SECTIONS,
  },
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
