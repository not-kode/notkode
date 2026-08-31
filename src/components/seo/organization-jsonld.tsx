import { SITE_URL } from '@/lib/seo';

/**
 * Dados estruturados da empresa, em JSON-LD.
 *
 * Existe por um motivo bem concreto: hoje o Google não reconhece "Notkode" como
 * nome de empresa. Quem busca a marca recebe "Exibindo resultados para Not Code"
 * e cai em página de no-code. O site só aparece quando a pessoa força a busca
 * exata, e aí vem em primeiro lugar. Ou seja, o problema não é ranking, é o
 * Google não ter a entidade no catálogo dele.
 *
 * Este bloco é a declaração explícita: isto aqui é uma organização, o nome dela
 * é Notkode, e estes são os dados que a identificam. Não resolve sozinho (perfil
 * no Google Business e menções em outros sites pesam mais), mas é o sinal que
 * sai do nosso lado.
 *
 * Vai só na home: uma declaração por site basta, e o @id abaixo é o endereço
 * canônico dela caso outra página precise referenciar.
 */
export function OrganizationJsonLd({ description }: { description: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Notkode',
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logos/logo-horizontal-dark.png`,
    description,
    // CNPJ e cidade batem com o que o rodapé mostra. Servem de âncora para o
    // Google casar o site com a empresa registrada.
    taxID: '46.733.108/0001-94',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: '+55-11-95138-1254',
      email: 'contato@notkode.com.br',
      areaServed: 'BR',
      availableLanguage: ['pt-BR', 'en'],
    },
    // Perfis oficiais da empresa. É o campo de maior peso aqui: é ele que amarra
    // "Notkode" a uma página que o Google já conhece e confia, e por isso ajuda a
    // desfazer a autocorreção para "not code". Hoje só existe o LinkedIn; quando
    // houver Instagram ou outro perfil oficial, é só somar à lista.
    sameAs: ['https://www.linkedin.com/company/notkode/'],
    founder: [
      {
        '@type': 'Person',
        name: 'Camila Gregório',
        sameAs: 'https://www.linkedin.com/in/gregoriocamila/',
      },
      {
        '@type': 'Person',
        name: 'Matheus Tonelotto',
        sameAs: 'https://www.linkedin.com/in/matheustonelotto/',
      },
      {
        '@type': 'Person',
        name: 'Walter Tonelotto N.',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
