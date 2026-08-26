import { listarUsuarios, usuarioAtual } from '@/lib/admin-usuario';
import { UsuariosView } from './usuarios-view';

export const dynamic = 'force-dynamic';

export default async function UsuariosPage() {
  const [usuarios, eu] = await Promise.all([listarUsuarios(), usuarioAtual()]);
  return <UsuariosView usuarios={usuarios} euId={eu?.id ?? null} />;
}
