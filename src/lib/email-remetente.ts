/**
 * Quem assina os e-mails que o sistema manda.
 *
 * O endereço vem do ambiente (`oi@notkode.com.br`), e mandar só o endereço faz o
 * Gmail exibir a parte antes do @ como nome de quem enviou: um convite para
 * assinar contrato chegava de "oi", que não diz nada e ainda parece golpe. Aqui
 * o endereço ganha o nome da casa antes de sair.
 *
 * Se alguém já configurar o ambiente no formato completo ("Notkode <oi@...>"),
 * esse valor é respeitado como está.
 */

const NOME = 'Notkode';

/** Remetente pronto para o Resend, ou null quando não há endereço configurado. */
export function remetenteDaNotkode(): string | null {
  const bruto = process.env.LEAD_FROM_EMAIL?.trim();
  if (!bruto) return null;
  return bruto.includes('<') ? bruto : `${NOME} <${bruto}>`;
}
