// Textos genéricos padrão das obrigações do contrato.
// São genéricos de propósito: o escopo específico de cada caso vem da Proposta
// anexa (Anexo I). Uma obrigação por linha — o gerador numera automaticamente
// (2.1, 2.2… / 3.1, 3.2…). O usuário pode sobrescrever por contrato.

export const DEFAULT_CLIENT_OBLIGATIONS = [
  'Efetuar o pagamento de acordo com o estipulado na Cláusula Quarta deste contrato.',
  'Fornecer todas as informações, acessos, credenciais e materiais necessários para a execução dos serviços no prazo de até 7 (sete) dias úteis contados da assinatura deste contrato.',
  'Aprovar com agilidade os materiais e ajustes enviados pela CONTRATADA, em até 48 (quarenta e oito) horas após o envio.',
  'Não solicitar serviços fora do escopo estabelecido na Cláusula Primeira e na Proposta anexa, salvo mediante acordo prévio e remuneração adicional.',
].join('\n');

export const DEFAULT_PROVIDER_OBLIGATIONS = [
  'Executar os serviços descritos na Cláusula Primeira e na Proposta anexa utilizando as melhores práticas técnicas, visando qualidade e satisfação da CONTRATANTE.',
  'Observar os prazos e as entregas previstos na Proposta anexa, contados a partir do recebimento de todos os acessos e materiais necessários.',
  'Manter os serviços em operação durante todo o período contratual, garantindo disponibilidade e suporte técnico dentro do escopo contratado.',
  'Utilizar a forma escrita para todas as comunicações relevantes com a CONTRATANTE, preservando o histórico de orientações e aprovações.',
].join('\n');

// Divide o texto em itens numeráveis, ignorando linhas em branco.
export function obligationLines(text: string | null, fallback: string): string[] {
  return (text ?? fallback)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}
