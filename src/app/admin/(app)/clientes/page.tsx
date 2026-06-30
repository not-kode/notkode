import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createContact } from './actions';

export const dynamic = 'force-dynamic';

type Channel = { kind: string; value: string; is_primary: boolean };
type Contact = {
  id: string;
  name: string | null;
  source: string | null;
  contact_channels: Channel[] | null;
  contact_organizations: { organizations: { name: string | null } | null }[] | null;
};
type Org = { id: string; name: string | null; market: string | null };

function channel(c: Contact, kind: string): string | null {
  const list = c.contact_channels ?? [];
  const primary = list.find((ch) => ch.kind === kind && ch.is_primary) ?? list.find((ch) => ch.kind === kind);
  return primary?.value ?? null;
}
function orgName(c: Contact): string | null {
  return c.contact_organizations?.[0]?.organizations?.name ?? null;
}

export default async function ClientesPage() {
  const supabase = getSupabaseAdmin();
  const [{ data: contactData }, { data: orgData }, { data: dealData }, { data: linkData }] = await Promise.all([
    supabase
      .from('contacts')
      .select('id, name, source, contact_channels(kind, value, is_primary), contact_organizations(organizations(name))')
      .order('created_at', { ascending: false }),
    supabase.from('organizations').select('id, name, market').order('name'),
    supabase.from('deals').select('contact_id'),
    supabase.from('contact_organizations').select('organization_id'),
  ]);

  const contacts = (contactData ?? []) as unknown as Contact[];
  const orgs = (orgData ?? []) as Org[];
  const deals = (dealData ?? []) as { contact_id: string | null }[];
  const links = (linkData ?? []) as { organization_id: string }[];

  const dealCount = (contactId: string) => deals.filter((d) => d.contact_id === contactId).length;
  const orgContacts = (orgId: string) => links.filter((l) => l.organization_id === orgId).length;

  const inputCls =
    'rounded-md border border-border-subtle/20 bg-surface-base px-3 py-2 text-sm outline-none focus:border-primary';
  const labelCls = 'font-mono text-[11px] uppercase tracking-wider text-text-muted';

  return (
    <div className="max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="mt-1 text-sm text-text-muted">
          {contacts.length} contato{contacts.length === 1 ? '' : 's'} · {orgs.length} empresa{orgs.length === 1 ? '' : 's'}
        </p>
      </header>

      {/* ── Contatos ──────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">Contatos</h2>

        <details className="mb-4 rounded-lg border border-border-subtle/15 bg-neutral-50 p-4">
          <summary className="cursor-pointer text-sm font-medium text-primary">+ Novo contato</summary>
          <form action={createContact} className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Nome</span>
              <input name="name" required className={inputCls} placeholder="Nome do contato" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>E-mail</span>
              <input name="email" type="email" className={inputCls} placeholder="email@exemplo.com" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>WhatsApp</span>
              <input name="whatsapp" className={inputCls} placeholder="(11) 99999-9999" />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Empresa</span>
              <input name="company" className={inputCls} placeholder="Nome da empresa" />
            </label>
            <div className="col-span-2 md:col-span-4">
              <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600">
                Criar contato
              </button>
            </div>
          </form>
        </details>

        {contacts.length === 0 ? (
          <p className="rounded-md border border-border-subtle/20 bg-white px-4 py-8 text-center text-sm text-text-muted">
            Nenhum contato ainda. Promova um lead ou crie um contato acima.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border-subtle/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle/15 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">WhatsApp</th>
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Origem</th>
                  <th className="px-4 py-3 font-medium">Negócios</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-border-subtle/10 last:border-0">
                    <td className="px-4 py-3 font-medium text-text-primary">{c.name ?? '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{channel(c, 'email') ?? '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{channel(c, 'whatsapp') ?? '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{orgName(c) ?? '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{c.source ?? '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{dealCount(c.id) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Empresas ──────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Empresas</h2>
        {orgs.length === 0 ? (
          <p className="rounded-md border border-border-subtle/20 bg-white px-4 py-8 text-center text-sm text-text-muted">
            Nenhuma empresa ainda.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border-subtle/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle/15 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Mercado</th>
                  <th className="px-4 py-3 font-medium">Contatos</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((o) => (
                  <tr key={o.id} className="border-b border-border-subtle/10 last:border-0">
                    <td className="px-4 py-3 font-medium text-text-primary">{o.name ?? '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{o.market ?? '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{orgContacts(o.id) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
