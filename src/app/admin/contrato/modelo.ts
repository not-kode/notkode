// O que um modelo de contrato guarda, e o modelo embutido de fábrica.
//
// Bloco de texto é livre e aceita marcadores; os outros tipos são montados pelo
// sistema porque dependem dos dados do contrato (parcelas, datas, obrigações).

export const TIPOS_DE_BLOCO = [
  'texto',
  'objeto',
  'obrigacoes_cliente',
  'obrigacoes_contratada',
  'pagamento',
  'vigencia',
  'assinatura_eletronica',
  'foro',
] as const;
export type TipoDeBloco = (typeof TIPOS_DE_BLOCO)[number];

export type Bloco = {
  tipo: TipoDeBloco;
  /** Título da cláusula, sem o "Cláusula Primeira – ", que é numerado na hora. */
  titulo: string;
  /** Só para o tipo texto: cada linha vira um item numerado (1.1, 1.2…). */
  texto?: string;
};

export type Modelo = {
  id: string | null;
  nome: string;
  descricao: string | null;
  escopo_padrao: string | null;
  clausulas: Bloco[];
};

/** Rótulo de cada tipo, para a tela de edição do modelo. */
export const ROTULO_DO_BLOCO: Record<TipoDeBloco, string> = {
  texto: 'Texto livre',
  objeto: 'Objeto (escopo do contrato)',
  obrigacoes_cliente: 'Obrigações da CONTRATANTE',
  obrigacoes_contratada: 'Obrigações da CONTRATADA',
  pagamento: 'Valor e pagamento (parcelas)',
  vigencia: 'Prazo e renovação (datas)',
  assinatura_eletronica: 'Assinatura eletrônica',
  foro: 'Foro',
};

/** O que cada bloco automático puxa sozinho, explicado na tela. */
export const EXPLICACAO_DO_BLOCO: Record<TipoDeBloco, string> = {
  texto: 'Você escreve. Cada linha vira um item numerado.',
  objeto: 'Usa o escopo preenchido no contrato, e cita a proposta anexa quando houver.',
  obrigacoes_cliente: 'Usa as obrigações da CONTRATANTE preenchidas no contrato.',
  obrigacoes_contratada: 'Usa as obrigações da CONTRATADA preenchidas no contrato.',
  pagamento: 'Monta valor, dia de vencimento e o cronograma real das parcelas.',
  vigencia: 'Monta a vigência a partir das datas, e acrescenta a renovação do contrato.',
  assinatura_eletronica: 'Só aparece quando o documento vai para assinatura no sistema.',
  foro: 'Foro da comarca de São Paulo.',
};

/**
 * Modelo de fábrica: é exatamente o contrato que o sistema gerava antes de
 * existirem modelos. Serve de ponto de partida e de rede de segurança quando
 * nenhum modelo está cadastrado.
 */
export const MODELO_DE_FABRICA: Modelo = {
  id: null,
  nome: 'Padrão Notkode',
  descricao: 'Contrato de prestação de serviços, base para os demais modelos.',
  escopo_padrao: null,
  clausulas: [
    { tipo: 'objeto', titulo: 'Do Objeto' },
    { tipo: 'obrigacoes_cliente', titulo: 'Das Obrigações da Contratante' },
    { tipo: 'obrigacoes_contratada', titulo: 'Das Obrigações da Contratada' },
    { tipo: 'pagamento', titulo: 'Do Valor e Condições de Pagamento' },
    {
      tipo: 'texto',
      titulo: 'Dos Custos de Terceiros',
      texto: [
        'Eventuais custos de uso de APIs, integrações e modelos de IA de provedores terceiros, quando aplicáveis ao escopo contratado, são de responsabilidade da CONTRATANTE, cobrados diretamente pelos respectivos provedores, e não estão inclusos no valor deste contrato.',
        'A CONTRATADA não responde por indisponibilidade, alteração de política ou alteração de preço dos serviços de terceiros.',
      ].join('\n'),
    },
    { tipo: 'vigencia', titulo: 'Do Prazo Contratual e Renovação' },
    {
      tipo: 'texto',
      titulo: 'Da Rescisão e Multa',
      texto: [
        'Qualquer das partes poderá rescindir o presente contrato mediante notificação prévia por escrito com antecedência mínima de 30 (trinta) dias.',
        'Em caso de rescisão antecipada por iniciativa da CONTRATANTE, antes do término da vigência, será devida multa compensatória equivalente a 3 (três) mensalidades do valor vigente, a título de ressarcimento pelos serviços prestados e investimentos realizados.',
        'Em caso de inadimplência superior a 30 (trinta) dias, a CONTRATADA poderá suspender a prestação dos serviços e o acesso aos entregáveis e rescindir o contrato, mantendo o direito ao recebimento dos valores em aberto acrescidos das penalidades previstas na cláusula de pagamento.',
        'Se a CONTRATANTE não fornecer os acessos e informações necessários em tempo hábil, os prazos serão ajustados proporcionalmente, sem penalidade para a CONTRATADA.',
      ].join('\n'),
    },
    {
      tipo: 'texto',
      titulo: 'Da Propriedade Intelectual e Titularidade dos Dados',
      texto: [
        'Após o pagamento integral dos valores devidos, a CONTRATANTE terá propriedade exclusiva dos entregáveis produzidos no âmbito deste contrato, incluindo, quando aplicável, código-fonte, configurações e materiais desenvolvidos.',
        'Todos os dados, leads, históricos de atendimento e informações geradas no âmbito dos serviços são de propriedade exclusiva da CONTRATANTE, que poderá exportá-los a qualquer momento.',
        'A CONTRATADA se compromete a manter sigilo sobre todas as informações confidenciais da CONTRATANTE a que tiver acesso em razão deste contrato.',
      ].join('\n'),
    },
    { tipo: 'assinatura_eletronica', titulo: 'Da Assinatura Eletrônica' },
    { tipo: 'foro', titulo: 'Do Foro' },
  ],
};

/** Normaliza o que veio do banco: descarta bloco inválido e garante título. */
export function lerClausulas(bruto: unknown): Bloco[] {
  if (!Array.isArray(bruto)) return [];
  return bruto
    .filter((b): b is Record<string, unknown> => !!b && typeof b === 'object')
    .filter((b) => TIPOS_DE_BLOCO.includes(b.tipo as TipoDeBloco))
    .map((b) => ({
      tipo: b.tipo as TipoDeBloco,
      titulo: String(b.titulo ?? ROTULO_DO_BLOCO[b.tipo as TipoDeBloco]),
      texto: typeof b.texto === 'string' ? b.texto : undefined,
    }));
}
