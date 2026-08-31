import { listarUsuarios, usuarioAtual } from '@/lib/admin-usuario';
import { tokensAtivos } from '@/lib/mcp-token';
import { SITE_URL } from '@/lib/seo';
import { UsuariosView } from './usuarios-view';

export const dynamic = 'force-dynamic';

export default async function UsuariosPage() {
  const [usuarios, eu, tokens] = await Promise.all([listarUsuarios(), usuarioAtual(), tokensAtivos()]);
  return <UsuariosView usuarios={usuarios} euId={eu?.id ?? null} tokens={tokens} urlDoMcp={`${SITE_URL}/api/mcp`} />;
}
