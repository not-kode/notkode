import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Reveal } from '@/components/ui/reveal';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Privacy' });
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    robots: { index: true, follow: true },
  };
}

const LAST_UPDATE_PT = '18 de maio de 2026';
const LAST_UPDATE_EN = 'May 18, 2026';
const CONTROLLER_EMAIL = 'camila@notkode.com.br';

type Section = { id: string; title: string; body: React.ReactNode };

const SECTIONS_PT: Section[] = [
  {
    id: 'quem-somos',
    title: 'Quem somos',
    body: (
      <>
        <p>Notkode é uma empresa de tecnologia que desenvolve sistemas, automações e identidade visual sob medida. Atuamos como <strong>controladora</strong> dos dados pessoais que você nos envia através deste site.</p>
        <p>Para qualquer assunto relacionado a este documento ou aos seus direitos como titular, fale com a gente em <a href={`mailto:${CONTROLLER_EMAIL}`} className="text-primary hover:underline">{CONTROLLER_EMAIL}</a>.</p>
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
        <p>Não coletamos dados sensíveis (origem racial, religião, opinião política, saúde, etc.) e não armazenamos dados de cartão. Se você tem menos de 18 anos, não preencha os formulários sem autorização do responsável.</p>
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
        <p>Não vendemos, alugamos ou usamos seus dados para construir perfis publicitários.</p>
      </>
    ),
  },
  {
    id: 'compartilhamento',
    title: 'Com quem compartilhamos',
    body: (
      <>
        <p>Para operar o site e o atendimento, usamos serviços terceiros que processam dados em nosso nome:</p>
        <ul>
          <li><strong>Supabase</strong>, banco de dados onde os leads são registrados (servidor em São Paulo, Brasil).</li>
          <li><strong>Resend</strong>, envio das notificações por e-mail.</li>
          <li><strong>Vercel</strong>, hospedagem do site.</li>
          <li><strong>WhatsApp</strong> (Meta), quando você opta por continuar a conversa por lá.</li>
        </ul>
        <p>Todos estão sujeitos a contratos que exigem o mesmo nível de proteção que praticamos. Em nenhuma hipótese repassamos seus dados para empresas que não estejam diretamente envolvidas no atendimento do seu projeto.</p>
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
        <p>Pra exercer qualquer desses direitos, escreva pra <a href={`mailto:${CONTROLLER_EMAIL}`} className="text-primary hover:underline">{CONTROLLER_EMAIL}</a> com o assunto <em>LGPD</em>. Respondemos em até 15 dias.</p>
      </>
    ),
  },
  {
    id: 'seguranca',
    title: 'Segurança',
    body: (
      <>
        <p>O site usa HTTPS em todas as páginas. O acesso ao banco de dados é restrito por chaves de servidor que nunca são expostas no navegador. Apenas a Camila tem acesso ao painel administrativo.</p>
        <p>Mesmo assim, nenhum sistema é 100% imune. Se identificarmos um incidente que afete seus dados, comunicamos você e a ANPD nos prazos exigidos.</p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies e rastreamento',
    body: (
      <>
        <p>Hoje o site não usa cookies de analytics nem pixels publicitários. Quando começarmos a usar (por exemplo, GA4 ou Plausible), atualizamos esta política e exibimos o aviso de cookies no rodapé.</p>
      </>
    ),
  },
  {
    id: 'mudancas',
    title: 'Mudanças nesta política',
    body: (
      <>
        <p>Podemos atualizar esse documento conforme o site ou a legislação mudarem. A data da última revisão fica no topo desta página. Mudanças relevantes são avisadas por e-mail aos clientes ativos.</p>
      </>
    ),
  },
];

const SECTIONS_EN: Section[] = [
  {
    id: 'quem-somos',
    title: 'Who we are',
    body: (
      <>
        <p>Notkode is a technology company that develops custom systems, automations, and visual identity. We act as the <strong>controller</strong> of the personal data you send through this site.</p>
        <p>For anything related to this document or your rights as a data subject, reach us at <a href={`mailto:${CONTROLLER_EMAIL}`} className="text-primary hover:underline">{CONTROLLER_EMAIL}</a>.</p>
      </>
    ),
  },
  {
    id: 'quais-dados',
    title: 'What data we collect',
    body: (
      <>
        <p>When you fill out a form on the site, we collect:</p>
        <ul>
          <li>Name</li>
          <li>Email</li>
          <li>Phone / WhatsApp</li>
          <li>Messages, notes, and answers you add freely</li>
          <li>Source page of the submission</li>
          <li>Campaign parameters (UTMs) if you came from an ad link</li>
        </ul>
        <p>{"We don't collect sensitive data (race, religion, political opinion, health, etc.) and we don't store card data. If you're under 18, don't fill out the forms without parental consent."}</p>
      </>
    ),
  },
  {
    id: 'finalidade',
    title: 'What we use it for',
    body: (
      <>
        <p>Data is used strictly to:</p>
        <ul>
          <li>Reply to your inquiry and validate the project scope</li>
          <li>Send the detailed proposal by email and WhatsApp</li>
          <li>Track the lead until project close (or drop)</li>
          <li>Occasionally share relevant news about our work, always with a clear opt-out in every message</li>
        </ul>
        <p>{"We don't sell, rent, or use your data to build advertising profiles."}</p>
      </>
    ),
  },
  {
    id: 'compartilhamento',
    title: 'Who we share with',
    body: (
      <>
        <p>To run the site and the customer journey, we use third-party services that process data on our behalf:</p>
        <ul>
          <li><strong>Supabase</strong>, database where leads are stored (server in São Paulo, Brazil).</li>
          <li><strong>Resend</strong>, sending email notifications.</li>
          <li><strong>Vercel</strong>, site hosting.</li>
          <li><strong>WhatsApp</strong> (Meta), when you choose to continue the conversation there.</li>
        </ul>
        <p>{"All are subject to contracts requiring the same level of protection we apply. We never pass your data to companies that aren't directly involved in serving your project."}</p>
      </>
    ),
  },
  {
    id: 'retencao',
    title: 'How long we keep it',
    body: (
      <>
        <ul>
          <li><strong>Active leads:</strong> while the project is being discussed or in progress.</li>
          <li><strong>Dropped leads:</strong> up to 24 months after the last contact, for commercial history.</li>
          <li><strong>Active clients:</strong> for the legally required period (minimum 5 years from the end of the contract, for tax and civil purposes).</li>
        </ul>
        <p>After these periods, data is deleted or anonymized.</p>
      </>
    ),
  },
  {
    id: 'direitos',
    title: 'Your rights as a data subject',
    body: (
      <>
        <p>Under the Brazilian LGPD (Law 13.709/2018), at any time you can:</p>
        <ul>
          <li>Confirm whether we hold data about you</li>
          <li>Access the data we hold</li>
          <li>Correct outdated or incomplete data</li>
          <li>Request anonymization, blocking, or deletion</li>
          <li>Request portability to another provider</li>
          <li>Withdraw the consent you gave us</li>
          <li>Know with whom we share your data</li>
        </ul>
        <p>To exercise any of these rights, write to <a href={`mailto:${CONTROLLER_EMAIL}`} className="text-primary hover:underline">{CONTROLLER_EMAIL}</a> with the subject <em>LGPD</em>. We reply within 15 days.</p>
      </>
    ),
  },
  {
    id: 'seguranca',
    title: 'Security',
    body: (
      <>
        <p>The site uses HTTPS on every page. Database access is restricted by server keys never exposed in the browser. Only Camila has access to the admin panel.</p>
        <p>{"Even so, no system is 100% immune. If we identify an incident affecting your data, we'll notify you and ANPD within the required timeframes."}</p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and tracking',
    body: (
      <>
        <p>{"Today the site doesn't use analytics cookies or advertising pixels. When we start (for example, GA4 or Plausible), we'll update this policy and show a cookie notice in the footer."}</p>
      </>
    ),
  },
  {
    id: 'mudancas',
    title: 'Changes to this policy',
    body: (
      <>
        <p>We may update this document as the site or legislation change. The date of the last revision sits at the top of this page. Material changes are announced by email to active clients.</p>
      </>
    ),
  },
];

const PT_COPY = {
  legalEyebrow: '❯ documento legal',
  titlePre: 'Política de',
  titleAccent: 'privacidade.',
  intro: 'Como a Notkode coleta, usa e protege os dados pessoais que você compartilha com a gente.',
  lastUpdateLabel: 'Última atualização:',
  tocLabel: '❯ sumário',
  footerLabel: 'Em caso de dúvida, escreva pra',
};

const EN_COPY = {
  legalEyebrow: '❯ legal document',
  titlePre: 'Privacy',
  titleAccent: 'policy.',
  intro: 'How Notkode collects, uses, and protects the personal data you share with us.',
  lastUpdateLabel: 'Last updated:',
  tocLabel: '❯ contents',
  footerLabel: 'Questions, write to',
};

export default async function PoliticaPrivacidadePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEN = locale === 'en';
  const SECTIONS = isEN ? SECTIONS_EN : SECTIONS_PT;
  const COPY = isEN ? EN_COPY : PT_COPY;
  const LAST_UPDATE = isEN ? LAST_UPDATE_EN : LAST_UPDATE_PT;

  return (
    <section className="bg-surface-base">
      <div className="container mx-auto px-5 lg:px-8 pt-24 lg:pt-28 pb-24 lg:pb-32 max-w-3xl">
        <Reveal>
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">{COPY.legalEyebrow}</p>
          <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.08] tracking-[-0.03em] mb-4">
            {COPY.titlePre} <span className="font-bricolage">{COPY.titleAccent}</span>
          </h1>
          <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed mb-2">{COPY.intro}</p>
          <p className="font-mono text-[11px] text-text-dim">{COPY.lastUpdateLabel} {LAST_UPDATE}</p>
        </Reveal>

        <Reveal delay={80}>
          <nav className="mt-10 mb-14 rounded-2xl border border-black/[0.08] p-5 lg:p-6 bg-white/40">
            <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">{COPY.tocLabel}</p>
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

        <div className="space-y-12">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.id} delay={i * 40}>
              <section id={s.id} className="scroll-mt-24">
                <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-2">
                  ❯ {String(i + 1).padStart(2, '0')}
                </p>
                <h2 className="text-[1.5rem] md:text-[1.75rem] font-semibold tracking-[-0.02em] mb-4">{s.title}</h2>
                <div className="prose-policy text-[15px] text-text-secondary leading-relaxed space-y-3">{s.body}</div>
              </section>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <div className="mt-16 pt-8 border-t border-black/[0.08] text-center">
            <p className="font-mono text-[11px] text-text-dim">
              {COPY.footerLabel}{' '}
              <a href={`mailto:${CONTROLLER_EMAIL}`} className="text-primary hover:underline">{CONTROLLER_EMAIL}</a>
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
