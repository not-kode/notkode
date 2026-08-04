import { ACCESS_EMAIL } from '@/lib/onboarding-schema';
import type { BriefingRow } from './onboarding-view';

// ─────────────────────────────────────────────────────────────────────────
// "Retorno pro cliente": a partir das respostas do briefing, monta uma
// mensagem de WhatsApp na voz da Notkode. Ela:
//   • pede o que falta de acessos (Meta, Google, gateway de pagamento,
//     Bling/Tiny p/ logística, DNS) — o que não existir, o cliente cria e
//     nos convida;
//   • cobra a identidade visual completa (logo vetor, cores, fontes, manual);
//   • pede fotos e vídeos reais do produto;
//   • revisa a parte do produto e devolve as dúvidas/lacunas.
// Adapta ao que o cliente já indicou ter — não repete o que já foi feito.
// ─────────────────────────────────────────────────────────────────────────

/** Prazo padrão de retorno do cliente, em dias. */
export const REQUEST_DEADLINE_DAYS = 7;

function read(r: BriefingRow, id: string): string {
  const v = r.respostas[id];
  if (Array.isArray(v)) return v.join(', ');
  return (v ?? '').trim();
}

/** Junta uma lista em texto natural: "A, B e C". */
function humanList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}

/** Data-limite formatada (hoje + prazo). */
export function deadlineLabel(days = REQUEST_DEADLINE_DAYS): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d);
}

/** Mensagem de WhatsApp pronta pra colar, na voz da Notkode. */
export function buildClientMessage(r: BriefingRow): string {
  // As cobranças de gateway/Bling/Ads são do briefing de PRODUTO; social tem
  // a sua (oferta e material da loja); os demais templates (site, sistema,
  // agentes, identidade) usam a mensagem genérica.
  if (r.template === 'social') return buildSocialMessage(r);
  if (r.template !== 'produto') return buildGenericMessage(r);

  const deadline = deadlineLabel();
  const p: string[] = [];

  p.push(`Oi, ${r.orgName}! Tudo bem? 🙌`);
  p.push(
    'Recebi seu briefing por aqui, ficou ótimo — muito obrigado! Pra eu já colocar a mão na massa e começar a montar sua estrutura, preciso de algumas coisas suas ' +
      `nos próximos ${REQUEST_DEADLINE_DAYS} dias (até ${deadline}):`,
  );

  // 1) Contas & acessos ────────────────────────────────────────────────
  const convites: string[] = [];
  if (read(r, 'acesso_meta') !== 'Convite enviado') convites.push('Meta Business (Instagram/Facebook)');
  const googleEnviado = read(r, 'acesso_google') === 'Convite enviado';
  if (!googleEnviado) convites.push('Google Ads');
  convites.push('seu gateway de pagamento');
  convites.push('o Bling ou o Tiny (logística/estoque)');

  const linhasAcesso: string[] = [];
  linhasAcesso.push(
    `1️⃣ *Acessos* — me convide como administrador (${ACCESS_EMAIL}) no ${humanList(convites)}. ` +
      'O que ainda não existir, é só criar a conta e me convidar.',
  );
  linhasAcesso.push(
    '→ Me conta também qual gateway de pagamento você usa (ou pretende usar) e se já trabalha com Bling ou Tiny — se ainda não, a gente decide junto qual criar.',
  );
  if (googleEnviado && !read(r, 'acesso_google_id')) {
    linhasAcesso.push('→ Me passa o ID da conta do Google Ads (000-000-0000).');
  }
  const dominio = read(r, 'acesso_dominio');
  linhasAcesso.push(`→ E me dá acesso ao DNS do domínio${dominio ? ` (${dominio})` : ''}.`);
  if (read(r, 'site_atual') === 'Sim') {
    const url = read(r, 'site_url');
    linhasAcesso.push(`→ Acesso ao site atual${url ? ` (${url})` : ''}.`);
  }
  p.push(linhasAcesso.join('\n'));

  // 2) Identidade visual completa ──────────────────────────────────────
  const temId = read(r, 'tem_identidade');
  if (temId === 'Não tenho' || temId === '') {
    p.push(
      '2️⃣ *Identidade visual* — como você ainda não tem, me manda referências de marcas e estilos que curte que eu crio a sua (logo, cores e fontes).',
    );
  } else {
    p.push(
      '2️⃣ *Identidade visual completa* — logo em vetor (arquivo editável, não só imagem), cores, fontes e o manual da marca, se tiver.',
    );
  }

  // 3) Fotos e vídeos ──────────────────────────────────────────────────
  const temFotos = read(r, 'tem_fotos');
  if (temFotos === 'Ainda não' || temFotos === '') {
    p.push('3️⃣ *Fotos e vídeos* — você marcou que ainda não tem, então a gente já alinha a produção das fotos e vídeos do produto.');
  } else {
    p.push('3️⃣ *Fotos e vídeos reais do produto* — me manda os arquivos em alta.');
  }

  // 4) Revisão do produto ──────────────────────────────────────────────
  const duvidas: string[] = [];
  if (!read(r, 'modelo_venda')) duvidas.push('como o produto é vendido (unidade, kit, assinatura)');
  if (!read(r, 'preco_venda')) duvidas.push('o preço de venda de cada versão, kit ou plano');
  if (!read(r, 'custo_unidade')) duvidas.push('seu custo por unidade');
  if (!read(r, 'entrega')) duvidas.push('como funciona a entrega e o prazo médio');
  if (duvidas.length > 0) {
    p.push(
      `Sobre o produto, dei uma revisada e ficou faltando me confirmar: ${humanList(duvidas)}. Pode me passar?`,
    );
  } else {
    p.push('Sobre o produto, revisei tudo e ficou claro — se mudar algo (preço, custo ou prazo), é só me avisar.');
  }

  p.push(
    'Assim que isso chegar, eu já começo a produzir tudo. Qualquer dúvida em algum item, me chama por aqui! 🚀',
  );

  return p.join('\n\n');
}

/**
 * Retorno do briefing de social media: cobra o que trava o calendário do mês
 * (oferta com preço, restrição, produtos dos anúncios), o acesso ao Meta e o
 * material da loja. Só pede o que ficou em branco.
 */
function buildSocialMessage(r: BriefingRow): string {
  const deadline = deadlineLabel();
  const p: string[] = [];

  p.push(`Oi, ${r.orgName}! Tudo bem? 🙌`);
  p.push(
    'Recebi seu briefing, obrigada! Pra eu fechar o calendário do mês e começar a produzir, ' +
      `me falta pouca coisa (se der, até ${deadline}):`,
  );

  const faltando: string[] = [];
  if (!read(r, 'social_ofertas')) faltando.push('os produtos em promoção com preço e validade');
  if (!read(r, 'social_destaques')) faltando.push('o que você quer girar neste mês');
  if (!read(r, 'social_restricoes')) faltando.push('o que não pode ser anunciado');
  if (!read(r, 'social_anuncios_produtos')) faltando.push('os produtos dos criativos de anúncio, com preço e condição');
  if (!read(r, 'social_datas')) faltando.push('as datas do mês que valem aproveitar');
  if (faltando.length > 0) {
    p.push(`1️⃣ *Oferta do mês* — ficou faltando ${humanList(faltando)}.`);
  } else {
    p.push('1️⃣ *Oferta do mês* — a parte comercial ficou completa, já consigo montar a grade em cima dela.');
  }

  const acessoMeta = read(r, 'social_acesso_meta');
  if (acessoMeta !== 'Convite enviado') {
    p.push(
      `2️⃣ *Acesso* — me convide como administradora (${ACCESS_EMAIL}) no Meta Business, que é o que dá acesso ao Instagram e ao Facebook. ` +
        'Se preferir, te mando o passo a passo em print.',
    );
  }

  const fotos = read(r, 'social_fotos');
  const responsavel = read(r, 'social_fotos_responsavel');
  if (fotos === 'Não temos' || fotos === '') {
    p.push('3️⃣ *Fotos* — como não temos material, vou usar foto de catálogo por enquanto. Qualquer foto da loja e dos produtos que vocês tirarem no celular já ajuda muito.');
  } else if (!responsavel) {
    p.push('3️⃣ *Fotos* — me diz quem da equipe fica responsável por mandar as fotos e as novidades da loja, e por qual número.');
  }

  if (read(r, 'social_transicao')) {
    p.push('Sobre a agência atual, anotei até quando ela publica; vou emendar o calendário pra não ficar nenhum dia com o perfil parado.');
  }

  p.push(
    'Assim que isso chegar, eu monto o calendário completo e te mando pra aprovação antes de publicar qualquer coisa. Qualquer dúvida, me chama! 🚀',
  );

  return p.join('\n\n');
}

/** Mensagem de retorno dos templates não-produto: acessos básicos + identidade + materiais. */
function buildGenericMessage(r: BriefingRow): string {
  const deadline = deadlineLabel();
  const p: string[] = [];

  p.push(`Oi, ${r.orgName}! Tudo bem? 🙌`);
  p.push(
    'Recebi seu briefing por aqui, ficou ótimo — muito obrigado! Pra eu já colocar a mão na massa, preciso de algumas coisas suas ' +
      `nos próximos ${REQUEST_DEADLINE_DAYS} dias (até ${deadline}):`,
  );

  const linhasAcesso: string[] = [];
  const dominio = read(r, 'acesso_dominio');
  linhasAcesso.push(
    `1️⃣ *Acessos* — me dá acesso ao DNS do domínio${dominio ? ` (${dominio})` : ''} convidando ${ACCESS_EMAIL} como administrador. O que ainda não existir, é só criar a conta e me convidar.`,
  );
  if (read(r, 'site_atual') === 'Sim') {
    const url = read(r, 'site_url');
    linhasAcesso.push(`→ Acesso ao site atual${url ? ` (${url})` : ''}.`);
  }
  p.push(linhasAcesso.join('\n'));

  const temId = read(r, 'tem_identidade') || read(r, 'id_logo');
  if (temId === 'Não tenho' || temId === '') {
    p.push(
      '2️⃣ *Identidade visual* — como você ainda não tem, me manda referências de marcas e estilos que curte que eu já levo isso em conta.',
    );
  } else {
    p.push(
      '2️⃣ *Identidade visual completa* — logo em vetor (arquivo editável, não só imagem), cores, fontes e o manual da marca, se tiver.',
    );
  }

  const materiais = read(r, 'link_materiais');
  p.push(
    materiais
      ? '3️⃣ *Materiais* — vi que você já me passou a pasta, vou revisar e te aviso se faltar algo. Se tiver fotos e vídeos em alta, joga lá também.'
      : '3️⃣ *Materiais* — me manda uma pasta (Drive/Dropbox) com fotos, vídeos e qualquer material da marca em alta.',
  );

  p.push(
    'Assim que isso chegar, eu já começo a produzir tudo. Qualquer dúvida em algum item, me chama por aqui! 🚀',
  );

  return p.join('\n\n');
}
