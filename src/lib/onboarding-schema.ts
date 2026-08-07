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
      { id: 'emp_regiao', type: 'text', ph: 'Ex: Brasil todo, com foco em SP e no ABC',
        label: 'Quais regiões vocês atendem?' },
      { id: 'emp_condicao_comercial', type: 'text', ph: 'Ex: pedido mínimo, venda só para CNPJ',
        label: 'Tem alguma regra de venda que o cliente precisa saber logo de cara?' },
    ],
  },
  {
    id: 'cat-publico',
    title: 'Quem compra',
    lede: 'Quanto mais concreto aqui, mais o texto do site vai falar a língua de quem lê. Pode responder do jeito que você falaria no balcão.',
    questions: [
      { id: 'pub_quem', type: 'chips', multi: true, star: true,
        options: [
          'Comprador de indústria',
          'Engenheiro ou projetista',
          'Eletricista e instalador',
          'Construtora e empreiteira',
          'Loja de material elétrico',
          'Distribuidor',
          'Almoxarifado de fábrica',
          'Pessoa física',
        ],
        label: 'Quem procura vocês hoje?' },
      { id: 'pub_principal', type: 'text', ph: 'Ex: loja de material elétrico',
        star: true,
        label: 'Desses, quem traz mais faturamento?' },
      { id: 'pub_compra', type: 'chips', multi: true,
        options: [
          'Compra pouca coisa, mas todo mês',
          'Compra grande de obra, de vez em quando',
          'Compra por lista de engenharia ou projeto',
          'Compra para revender',
        ],
        label: 'Como é a compra desse cliente?' },
      { id: 'pub_valor', type: 'text', ph: 'Ex: a maioria entre R$ 800 e R$ 5 mil',
        label: 'Quanto costuma valer um pedido desses?',
        hint: 'Não vai aparecer no site. Serve para sabermos com quem estamos falando.' },
      { id: 'pub_decide', type: 'chips', multi: true, star: true,
        options: ['Preço', 'Prazo de entrega', 'Ter tudo no mesmo lugar', 'Qualidade e norma', 'Atendimento', 'Prazo de pagamento'],
        label: 'O que mais pesa na hora de ele escolher o fornecedor?' },
      { id: 'pub_duvidas', type: 'area', star: true,
        ph: 'Ex: "vocês têm pronta entrega?", "atende medida especial?", "qual o prazo?"',
        label: 'O que ele mais pergunta antes de fechar o pedido?' },
      { id: 'pub_vocabulario', type: 'area', star: true,
        ph: 'Ex: uns falam cinta, outros falam fita; tem quem chame perfilado de canaleta',
        label: 'Como o cliente chama os produtos no dia a dia?',
        hint: 'Nomes diferentes, jeito da região, marca usada como nome. É o vocabulário que vamos usar no site e nas buscas.' },
      { id: 'pub_chega', type: 'chips', multi: true,
        options: ['Indicação', 'Google', 'Representante', 'Cliente antigo que volta', 'Feira', 'Instagram', 'Não sabemos'],
        label: 'Como esse cliente chega até vocês hoje?' },
      { id: 'pub_nao', type: 'text', ph: 'Ex: quem quer uma peça só',
        label: 'E quem NÃO é cliente de vocês?' },
    ],
  },
  {
    id: 'cat-catalogo',
    title: 'Catálogo de produtos',
    lede: 'É o que mais demora a juntar. Quanto antes vier, antes o site sai.',
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

      { id: 'cat_planilha', type: 'chips', star: true,
        options: ['Vamos enviar a planilha', 'Só temos o catálogo em PDF'],
        label: 'Podem enviar a planilha com todos os produtos?',
        hint: 'Uma linha por produto, com nome, código, medidas e categoria.' },
      { id: 'cat_planilha_anexo', type: 'file', showIf: { q: 'cat_planilha', in: ['Vamos enviar a planilha'] },
        label: 'Anexe a planilha de produtos.' },

      { id: 'cat_fotos', type: 'chips', star: true,
        options: ['Temos de todos', 'Temos de parte deles', 'Ainda não temos'],
        label: 'Vocês têm foto dos produtos?' },
      { id: 'cat_fotos_anexo', type: 'file', showIf: { q: 'cat_fotos', in: ['Temos de todos', 'Temos de parte deles'] },
        label: 'Anexe as fotos que já existem.', hint: 'Pode ser um .zip ou o link da pasta na pergunta seguinte.' },
      { id: 'cat_fotos_link', type: 'text', ph: 'https:// (Drive, Dropbox, WeTransfer...)',
        showIf: { q: 'cat_fotos', in: ['Temos de todos', 'Temos de parte deles'] },
        label: '…ou cole o link da pasta com as fotos.' },
      { id: 'cat_fotos_faltando', type: 'chips',
        showIf: { q: 'cat_fotos', in: ['Temos de parte deles', 'Ainda não temos'] },
        options: ['Usar a foto da categoria', 'Vamos produzir as fotos que faltam'],
        label: 'Para os produtos sem foto, o que preferem?' },

      { id: 'cat_fichas', type: 'chips', star: true,
        options: ['Vamos enviar as fichas', 'As informações só existem dentro do catálogo em PDF'],
        label: 'E as fichas técnicas dos produtos?',
        hint: 'Medidas, material, acabamento e norma. É o que entra na página de cada produto.' },
      { id: 'cat_fichas_anexo', type: 'file', showIf: { q: 'cat_fichas', in: ['Vamos enviar as fichas'] },
        label: 'Anexe as fichas técnicas.' },
      { id: 'cat_ficha_download', type: 'chips', options: ['Sim, deixar para baixar', 'Não, só na página'],
        label: 'A ficha em PDF deve ficar disponível para download no site?' },

      { id: 'cat_fora', type: 'text', ph: 'Ex: itens sob encomenda, linha descontinuada',
        label: 'Tem produto no catálogo que NÃO deve ir para o site?' },
    ],
  },
  {
    id: 'cat-setores',
    title: 'Setores',
    lede: 'Além da navegação por categoria, o site organiza os produtos por setor de atuação, para o cliente entrar pelo tipo de obra dele.',
    questions: [
      { id: 'set_lista', type: 'area', star: true,
        ph: 'Ex: Construção civil, Energia solar, Indústria, Saneamento',
        label: 'Quais setores devem aparecer no site?',
        hint: 'Escreva o nome do jeito que vocês querem que apareça.' },
      { id: 'set_produtos', type: 'area', star: true,
        ph: 'Energia solar: perfilados inteiros + chumbadores mecânicos + barra roscada 3/8\nIndústria: eletrocalhas + abraçadeiras metálicas',
        label: 'Quais produtos entram em cada setor?',
        hint: 'Pode responder por categoria inteira ou por produto específico. Um produto pode estar em mais de um setor.' },
      { id: 'set_anexo', type: 'file',
        label: 'Se preferir, anexe uma planilha com os produtos e o setor de cada um.' },
      { id: 'set_porque', type: 'area',
        ph: 'Ex: na energia solar o que pega é a fixação do trilho no telhado sem furar a telha',
        label: 'Por que um cliente de cada setor procura vocês?',
        hint: 'O texto de cada setor é escrito por nós; isso aqui é o que ele precisa dizer.' },
    ],
  },
  {
    id: 'cat-upsell',
    title: 'Produtos que andam juntos',
    lede: 'Quando o cliente coloca um produto na cotação, o site sugere o que costuma ir junto. Nenhum preço aparece no site.',
    questions: [
      { id: 'up_combinacoes', type: 'area', star: true,
        ph: 'Ex: quem leva perfilado leva também abraçadeira e barra roscada',
        label: 'Quais produtos costumam ser vendidos juntos?' },
      { id: 'up_promocao', type: 'area',
        label: 'Já existe alguma combinação em promoção hoje, para já subirmos no site?' },
      { id: 'up_nome', type: 'chips',
        options: ['Leve também', 'Produtos que combinam', 'Acessórios recomendados'],
        label: 'Como preferem chamar essa sugestão no site?' },
    ],
  },
  {
    id: 'cat-cotacao',
    title: 'Atendimento & cotação',
    lede: 'O cliente monta a lista de produtos no site e envia tudo de uma vez pelo WhatsApp de vocês.',
    questions: [
      { id: 'wa_numero', type: 'text', ph: '(00) 00000-0000', star: true,
        label: 'Qual número recebe as cotações do site?' },
      { id: 'wa_horario', type: 'text', ph: 'Ex: seg a sex, 8h às 18h',
        label: 'Qual o horário de atendimento?' },
      { id: 'wa_dados', type: 'chips', multi: true,
        options: ['Nome', 'Empresa', 'Cidade', 'CNPJ', 'Quantidade de cada produto'],
        label: 'Além dos produtos, o que precisa vir na mensagem?' },
      { id: 'contato_publico', type: 'area', ph: 'Telefone, e-mail e endereço',
        label: 'Quais dados de contato entram no rodapé e na página de contato?' },
    ],
  },
  {
    id: 'cat-revendedor',
    title: 'Canal do revendedor',
    lede: 'Página com formulário para quem quer revender os produtos de vocês.',
    questions: [
      { id: 'rev_campos', type: 'chips', multi: true,
        options: ['Nome', 'Empresa e CNPJ', 'Cidade e estado', 'Ramo de atuação', 'Telefone e e-mail', 'Volume estimado'],
        label: 'Quais informações vocês precisam receber de quem se cadastra?' },
      { id: 'rev_email', type: 'text', ph: 'comercial@...', star: true,
        label: 'Qual e-mail recebe o aviso de cada cadastro?' },
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
      { id: 'prova_numeros', type: 'text', ph: 'Ex: 20 anos de mercado, 3 mil itens em linha',
        label: 'Tem algum número da empresa que valha destacar?' },
    ],
  },
  {
    id: 'cat-acessos',
    title: 'Acessos & materiais',
    lede: 'Isso não trava o começo do projeto, mas precisa estar resolvido antes da publicação.',
    access: true,
    questions: [
      { id: 'link_materiais', type: 'text', ph: 'Link do Drive / Dropbox / pasta',
        label: 'Link da pasta com os materiais da marca.' },
      { id: 'acesso_dominio', type: 'text', ph: 'Ex: Registro.br, GoDaddy...',
        label: 'Onde o domínio está registrado (e vocês conseguem dar acesso ao DNS)?' },
      { id: 'acesso_email_dominio', type: 'text', ph: 'Ex: Google Workspace, Locaweb',
        label: 'O e-mail da empresa usa esse mesmo domínio? Em qual serviço?',
        hint: 'Importante para não derrubar o e-mail de vocês na troca do site.' },
      { id: 'acesso_google', type: 'chips', options: ['Convite enviado', 'Ainda não temos'],
        label: 'Google Ads' },
      { id: 'acesso_meta', type: 'chips', options: ['Convite enviado', 'Ainda não temos'],
        label: 'Meta Business (Instagram/Facebook)' },
      { id: 'lgpd_email', type: 'text', ph: 'contato@...',
        label: 'Qual e-mail publicamos na Política de Privacidade para contato sobre dados?' },
      { id: 'cat_livre', type: 'area',
        label: 'Algo que não perguntamos e que vocês acham importante para o site?' },
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
