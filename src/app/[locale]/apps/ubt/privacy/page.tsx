import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { seoAlternates } from '@/lib/seo';
import { Reveal } from '@/components/ui/reveal';

// Política de privacidade do UBT (Ultimate BJJ Timer), o timer de jiu-jitsu.
//
// Mora aqui, e não junto da política da Notkode, porque trata de um produto
// específico: quem publica um app precisa dar às lojas um endereço estável que
// fale só daquele app, e é este endereço que vai na ficha da App Store e do
// Google Play.
//
// O texto é o mesmo do documento mantido no repositório do app
// (docs/politica-de-privacidade.md). Se um mudar, o outro tem que acompanhar,
// senão o app passa a prometer uma coisa e a loja a apontar para outra.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEN = locale === 'en';
  return {
    title: isEN
      ? 'Privacy Policy | UBT: Ultimate BJJ Timer'
      : 'Política de Privacidade | UBT: Ultimate BJJ Timer',
    description: isEN
      ? 'What UBT does with data. Short version: no signup, no account, and your training sessions never leave your phone.'
      : 'O que o UBT faz com dados. O resumo é curto: não tem cadastro, não cria conta e seus treinos não saem do seu celular.',
    robots: { index: true, follow: true },
    alternates: seoAlternates(locale, '/apps/ubt/privacy'),
  };
}

const LAST_UPDATE_PT = '1 de agosto de 2026';
const LAST_UPDATE_EN = 'August 1, 2026';
const CONTACT_EMAIL = 'matheustonelotto@icloud.com';

const GOOGLE_PRIVACY = 'https://policies.google.com/privacy';
const GOOGLE_PARTNERS = 'https://policies.google.com/technologies/partner-sites';
const EXPO_PRIVACY = 'https://expo.dev/privacy';

type Section = { id: string; title: string; body: React.ReactNode };

const link = (href: string, label: string) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary hover:underline"
  >
    {label}
  </a>
);

const SECTIONS_PT: Section[] = [
  {
    id: 'responsavel',
    title: 'Quem é o responsável',
    body: (
      <>
        <p>Matheus Tonelotto</p>
        <p>
          Contato:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </>
    ),
  },
  {
    id: 'no-aparelho',
    title: 'O que fica no seu aparelho',
    body: (
      <>
        <p>Tudo que você configura no app é gravado apenas no próprio celular:</p>
        <ul>
          <li>os treinos que você cria, com rounds, duração e descanso;</li>
          <li>qual treino está selecionado;</li>
          <li>suas escolhas de som, vibração, volume, idioma e tela ligada.</li>
        </ul>
        <p>
          Esses dados não são enviados para nós nem para terceiros, não são usados para identificar
          você e desaparecem quando o app é desinstalado. Não temos servidor nem banco de dados com
          informações de usuários.
        </p>
      </>
    ),
  },
  {
    id: 'nao-coleta',
    title: 'O que o app não coleta',
    body: (
      <p>
        O UBT não pede nem acessa nome, e-mail, telefone, localização, contatos, fotos, microfone,
        câmera, saúde ou qualquer dado biométrico.
      </p>
    ),
  },
  {
    id: 'anuncios',
    title: 'Anúncios',
    body: (
      <>
        <p>
          O app é gratuito e exibe anúncios através do <strong>Google AdMob</strong>, um serviço do
          Google. Um anúncio aparece na abertura do app, e nunca durante um treino em andamento.
        </p>
        <p>Para exibir e medir anúncios, o AdMob pode coletar e processar:</p>
        <ul>
          <li>
            o identificador de publicidade do aparelho (IDFA no iOS, ID de publicidade do Google no
            Android);
          </li>
          <li>dados aproximados de dispositivo e sistema operacional;</li>
          <li>informações de interação com o anúncio, como exibições e cliques.</li>
        </ul>
        <p>Esse tratamento é feito pelo Google, não por nós, e segue as políticas dele:</p>
        <ul>
          <li>{link(GOOGLE_PRIVACY, 'Política de Privacidade do Google')}</li>
          <li>
            {link(GOOGLE_PARTNERS, 'Como o Google usa dados de apps e sites que utilizam seus serviços')}
          </li>
        </ul>
        <p>
          No iOS, o sistema pede sua autorização antes de permitir o uso do identificador de
          publicidade para rastreamento. Se você recusar, o app continua funcionando igual e os
          anúncios passam a ser não personalizados.
        </p>
      </>
    ),
  },
  {
    id: 'atualizacoes',
    title: 'Atualizações do app',
    body: (
      <>
        <p>
          O UBT usa o serviço de atualização da Expo (EAS Update) para receber correções sem passar
          por uma nova versão na loja. Nesse processo, o aparelho consulta um servidor da Expo para
          saber se existe atualização disponível. Não enviamos dados pessoais nessa consulta.
        </p>
        <p>{link(EXPO_PRIVACY, 'Política de Privacidade da Expo')}</p>
      </>
    ),
  },
  {
    id: 'direitos',
    title: 'Seus direitos',
    body: (
      <>
        <p>
          Como o app não coleta dados pessoais nossos, não há cadastro para consultar, corrigir ou
          excluir do nosso lado. Sobre os dados tratados pelo Google para anúncios, você pode:
        </p>
        <ul>
          <li>
            <strong>iOS:</strong> Ajustes, Privacidade e Segurança, Rastreamento, para revogar a
            autorização a qualquer momento.
          </li>
          <li>
            <strong>Android:</strong> Configurações, Google, Anúncios, para redefinir ou excluir o ID
            de publicidade.
          </li>
        </ul>
        <p>Para apagar tudo que o app guardou no aparelho, basta desinstalá-lo.</p>
        <p>
          Se você tiver dúvidas ou quiser exercer algum direito previsto na LGPD (Lei 13.709/2018) ou
          no GDPR, escreva para{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'criancas',
    title: 'Crianças',
    body: (
      <p>
        O UBT não é direcionado a crianças e não coleta conscientemente dados de menores de 13 anos.
      </p>
    ),
  },
  {
    id: 'mudancas',
    title: 'Mudanças nesta política',
    body: (
      <p>
        Se esta política mudar, a data no topo será atualizada. Alterações relevantes serão
        comunicadas na própria página.
      </p>
    ),
  },
];

const SECTIONS_EN: Section[] = [
  {
    id: 'responsavel',
    title: 'Who is responsible',
    body: (
      <>
        <p>Matheus Tonelotto</p>
        <p>
          Contact:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </>
    ),
  },
  {
    id: 'no-aparelho',
    title: 'What stays on your device',
    body: (
      <>
        <p>Everything you set up in the app is saved on the phone itself:</p>
        <ul>
          <li>the training sessions you create, with rounds, duration and rest;</li>
          <li>which session is currently selected;</li>
          <li>your choices for sound, vibration, volume, language and keeping the screen on.</li>
        </ul>
        <p>
          This data is never sent to us or to third parties, is not used to identify you, and
          disappears when the app is uninstalled. We have no server and no database holding user
          information.
        </p>
      </>
    ),
  },
  {
    id: 'nao-coleta',
    title: 'What the app does not collect',
    body: (
      <p>
        UBT never asks for or accesses your name, email, phone number, location, contacts, photos,
        microphone, camera, health or any biometric data.
      </p>
    ),
  },
  {
    id: 'anuncios',
    title: 'Ads',
    body: (
      <>
        <p>
          The app is free and shows ads through <strong>Google AdMob</strong>, a Google service. One
          ad appears when the app opens, and never during a session in progress.
        </p>
        <p>To serve and measure ads, AdMob may collect and process:</p>
        <ul>
          <li>
            the device advertising identifier (IDFA on iOS, Google Advertising ID on Android);
          </li>
          <li>approximate device and operating system data;</li>
          <li>ad interaction information, such as impressions and clicks.</li>
        </ul>
        <p>This processing is done by Google, not by us, and follows their policies:</p>
        <ul>
          <li>{link(GOOGLE_PRIVACY, 'Google Privacy Policy')}</li>
          <li>{link(GOOGLE_PARTNERS, 'How Google uses data from apps and sites that use its services')}</li>
        </ul>
        <p>
          On iOS, the system asks for your permission before allowing the advertising identifier to
          be used for tracking. If you decline, the app keeps working exactly the same and the ads
          become non-personalized.
        </p>
      </>
    ),
  },
  {
    id: 'atualizacoes',
    title: 'App updates',
    body: (
      <>
        <p>
          UBT uses Expo&apos;s update service (EAS Update) to receive fixes without shipping a new
          store version. In that process, the device asks an Expo server whether an update is
          available. No personal data is sent in that request.
        </p>
        <p>{link(EXPO_PRIVACY, 'Expo Privacy Policy')}</p>
      </>
    ),
  },
  {
    id: 'direitos',
    title: 'Your rights',
    body: (
      <>
        <p>
          Since the app collects no personal data of ours, there is no record on our side to access,
          correct or delete. Regarding the data Google processes for ads, you can:
        </p>
        <ul>
          <li>
            <strong>iOS:</strong> Settings, Privacy &amp; Security, Tracking, to withdraw permission
            at any time.
          </li>
          <li>
            <strong>Android:</strong> Settings, Google, Ads, to reset or delete the advertising ID.
          </li>
        </ul>
        <p>To erase everything the app stored on your device, just uninstall it.</p>
        <p>
          If you have questions or want to exercise any right under the Brazilian LGPD (Law
          13.709/2018) or the GDPR, write to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'criancas',
    title: 'Children',
    body: (
      <p>
        UBT is not directed at children and does not knowingly collect data from anyone under 13.
      </p>
    ),
  },
  {
    id: 'mudancas',
    title: 'Changes to this policy',
    body: (
      <p>
        If this policy changes, the date at the top will be updated. Material changes will be
        announced on this page.
      </p>
    ),
  },
];

const PT_COPY = {
  legalEyebrow: '❯ documento legal',
  appLabel: 'UBT: Ultimate BJJ Timer',
  titlePre: 'Política de',
  titleAccent: 'privacidade.',
  intro:
    'Esta política explica o que o UBT faz com dados. O resumo é curto: o app não tem cadastro, não cria conta e não envia seus treinos para lugar nenhum.',
  lastUpdateLabel: 'Última atualização:',
  tocLabel: '❯ sumário',
  footerLabel: 'Em caso de dúvida, escreva pra',
};

const EN_COPY = {
  legalEyebrow: '❯ legal document',
  appLabel: 'UBT: Ultimate BJJ Timer',
  titlePre: 'Privacy',
  titleAccent: 'policy.',
  intro:
    'This policy explains what UBT does with data. The short version: the app has no signup, creates no account, and never sends your training sessions anywhere.',
  lastUpdateLabel: 'Last updated:',
  tocLabel: '❯ contents',
  footerLabel: 'Questions, write to',
};

export default async function UbtPrivacyPage({
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
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">
            {COPY.legalEyebrow}
          </p>
          <p className="font-mono text-[11px] text-primary uppercase tracking-widest mb-3">
            {COPY.appLabel}
          </p>
          <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold leading-[1.08] tracking-[-0.03em] mb-4">
            {COPY.titlePre} <span className="font-bricolage">{COPY.titleAccent}</span>
          </h1>
          <p className="text-[15px] lg:text-[16px] text-text-secondary leading-relaxed mb-2">
            {COPY.intro}
          </p>
          <p className="font-mono text-[11px] text-text-dim">
            {COPY.lastUpdateLabel} {LAST_UPDATE}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <nav className="mt-10 mb-14 rounded-2xl border border-black/[0.08] p-5 lg:p-6 bg-white/40">
            <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">
              {COPY.tocLabel}
            </p>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[13px] leading-relaxed">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    <span className="font-mono text-text-dim mr-2">
                      {String(i + 1).padStart(2, '0')}
                    </span>
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

        <Reveal delay={400}>
          <div className="mt-16 pt-8 border-t border-black/[0.08] text-center">
            <p className="font-mono text-[11px] text-text-dim">
              {COPY.footerLabel}{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
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
