// Shared cases data — used by /cases grid and /cases/[slug] detail pages

export type CaseCategory = 'SaaS' | 'E-commerce' | 'Website';

export interface Metric {
  value: string;
  label: string;
}

export interface CaseItem {
  slug: string;
  name: string;
  category: CaseCategory;
  year: string;
  /** Short metric shown on card (e.g. "+R$ 70k") */
  metric: string;
  metricLabel: string;
  /** Short one-line description shown on card */
  description: string;
  stack: string[];
  initial: string;
  accentFrom: string;
  accentTo: string;
  /** Live URL of the delivered project */
  liveUrl?: string;
  /** Detailed problem narrative for the detail page */
  problem?: string;
  /** Detailed solution narrative for the detail page */
  solution?: string;
  /** Up to 3 metrics shown in the detail page */
  detailMetrics?: Metric[];
  /** Optional client quote */
  quote?: {
    text: string;
    author: string;
    role: string;
  };
  /** Mark as pending when full content is yet to be collected */
  pending?: boolean;
}

export const CASES: CaseItem[] = [
  {
    slug: 'autoagentes',
    name: 'AutoAgentes',
    category: 'SaaS',
    year: '2025',
    metric: '+R$ 70k',
    metricLabel: 'receita gerada',
    description: 'SaaS de criação de agentes de IA que automatiza o atendimento via WhatsApp.',
    stack: ['WeWeb', 'Xano', 'OpenAI', 'Claude', 'n8n', 'ASAAS', 'Sendgrid', 'MegaAPI'],
    initial: 'AA',
    accentFrom: '#3B82F6',
    accentTo: '#93C5FD',
    problem: 'Donos de PMEs perdiam horas no atendimento manual via WhatsApp, sem conseguir escalar sem contratar.',
    solution: 'Construímos um SaaS de criação de agentes de IA que automatiza o atendimento e libera o time humano para o que importa.',
    detailMetrics: [
      { value: '+R$ 70k', label: 'receita gerada' },
      { value: '8 semanas', label: 'time to launch' },
      { value: '+30%', label: 'ganho operacional' },
    ],
    quote: {
      text: 'A Notkode foi fundamental para otimizar toda a jornada do cliente e desenvolver o software ideal pra superar nosso desafio.',
      author: 'Walter Neto',
      role: 'CEO · AutoAgentes',
    },
  },
  {
    slug: 'zapinside',
    name: 'ZapInside',
    category: 'SaaS',
    year: '2025',
    metric: '3 semanas',
    metricLabel: 'até o primeiro cliente',
    description: 'Plataforma de gestão de leads pelo WhatsApp para empresas em escala.',
    stack: ['WeWeb', 'Xano', 'OpenAI', 'Claude', 'MegaAPI', 'ASAAS'],
    initial: 'ZI',
    accentFrom: '#22C55E',
    accentTo: '#86EFAC',
    problem: 'Empresas precisavam de uma forma rápida de validar gestão de leads no WhatsApp antes de investir em SaaS caros.',
    solution: 'MVP completo de SaaS com IA integrada para automação de respostas, captura de leads e billing recorrente.',
    detailMetrics: [
      { value: '3 semanas', label: 'até o 1º cliente' },
      { value: 'MVP', label: 'pronto para validar' },
      { value: '+R$ 2k', label: 'receita inicial' },
    ],
    quote: {
      text: 'A NotKode foi fundamental para o lançamento da ZapInside. Em três semanas já estávamos recebendo o primeiro cliente. Super recomendo para todos os empreendedores!',
      author: 'Giovanna Pretti',
      role: 'CEO · ZapInside',
    },
  },
  {
    slug: 'ativa-clientes',
    name: 'Ativa Clientes',
    category: 'SaaS',
    year: '2024',
    metric: '+R$ 40k',
    metricLabel: 'receita gerada',
    description: 'SaaS B2B de reativação de clientes inativos com automação inteligente.',
    stack: ['WeWeb', 'Xano', 'Stripe', 'OpenAI', 'Gemini', 'Postmark', 'APIBrasil'],
    initial: 'AC',
    accentFrom: '#F59E0B',
    accentTo: '#FCD34D',
    problem: 'Empresas com base de clientes grande perdiam receita por não reativar quem ficou inativo — processo manual demais.',
    solution: 'SaaS que identifica clientes inativos, segmenta por perfil e dispara automações com IA personalizadas para reativação.',
    detailMetrics: [
      { value: '+R$ 40k', label: 'receita gerada' },
      { value: 'B2B', label: 'mercado validado' },
      { value: 'Multi-IA', label: 'OpenAI + Gemini' },
    ],
  },
  {
    slug: 'noodrops',
    name: 'Noodrops',
    category: 'E-commerce',
    year: '2023',
    metric: '+R$ 80k/mês',
    metricLabel: 'faturamento mensal',
    description: 'E-commerce de fragrâncias com checkout otimizado e integrações de marketing.',
    stack: ['WooCommerce', 'WordPress', 'Pagar.me', 'Yampi', 'GA4', 'Voxuy', 'Clarity'],
    initial: 'ND',
    accentFrom: '#EC4899',
    accentTo: '#F9A8D4',
    liveUrl: 'https://noodrops.com',
    problem: 'Marca de fragrâncias precisava sair de marketplaces e ter loja própria com conversão otimizada.',
    solution: 'E-commerce completo no WooCommerce com checkout otimizado, integrações de marketing e tracking avançado.',
    detailMetrics: [
      { value: '+R$ 80k/mês', label: 'faturamento mensal' },
      { value: '+40%', label: 'taxa de conversão' },
      { value: 'Multi-canal', label: 'marketing integrado' },
    ],
  },
  {
    slug: 'ponto-patta',
    name: 'Ponto Patta',
    category: 'E-commerce',
    year: '2023',
    metric: '+R$ 150k/mês',
    metricLabel: 'faturamento mensal',
    description: 'E-commerce com integração de logística (Correios API) e automação de marketing.',
    stack: ['WooCommerce', 'WordPress', 'PagSeguro', 'Correios API', 'Mailchimp', 'GA4', 'FB Pixel'],
    initial: 'PP',
    accentFrom: '#8B5CF6',
    accentTo: '#C4B5FD',
    problem: 'Loja precisava escalar operação com integração de logística automática e marketing baseado em comportamento.',
    solution: 'E-commerce com automação completa: cálculo de frete em tempo real, e-mail marketing segmentado e tracking de funil.',
    detailMetrics: [
      { value: '+R$ 150k/mês', label: 'faturamento mensal' },
      { value: 'Auto frete', label: 'Correios em tempo real' },
      { value: 'Funil completo', label: 'do anúncio ao reorder' },
    ],
  },
  {
    slug: 'solojet-aviacao',
    name: 'Solojet Aviação',
    category: 'Website',
    year: '2024',
    metric: 'Multinacional',
    metricLabel: 'site institucional',
    description: 'Site institucional para empresa de aviação com integração geo e captação de leads.',
    stack: ['WeWeb', 'Google Maps API', 'Google Sheets', 'PostHog', 'RD Station', 'n8n'],
    initial: 'SJ',
    accentFrom: '#06B6D4',
    accentTo: '#67E8F9',
    problem: 'Empresa de aviação multinacional precisava de site institucional com captação geo-localizada de leads.',
    solution: 'Site no WeWeb com mapa interativo (Google Maps), formulários integrados a RD Station via n8n e tracking PostHog.',
    detailMetrics: [
      { value: 'Multinacional', label: 'BR · US · CA' },
      { value: 'Geo leads', label: 'captação por região' },
      { value: '3 idiomas', label: 'institucional multilíngue' },
    ],
  },
  {
    slug: 'azure-investimentos',
    name: 'Azure Investimentos',
    category: 'Website',
    year: '2024',
    metric: 'Assessoria BTG',
    metricLabel: 'parceria estratégica',
    description: 'Site institucional + automação de captação para assessoria de investimentos BTG.',
    stack: ['Framer', 'WhatsApp API', 'Make', 'GA4'],
    initial: 'AZ',
    accentFrom: '#3B82F6',
    accentTo: '#60A5FA',
    problem: 'Assessoria precisava de site que transmitisse autoridade e capturasse leads qualificados de investidores.',
    solution: 'Site editorial no Framer com WhatsApp API integrado, fluxos de automação no Make e analytics completo.',
    detailMetrics: [
      { value: 'Assessoria BTG', label: 'parceria estratégica' },
      { value: 'Lead qualificado', label: 'WhatsApp + automação' },
      { value: 'Editorial', label: 'design premium' },
    ],
    quote: {
      text: 'A Notkode foi primordial para o rápido lançamento do meu projeto. Altíssima qualidade, técnica, agilidade e seriedade.',
      author: 'Bruno Coimbra',
      role: 'Azure Investimentos',
    },
  },
  {
    slug: 'agencia-cotton',
    name: 'Agência Cotton',
    category: 'Website',
    year: '2025',
    metric: 'Branding',
    metricLabel: 'agência criativa',
    description: 'Site editorial para agência de branding com integração WhatsApp e analytics.',
    stack: ['Framer', 'WhatsApp API', 'Hotjar', 'Zapier', 'GA4'],
    initial: 'CT',
    accentFrom: '#F97316',
    accentTo: '#FDBA74',
    problem: 'Agência de branding precisava de site editorial que refletisse a sofisticação do trabalho deles.',
    solution: 'Site no Framer com design editorial, animações sutis e fluxo de captação direto pelo WhatsApp.',
    detailMetrics: [
      { value: 'Editorial', label: 'design premium' },
      { value: 'WhatsApp', label: 'captação direta' },
      { value: 'Hotjar', label: 'comportamento mapeado' },
    ],
  },
  {
    slug: 'peki-marketing',
    name: 'Peki Marketing',
    category: 'Website',
    year: '2024',
    metric: 'Gastronomia',
    metricLabel: 'agência especializada',
    description: 'Site institucional para agência de marketing focada em restaurantes e gastronomia.',
    stack: ['Framer', 'WhatsApp API', 'ActiveCampaign', 'Cloudflare', 'GA4', 'FB Pixel', 'Hotjar'],
    initial: 'PM',
    accentFrom: '#EF4444',
    accentTo: '#FCA5A5',
    problem: 'Agência de nicho (restaurantes) precisava de site que segmentasse claramente seu posicionamento.',
    solution: 'Site editorial com tracking completo, automação ActiveCampaign para nutrição de leads e CDN Cloudflare.',
    detailMetrics: [
      { value: 'Nicho', label: 'gastronomia' },
      { value: 'Multi-tracker', label: 'GA4 + Meta + Hotjar' },
      { value: 'Auto nutrição', label: 'ActiveCampaign' },
    ],
  },
  {
    slug: 'loss-prevention',
    name: 'Loss Prevention',
    category: 'Website',
    year: '2024',
    metric: 'Operação digital',
    metricLabel: 'modernização completa',
    description: 'Modernização completa do processo comercial: novo site + automação de leads.',
    stack: ['Framer', 'Airtable', 'Sendgrid', 'n8n'],
    initial: 'LP',
    accentFrom: '#10B981',
    accentTo: '#6EE7B7',
    liveUrl: 'https://www.lossprevention.com.br/',
    problem: 'Operação comercial inteira em planilhas e e-mail. Sem visibilidade do funil, sem automação, sem escala.',
    solution: 'Modernização completa: novo site no Framer + Airtable como base de dados + Sendgrid para e-mails transacionais + n8n para automação de leads.',
    detailMetrics: [
      { value: '4 ferramentas', label: 'integradas' },
      { value: 'Auto leads', label: 'do form ao CRM' },
      { value: 'Visibilidade', label: 'funil mapeado' },
    ],
  },
  {
    slug: 'blindy',
    name: 'Blindy',
    category: 'Website',
    year: '2025',
    metric: 'em breve',
    metricLabel: 'case completo',
    description: 'Identidade digital com automações de captação e gestão de leads.',
    stack: ['Framer', 'WhatsApp API', 'n8n'],
    initial: 'BL',
    accentFrom: '#64748B',
    accentTo: '#94A3B8',
    liveUrl: 'https://www.blindy.com.br/',
    pending: true,
  },
  {
    slug: 'receba-seus-direitos',
    name: 'Receba Seus Direitos',
    category: 'Website',
    year: '2025',
    metric: 'em breve',
    metricLabel: 'case completo',
    description: 'Plataforma para assessoria trabalhista — captação e gestão de processos.',
    stack: ['Framer', 'WhatsApp API', 'Airtable'],
    initial: 'RD',
    accentFrom: '#A855F7',
    accentTo: '#D8B4FE',
    liveUrl: 'https://www.recebaseusdireitos.com.br/',
    pending: true,
  },
];

export function getCaseBySlug(slug: string): CaseItem | undefined {
  return CASES.find((c) => c.slug === slug);
}

export function getAdjacentCases(slug: string): { prev?: CaseItem; next?: CaseItem } {
  const idx = CASES.findIndex((c) => c.slug === slug);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? CASES[idx - 1] : CASES[CASES.length - 1],
    next: idx < CASES.length - 1 ? CASES[idx + 1] : CASES[0],
  };
}
