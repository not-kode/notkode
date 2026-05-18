import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Reveal } from '@/components/ui/reveal';

export const metadata: Metadata = {
  title: 'Política de Privacidade · Notkode',
  description:
    'Como a Notkode coleta, usa e protege os dados pessoais que você compartilha conosco. Em conformidade com a LGPD.',
  robots: { index: true, follow: true },
};

const LAST_UPDATE = '18 de maio de 2026';
const CONTROLLER_EMAIL = 'camila@notkode.com.br';

const SECTIONS: Array<{ id: string; title: string; body: React.ReactNode }> = [
  {
    id: 'quem-somos',
    title: 'Quem somos',
    body: (
      <>
        <p>
          Notkode é uma empresa de tecnologia que desenvolve sistemas, automações e identidade visual sob medida. Atuamos como <strong>controladora</strong> dos dados pessoais que você nos envia através deste site.
        </p>
        <p>
          Para qualquer assunto relacionado a este documento ou aos seus direitos como titular, fale com a gente em{' '}
          <a href={`mailto:${CONTROLLER_EMAIL}`} className="text-primary hover:underline">{CONTROLLER_EMAIL}</a>.
        </p>
      </>
    ),
  },
  {
    id: 'quais-dados',
    title: 'Quais dados coletamos',
    body: (
      <>
        <p>Quando você preenche um formulário no site, coletamos:</p>
        <ul>
          <li>Nome</li>
          <li>E-mail</li>
          <li>Telefone / WhatsApp</li>
          <li>Mensagens, notas e respostas que você adiciona livremente</li>
          <li>Página de origem do envio</li>
          <li>Parâmetros de campanha (UTMs) se você chegou por um link de anúncio</li>
        </ul>
        <p>
          Não coletamos dados sensíveis (origem racial, religião, opinião política, saúde, etc.) e não armazenamos dados de cartão. Se você tem menos de 18 anos, não preencha os formulários sem autorização do responsável.
        </p>
      </>
    ),
  },
  {
    id: 'finalidade',
    title: 'Para que usamos',
    body: (
      <>
        <p>Os dados são usados estritamente para:</p>
        <ul>
          <li>Responder seu contato e validar o escopo do projeto</li>
          <li>Enviar a proposta detalhada por e-mail e WhatsApp</li>
          <li>Acompanhar o lead até o fechamento (ou descarte) do projeto</li>
          <li>Eventualmente, comunicar novidades relevantes do nosso trabalho, sempre com opt-out claro em cada mensagem</li>
        </ul>
        <p>
          Não vendemos, alugamos ou usamos seus dados para construir perfis publicitários.
        </p>
      </>
    ),
  },
  {
    id: 'compartilhamento',
    title: 'Com quem compartilhamos',
    body: (
      <>
        <p>
          Para operar o site e o atendimento, usamos serviços terceiros que processam dados em nosso nome:
        </p>
        <ul>
          <li><strong>Supabase</strong> — banco de dados onde os leads são registrados (servidor em São Paulo, Brasil).</li>
          <li><strong>Resend</strong> — envio das notificações por e-mail.</li>
          <li><strong>Vercel</strong> — hospedagem do site.</li>
          <li><strong>WhatsApp</strong> (Meta) — quando você opta por continuar a conversa por lá.</li>
        </ul>
        <p>
          Todos estão sujeitos a contratos que exigem o mesmo nível de proteção que praticamos. Em nenhuma hipótese repassamos seus dados para empresas que não estejam diretamente envolvidas no atendimento do seu projeto.
        </p>
      </>
    ),
  },
  {
    id: 'retencao',
    title: 'Por quanto tempo guardamos',
    body: (
      <>
        <ul>
          <li><strong>Leads ativos:</strong> enquanto o projeto está sendo discutido ou em andamento.</li>
          <li><strong>Leads descartados:</strong> até 24 meses após o último contato, para histórico comercial.</li>
          <li><strong>Clientes ativos:</strong> pelo período legal exigido (mínimo de 5 anos a contar do fim do contrato, por questões fiscais e civis).</li>
        </ul>
        <p>Após esses prazos, os dados são apagados ou anonimizados.</p>
      </>
    ),
  },
  {
    id: 'direitos',
    title: 'Seus direitos como titular',
    body: (
      <>
        <p>Pela LGPD (Lei 13.709/2018), você pode a qualquer momento:</p>
        <ul>
          <li>Confirmar se temos dados seus</li>
          <li>Acessar os dados que temos</li>
          <li>Corrigir dados desatualizados ou incompletos</li>
          <li>Solicitar anonimização, bloqueio ou eliminação</li>
          <li>Solicitar a portabilidade pra outro fornecedor</li>
          <li>Revogar o consentimento que você nos deu</li>
          <li>Saber com quem compartilhamos seus dados</li>
        </ul>
        <p>
          Pra exercer qualquer desses direitos, escreva pra{' '}
          <a href={`mailto:${CONTROLLER_EMAIL}`} className="text-primary hover:underline">{CONTROLLER_EMAIL}</a>{' '}
          com o assunto <em>LGPD</em>. Respondemos em até 15 dias.
        </p>
      </>
    ),
  },
  {
    id: 'seguranca',
    title: 'Segurança',
    body: (
      <>
        <p>
          O site usa HTTPS em todas as páginas. O acesso ao banco de dados é restrito por chaves de servidor que nunca são expostas no navegador. Apenas a Camila tem acesso ao painel administrativo.
        </p>
        <p>
          Mesmo assim, nenhum sistema é 100% imune. Se identificarmos um incidente que afete seus dados, comunicamos você e a ANPD nos prazos exigidos.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies e rastreamento',
    body: (
      <>
        <p>
          Hoje o site não usa cookies de analytics nem pixels publicitários. Quando começarmos a usar (por exemplo, GA4 ou Plausible), atualizamos esta política e exibimos o aviso de cookies no rodapé.
        </p>
      </>
    ),
  },
  {
    id: 'mudancas',
    title: 'Mudanças nesta política',
    body: (
      <>
        <p>
          Podemos atualizar esse documento conforme o site ou a legislação mudarem. A data da última revisão fica no topo desta página. Mudanças relevantes são avisadas por e-mail aos clientes ativos.
        </p>
      </>
    ),
  },
];

export default async function PoliticaPrivacidadePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="bg-surface-base">
      <div className="container mx-auto px-5 lg:px-8 pt-24 lg:pt-28 pb-24 lg:pb-32 max-w-3xl">
        <Reveal>
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">
            ❯ documento legal
          </p>
          <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.08] tracking-[-0.03em] mb-4">
            Política de <span className="font-bricolage">privacidade.</span>
          </h1>
          <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed mb-2">
            Como a Notkode coleta, usa e protege os dados pessoais que você compartilha com a gente.
          </p>
          <p className="font-mono text-[11px] text-text-dim">Última atualização: {LAST_UPDATE}</p>
        </Reveal>

        {/* TOC */}
        <Reveal delay={80}>
          <nav className="mt-10 mb-14 rounded-2xl border border-black/[0.08] p-5 lg:p-6 bg-white/40">
            <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">❯ sumário</p>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[13px] leading-relaxed">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-text-secondary hover:text-primary transition-colors">
                    <span className="font-mono text-text-dim mr-2">{String(i + 1).padStart(2, '0')}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </Reveal>

        {/* Sections */}
        <div className="space-y-12">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.id} delay={i * 40}>
              <section id={s.id} className="scroll-mt-24">
                <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
                  ❯ {String(i + 1).padStart(2, '0')}
                </p>
                <h2 className="text-[1.5rem] md:text-[1.75rem] font-semibold tracking-[-0.02em] mb-4">
                  {s.title}
                </h2>
                <div className="prose-policy text-[15px] text-text-secondary leading-relaxed space-y-3">
                  {s.body}
                </div>
              </section>
            </Reveal>
          ))}
        </div>

        {/* Footer */}
        <Reveal delay={400}>
          <div className="mt-16 pt-8 border-t border-black/[0.08] text-center">
            <p className="font-mono text-[11px] text-text-dim">
              Em caso de dúvida, escreva pra{' '}
              <a href={`mailto:${CONTROLLER_EMAIL}`} className="text-primary hover:underline">
                {CONTROLLER_EMAIL}
              </a>
            </p>
          </div>
        </Reveal>
      </div>

      <style>{`
        .prose-policy ul {
          margin: 8px 0;
          padding-left: 22px;
          list-style: disc;
        }
        .prose-policy li {
          margin: 4px 0;
        }
        .prose-policy strong {
          color: hsl(60 2% 10%);
          font-weight: 600;
        }
        .prose-policy a {
          text-decoration: underline;
          text-decoration-color: rgba(59, 130, 246, 0.4);
        }
      `}</style>
    </section>
  );
}
