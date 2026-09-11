import { redirect } from 'next/navigation';

/**
 * A tela de Leads foi aposentada.
 *
 * Ela existia porque o lead do site parava numa lista própria e só virava
 * negócio quando alguém clicava em "Promover". Eram duas listas da mesma
 * pessoa, e o funil ficava cego para quem tinha acabado de se identificar.
 *
 * Agora o card nasce no funil assim que a pessoa dá nome e contato, com o que
 * ela respondeu dentro dele. Quem mexeu no formulário e sumiu sem se
 * identificar ficou em Analytics · Formulários, que é onde esse assunto mora.
 *
 * A rota continua de pé só para não quebrar link antigo, favorito ou e-mail.
 */
export default function LeadsRedirect() {
  redirect('/admin/pipeline');
}
