import { redirect } from 'next/navigation';

// A tela se chama Tasks desde sempre no menu; só o endereço tinha ficado para
// trás. Este redirecionamento existe para não quebrar link salvo, favorito ou
// aba antiga de quem já usava /admin/entregas.
export default function EntregasRedirect() {
  redirect('/admin/tasks');
}
