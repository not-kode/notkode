'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

type Category = 'SaaS' | 'E-commerce' | 'Website';

interface CaseItem {
  name: string;
  category: Category;
  year: string;
  metric: string;
  metricLabel: string;
  description: string;
  stack: string[];
  initial: string;
  accentFrom: string;
  accentTo: string;
}

const CASES: CaseItem[] = [
  {
    name: 'AutoAgentes',
    category: 'SaaS',
    year: '2025',
    metric: '+R$ 70k',
    metricLabel: 'receita gerada',
    description: 'SaaS de criação de agentes de IA que automatiza o atendimento via WhatsApp.',
    stack: ['WeWeb', 'Xano', 'OpenAI', 'Claude', 'n8n'],
    initial: 'AA',
    accentFrom: '#3B82F6',
    accentTo: '#93C5FD',
  },
  {
    name: 'ZapInside',
    category: 'SaaS',
    year: '2025',
    metric: '3 semanas',
    metricLabel: 'até o primeiro cliente',
    description: 'Plataforma de gestão de leads pelo WhatsApp para empresas em escala.',
    stack: ['WeWeb', 'Xano', 'OpenAI', 'MegaAPI'],
    initial: 'ZI',
    accentFrom: '#22C55E',
    accentTo: '#86EFAC',
  },
  {
    name: 'Ativa Clientes',
    category: 'SaaS',
    year: '2024',
    metric: '+R$ 40k',
    metricLabel: 'receita gerada',
    description: 'SaaS B2B de reativação de clientes inativos com automação inteligente.',
    stack: ['WeWeb', 'Xano', 'Stripe', 'OpenAI', 'Gemini'],
    initial: 'AC',
    accentFrom: '#F59E0B',
    accentTo: '#FCD34D',
  },
  {
    name: 'Noodrops',
    category: 'E-commerce',
    year: '2023',
    metric: '+R$ 80k/mês',
    metricLabel: 'faturamento mensal',
    description: 'E-commerce de fragrâncias com checkout otimizado e integrações de marketing.',
    stack: ['WooCommerce', 'WordPress', 'Pagar.me', 'Yampi'],
    initial: 'ND',
    accentFrom: '#EC4899',
    accentTo: '#F9A8D4',
  },
  {
    name: 'Ponto Patta',
    category: 'E-commerce',
    year: '2023',
    metric: '+R$ 150k/mês',
    metricLabel: 'faturamento mensal',
    description: 'E-commerce com integração de logística (Correios API) e automação de marketing.',
    stack: ['WooCommerce', 'PagSeguro', 'Correios API', 'Mailchimp'],
    initial: 'PP',
    accentFrom: '#8B5CF6',
    accentTo: '#C4B5FD',
  },
  {
    name: 'Solojet Aviação',
    category: 'Website',
    year: '2024',
    metric: 'Multinacional',
    metricLabel: 'site institucional',
    description: 'Site institucional para empresa de aviação com integração geo e captação de leads.',
    stack: ['WeWeb', 'Google Maps API', 'RD Station', 'n8n'],
    initial: 'SJ',
    accentFrom: '#06B6D4',
    accentTo: '#67E8F9',
  },
  {
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
  },
  {
    name: 'Agência Cotton',
    category: 'Website',
    year: '2025',
    metric: 'Branding',
    metricLabel: 'agência criativa',
    description: 'Site editorial para agência de branding com integração WhatsApp e analytics.',
    stack: ['Framer', 'WhatsApp API', 'Hotjar', 'Zapier'],
    initial: 'CT',
    accentFrom: '#F97316',
    accentTo: '#FDBA74',
  },
  {
    name: 'Peki Marketing',
    category: 'Website',
    year: '2024',
    metric: 'Gastronomia',
    metricLabel: 'agência especializada',
    description: 'Site institucional para agência de marketing focada em restaurantes e gastronomia.',
    stack: ['Framer', 'WhatsApp API', 'ActiveCampaign', 'Cloudflare'],
    initial: 'PM',
    accentFrom: '#EF4444',
    accentTo: '#FCA5A5',
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

const FILTERS: (Category | 'Todos')[] = ['Todos', 'SaaS', 'E-commerce', 'Website'];

export function CasesGrid() {
  const [active, setActive] = useState<Category | 'Todos'>('Todos');

  const filtered = active === 'Todos' ? CASES : CASES.filter((c) => c.category === active);

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-12">
        <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest mr-3">
          Filtrar:
        </span>
        {FILTERS.map((f) => {
          const count = f === 'Todos' ? CASES.length : CASES.filter((c) => c.category === f).length;
          const isActive = active === f;
          return (
            <button
              key={f}
              onClick={() => setActive(f)}
              className="font-mono text-[12px] px-3.5 py-1.5 rounded-full transition-all duration-200 inline-flex items-center gap-2"
              style={{
                background: isActive ? '#3B82F6' : 'transparent',
                color: isActive ? 'white' : 'rgba(25,25,24,0.65)',
                border: isActive ? '1px solid #3B82F6' : '1px solid rgba(25,25,24,0.12)',
              }}
            >
              {f}
              <span className={isActive ? 'opacity-70' : 'opacity-40'}>
                {String(count).padStart(2, '0')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {filtered.map((c, i) => (
          <CaseCard key={c.name} item={c} index={i} />
        ))}
      </div>

      {/* Empty state (shouldn't happen since filters always have items) */}
      {filtered.length === 0 && (
        <p className="text-center text-text-muted py-12">Nenhum case nesta categoria.</p>
      )}
    </div>
  );
}

function CaseCard({ item, index }: { item: CaseItem; index: number }) {
  return (
    <article
      className="group relative rounded-2xl border border-black/[0.08] bg-surface-base overflow-hidden hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      style={{ animation: `case-fade-in 0.5s ease ${index * 60}ms both` }}
    >
      {/* Visual top — abstract gradient + initials */}
      <div
        className="relative aspect-[16/9] overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${item.accentFrom} 0%, ${item.accentTo} 100%)`,
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />
        {/* Initial */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bricolage text-white/95 text-[3.5rem] font-bold tracking-tight"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
          >
            {item.initial}
          </span>
        </div>
        {/* Year tag */}
        <span className="absolute top-3 right-3 font-mono text-[10px] text-white/75 px-2 py-1 rounded-full bg-white/15 backdrop-blur-sm">
          {item.year}
        </span>
        {/* Hover arrow */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowUpRight className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 lg:p-6">
        {/* Title + segment */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-[17px] font-semibold tracking-tight text-text-primary">
            {item.name}
          </h3>
          <span className="font-mono text-[10px] text-text-dim shrink-0 mt-1 uppercase tracking-wider">
            {item.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
          {item.description}
        </p>

        {/* Metric */}
        <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-black/[0.06]">
          <span className="font-bricolage text-[1.5rem] font-bold text-primary leading-none">
            {item.metric}
          </span>
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">
            {item.metricLabel}
          </span>
        </div>

        {/* Stack */}
        <div className="flex flex-wrap gap-1.5">
          {item.stack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="font-mono text-[10px] text-text-muted px-2 py-1 rounded-md bg-black/[0.04]"
            >
              {tech}
            </span>
          ))}
          {item.stack.length > 4 && (
            <span className="font-mono text-[10px] text-text-dim px-2 py-1">
              +{item.stack.length - 4}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
