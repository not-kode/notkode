'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { SectionMarker } from '@/components/ui/section-marker';

const FAQS = [
  {
    q: 'Em quanto tempo o sistema fica pronto?',
    a: 'Depende da complexidade, mas a maioria dos sistemas MVP fica pronta entre 4 e 8 semanas. Na primeira conversa já conseguimos estimar o prazo do seu caso específico.',
  },
  {
    q: 'Preciso saber programar para usar o sistema?',
    a: 'Não. Entregamos o sistema funcionando, com interface pensada para o seu time — e fazemos o treinamento da equipe incluso no projeto.',
  },
  {
    q: 'E se eu quiser mudar algo depois do lançamento?',
    a: 'O código é seu. Você pode contratar qualquer desenvolvedor para manter e evoluir o sistema, ou continuar com a Notkode. Sem dependência.',
  },
  {
    q: 'Tem mensalidade ou custo recorrente?',
    a: 'Não há mensalidade de plataforma. Você paga o projeto uma vez e o sistema é seu para sempre. O único custo recorrente é a infraestrutura (servidor/hospedagem), que costuma ser bem menor que as ferramentas que o sistema substitui.',
  },
  {
    q: 'A IA vai entender o meu segmento de negócio?',
    a: 'Sim. A IA é treinada com os dados e processos do seu negócio — não é um chatbot genérico. Ela aprende como você trabalha, seus clientes e suas regras.',
  },
  {
    q: 'Vocês trabalham com empresas de qualquer porte?',
    a: 'Sim. Atendemos desde empresas em crescimento até operações maiores. O sistema começa do tamanho que faz sentido hoje e cresce com você.',
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border-b border-black/[0.07] last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <div className="flex items-start gap-4">
          <span className="font-mono text-[10px] text-text-dim mt-0.5 shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-[15px] font-semibold text-text-primary group-hover:text-primary transition-colors duration-200">
            {q}
          </span>
        </div>
        <div className="shrink-0 w-6 h-6 rounded-full border border-black/[0.1] flex items-center justify-center mt-0.5 group-hover:border-primary/40 transition-colors duration-200">
          {open
            ? <Minus className="w-3 h-3 text-primary" strokeWidth={2} />
            : <Plus className="w-3 h-3 text-text-muted" strokeWidth={2} />
          }
        </div>
      </button>
      {open && (
        <div className="pb-5 pl-8 pr-10">
          <p className="text-[15px] text-text-secondary leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export function FAQ() {
  return (
    <section className="bg-surface-elevated">
      <div className="container mx-auto px-5 lg:px-8 py-24 lg:py-32">
        <Reveal>
          <div className="max-w-2xl mx-auto mb-12">
            <SectionMarker number="05" label="Dúvidas frequentes" />
            <h2 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.02em] mt-4">
              Perguntas que todo mundo{' '}
              <span className="font-bricolage">faz antes de começar.</span>
            </h2>
          </div>
        </Reveal>

        <div className="max-w-2xl mx-auto">
          {FAQS.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <FAQItem q={item.q} a={item.a} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
