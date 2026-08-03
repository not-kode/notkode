// Carimbo de tempo externo (RFC 3161).
//
// O horário que o sistema grava é o nosso relógio, e a Notkode é parte
// interessada. O carimbo resolve isso: o hash do documento vai a uma autoridade
// de carimbo de tempo, que devolve um token assinado por ela provando que aquele
// hash já existia naquele instante. Se o cliente contestar a data, a prova não
// depende mais da nossa palavra.
//
// A autoridade padrão é gratuita e não é credenciada pelo ITI. Para valor de
// ICP-Brasil seria preciso contratar uma ACT credenciada, e aí basta apontar
// TSA_URL para ela.

const TSA_PADRAO = 'https://freetsa.org/tsr';

export type Carimbo = {
  /** Resposta DER da autoridade, guardada como está para conferência futura. */
  token: Uint8Array;
  /** Instante declarado dentro do token (genTime), em ISO. */
  emitidoEm: string | null;
  autoridade: string;
};

// ── ASN.1 (só o mínimo para montar a requisição) ────────────────────────
function comprimento(n: number): number[] {
  if (n < 0x80) return [n];
  const bytes: number[] = [];
  let resto = n;
  while (resto > 0) {
    bytes.unshift(resto & 0xff);
    resto >>= 8;
  }
  return [0x80 | bytes.length, ...bytes];
}

const bloco = (tag: number, conteudo: number[]): number[] =>
  [tag, ...comprimento(conteudo.length), ...conteudo];

/**
 * TimeStampReq da RFC 3161 para um hash SHA-256:
 *   SEQUENCE { version 1, messageImprint { sha256, hash }, nonce, certReq TRUE }
 */
function montarRequisicao(hashHex: string): Uint8Array {
  const hash = [...hashHex.matchAll(/../g)].map((m) => parseInt(m[0], 16));
  if (hash.length !== 32) throw new Error('hash sha-256 inválido');

  const version = bloco(0x02, [0x01]);
  // AlgorithmIdentifier do sha-256: OID 2.16.840.1.101.3.4.2.1 + NULL.
  const algoritmo = bloco(0x30, [
    ...bloco(0x06, [0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01]),
    ...bloco(0x05, []),
  ]);
  const messageImprint = bloco(0x30, [...algoritmo, ...bloco(0x04, hash)]);

  // Nonce aleatório: liga a resposta a esta requisição.
  const aleatorio = crypto.getRandomValues(new Uint8Array(8));
  const nonce = bloco(0x02, [0x00, ...aleatorio]);

  // certReq TRUE: pede o certificado da autoridade junto, para dar para conferir depois.
  const certReq = bloco(0x01, [0xff]);

  return new Uint8Array(bloco(0x30, [...version, ...messageImprint, ...nonce, ...certReq]));
}

/**
 * Lê o genTime do token: a primeira GeneralizedTime (tag 0x18) do DER.
 *
 * É leitura por varredura, e não um parser de CMS completo: o token inteiro fica
 * guardado do jeito que veio, então a conferência séria continua possível com
 * openssl. Aqui só queremos a data para mostrar na tela.
 */
function lerGenTime(der: Uint8Array): string | null {
  for (let i = 0; i < der.length - 2; i++) {
    if (der[i] !== 0x18) continue;
    const tamanho = der[i + 1];
    if (tamanho < 13 || tamanho > 24 || i + 2 + tamanho > der.length) continue;

    const texto = new TextDecoder().decode(der.subarray(i + 2, i + 2 + tamanho));
    const m = texto.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
    if (!m) continue;

    const [, ano, mes, dia, hora, min, seg] = m;
    return `${ano}-${mes}-${dia}T${hora}:${min}:${seg}Z`;
  }
  return null;
}

/**
 * Pede o carimbo à autoridade. Devolve null quando ela não responde: o carimbo
 * é uma camada extra de prova, então falta dele não pode travar a assinatura.
 */
export async function carimbarHash(hashHex: string): Promise<Carimbo | null> {
  const autoridade = process.env.TSA_URL ?? TSA_PADRAO;
  try {
    const corpo = montarRequisicao(hashHex);
    const resposta = await fetch(autoridade, {
      method: 'POST',
      headers: { 'Content-Type': 'application/timestamp-query' },
      body: corpo as BodyInit,
      signal: AbortSignal.timeout(15_000),
    });

    if (!resposta.ok) {
      console.error('[assinatura] carimbo recusado:', resposta.status);
      return null;
    }

    const token = new Uint8Array(await resposta.arrayBuffer());
    // Resposta boa começa com SEQUENCE e traz o token dentro; abaixo disso é erro.
    if (token.length < 100 || token[0] !== 0x30) {
      console.error('[assinatura] carimbo com resposta inesperada');
      return null;
    }

    return { token, emitidoEm: lerGenTime(token), autoridade };
  } catch (e) {
    console.error('[assinatura] falha ao carimbar:', e);
    return null;
  }
}
