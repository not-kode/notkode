import { usuarioAtual } from '@/lib/admin-usuario';
import { AdminShell } from './admin-shell';

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const eu = await usuarioAtual();
  return <AdminShell usuario={eu ? { nome: eu.nome } : null}>{children}</AdminShell>;
}
