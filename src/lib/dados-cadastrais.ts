/**
 * Lê os dados da empresa de um texto solto e diz qual valor vai em qual campo.
 *
 * Na prática o cadastro para contrato é sempre a mesma cena: procurar o CNPJ no
 * Google, achar um daqueles sites de consulta e copiar razão social, CNPJ,
 * endereço e cidade um por um, campo a campo. Aqui o texto inteiro é colado de
 * uma vez e cada pedaço acha o seu lugar.
 *
 * Funciona com dois formatos, que são os que aparecem:
 *  - texto corrido ("O CNPJ da empresa FULANO LTDA - ME é 40.549.436/0001-59.
 *    Com sede em BRASILIA, DF...")
 *  - lista de rótulos ("Razão Social: ...", "Município: ...", "CEP: ...")
 *
 * O que não for reconhecido fica de fora, sem chutar: campo errado preenchido
 * dá mais trabalho do que campo vazio.
 */

export type DadosCadastrais = {
  legal_name?: string;
  tax_id?: string;
  state_registration?: string;
  legal_rep?: string;
  address_street?: string;
  address_number?: string;
  address_district?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
};

/** Rótulo de cada campo, para dizer o que foi preenchido. */
export const ROTULO_CADASTRAL: Record<keyof DadosCadastrais, string> = {
  legal_name: 'Razão social',
  tax_id: 'CNPJ/CPF',
  state_registration: 'Inscrição estadual',
  legal_rep: 'Representante legal',
  address_street: 'Logradouro',
  address_number: 'Número',
  address_district: 'Bairro',
  address_city: 'Cidade',
  address_state: 'UF',
  address_zip: 'CEP',
};

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

/** Fim de razão social: o que vem depois costuma ser nome fantasia repetido. */
const SUFIXO_SOCIETARIO = /\b(LTDA(?:\s*-?\s*(?:ME|EPP))?|EIRELI|MEI|S\/A|S\.A\.?|SA|ME|EPP|SOCIEDADE\s+SIMPLES(?:\s+LIMITADA)?)\b/i;

const limpar = (s: string) => s.replace(/\s+/g, ' ').trim().replace(/[.,;:]$/, '');

/** Valor de um campo escrito como "Rótulo: valor" (uma linha ou no meio do texto). */
function porRotulo(texto: string, rotulos: string[]): string | undefined {
  for (const r of rotulos) {
    const re = new RegExp(`${r}\\s*[:\\-–]\\s*([^\\n|]+)`, 'i');
    const achado = re.exec(texto)?.[1];
    if (achado && limpar(achado)) return limpar(achado);
  }
  return undefined;
}

export function lerDadosCadastrais(texto: string): DadosCadastrais {
  const t = texto.replace(/ /g, ' ');
  const out: DadosCadastrais = {};

  // ── Documento ──────────────────────────────────────────────────────────────
  const cnpj = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/.exec(t)?.[0]
    ?? /\b\d{14}\b/.exec(t)?.[0];
  const cpf = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/.exec(t)?.[0];
  if (cnpj) {
    out.tax_id = cnpj.length === 14
      ? cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
      : cnpj;
  } else if (cpf) {
    out.tax_id = cpf;
  }

  // ── Razão social ───────────────────────────────────────────────────────────
  const porLabel = porRotulo(t, ['raz[ãa]o\\s+social', 'nome\\s+empresarial']);
  if (porLabel) {
    out.legal_name = porLabel;
  } else {
    // "O CNPJ da empresa FULANO LTDA - ME (nome fantasia) é 00.000..."
    const trecho = /\b(?:da\s+)?empresa\s+(.+?)\s+é\s+\d{2}\./is.exec(t)?.[1];
    if (trecho) {
      const fim = SUFIXO_SOCIETARIO.exec(trecho);
      // Corta no sufixo societário: depois dele vem o nome fantasia repetido.
      out.legal_name = limpar(fim ? trecho.slice(0, fim.index + fim[0].length) : trecho);
    }
  }

  // ── Inscrição estadual e representante ────────────────────────────────────
  const ie = porRotulo(t, ['inscri[çc][ãa]o\\s+estadual', '\\bIE\\b']);
  if (ie) out.state_registration = ie;

  const rep = porRotulo(t, [
    's[óo]cio[- ]administrador', 'representante\\s+legal', 'administrador',
    'respons[áa]vel\\s+legal', 'titular',
  ]);
  if (rep) out.legal_rep = rep;

  // ── Endereço ───────────────────────────────────────────────────────────────
  const cep = /\b\d{5}-?\d{3}\b/.exec(t)?.[0];
  if (cep) out.address_zip = cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep;

  const bairro = porRotulo(t, ['bairro', 'distrito']);
  if (bairro) out.address_district = bairro;

  const logradouroLabel = porRotulo(t, ['logradouro', 'endere[çc]o']);
  const logradouroCru = logradouroLabel
    ?? /\b((?:Rua|Avenida|Av\.?|Travessa|Rodovia|Alameda|Pra[çc]a|Quadra|SRTVS|SIA|SCS|SHIS)[^,\n]{2,60})/i.exec(t)?.[1];
  // Numa linha só ("Av. Paulista nº 1500 - São Paulo/SP - CEP 01310100") o que
  // vem depois do travessão já é outra coisa: cidade, CEP, bairro.
  const logradouro = logradouroCru
    ? limpar(logradouroCru.split(/\s[-–|]\s|\bCEP\b|\bBairro\b|\bMunic[íi]pio\b/i)[0])
    : undefined;
  if (logradouro) {
    // "Rua das Flores, 123" e "Rua das Flores nº 123" trazem o número junto.
    const comNumero = /^(.*?)[,\s]+(?:n[ºo°.]?\s*)?(\d+[A-Za-z]?)$/.exec(limpar(logradouro));
    if (comNumero) {
      out.address_street = limpar(comNumero[1]);
      out.address_number = comNumero[2];
    } else {
      out.address_street = limpar(logradouro);
    }
  }
  const numero = porRotulo(t, ['n[úu]mero']);
  if (numero) out.address_number = numero;

  // ── Cidade e UF ────────────────────────────────────────────────────────────
  const municipio = porRotulo(t, ['munic[íi]pio', 'cidade']);
  const uf = porRotulo(t, ['\\bUF\\b', 'estado']);
  // "Com sede em BRASILIA, DF" / "São Paulo/SP" / "São Paulo - SP"
  const sede = /\b(?:sede\s+em|em)\s+([A-Za-zÀ-ÿ'´` .]{2,40})\s*[,/-]\s*([A-Z]{2})\b/.exec(t);
  const cidadeBarraUf = /\b([A-Za-zÀ-ÿ'´` .]{2,40})\s*[/-]\s*([A-Z]{2})\b/.exec(t);

  const cidade = municipio ?? (sede ? limpar(sede[1]) : cidadeBarraUf ? limpar(cidadeBarraUf[1]) : undefined);
  const sigla = (uf ?? sede?.[2] ?? cidadeBarraUf?.[2] ?? '').toUpperCase();

  if (cidade) out.address_city = cidade;
  if (UFS.includes(sigla)) out.address_state = sigla;

  return out;
}
