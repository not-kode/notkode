import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { acharPorCodigo, conferirIntegridade } from '@/lib/assinatura/servico';
import { hashLegivel } from '@/lib/assinatura/nucleo';

// Página pública de verificação: é o que permite a qualquer um conferir, com o
// código impresso no documento, que aquele arquivo é o que foi assinado.

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Verificação de documento assinado',
  robots: { index: false, follow: false },
};

const PAPEL_LABEL: Record<string, string> = {
  contratante: 'Contratante',
  contratada: 'Contratada',
  testemunha: 'Testemunha',
};

const carimbo = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} às ${d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;
};

export default async function VerificarPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const achado = await acharPorCodigo(codigo);
  if (!achado) notFound();

  const { request, signatarios } = achado;
  const integro = await conferirIntegridade(request);
  const assinado = request.status === 'assinado';

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-5 px-4 py-10 md:px-6">
      <header>
        <p className="font-label text-[10px] uppercase tracking-wider text-primary">Verificação de documento</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">{request.titulo ?? 'Documento'}</h1>
        <p className="mt-1 font-mono text-xs text-neutral-500">Código {request.codigo}</p>
      </header>

      <section
        className={`rounded-xl border p-5 ${assinado && integro ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}
      >
        <h2 className="text-base font-bold text-neutral-900">
          {assinado
            ? integro ? 'Documento assinado e íntegro' : 'Documento assinado, mas o arquivo não confere'
            : request.status === 'cancelado' ? 'Assinatura cancelada' : 'Assinatura em andamento'}
        </h2>
        <p className="mt-1 text-sm text-neutral-700">
          {assinado
            ? integro
              ? 'O arquivo guardado confere com o resumo criptográfico registrado no momento do envio para assinatura.'
              : 'O resumo criptográfico do arquivo guardado não bate com o registrado no envio. Procure a Notkode antes de considerar este documento válido.'
            : request.status === 'cancelado'
              ? 'Este pedido de assinatura foi cancelado ou recusado.'
              : 'Ainda faltam signatários. O documento assinado fica disponível aqui quando todos assinarem.'}
        </p>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-5">
        <h2 className="font-label text-[10px] uppercase tracking-wider text-neutral-500">Documento</h2>
        <p className="mt-2 break-all font-mono text-xs text-neutral-700">SHA-256: {hashLegivel(request.documento_hash)}</p>
        <p className="mt-2 text-sm text-neutral-600">Enviado para assinatura em {carimbo(request.created_at)}.</p>
        {request.completed_at && <p className="text-sm text-neutral-600">Concluído em {carimbo(request.completed_at)}.</p>}
        {assinado && (
          <a
            href={`/verificar/${request.codigo}/documento`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            Abrir documento assinado
          </a>
        )}
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-5">
        <h2 className="font-label text-[10px] uppercase tracking-wider text-neutral-500">Signatários</h2>
        <ul className="mt-3 space-y-3">
          {signatarios.map((s) => (
            <li key={s.id} className="border-t border-black/[0.06] pt-3 first:border-0 first:pt-0">
              <p className="font-label text-[10px] uppercase tracking-wider text-neutral-500">
                {PAPEL_LABEL[s.papel] ?? s.papel}
              </p>
              <p className="text-sm font-semibold text-neutral-900">{s.nome}</p>
              <p className="text-xs text-neutral-600">{s.email}{s.documento ? ` · CPF nº ${s.documento}` : ''}</p>
              <p className="text-xs text-neutral-600">
                {s.status === 'assinado'
                  ? `Assinou em ${carimbo(s.assinado_em)}${s.assinado_ip ? ` · IP ${s.assinado_ip}` : ''}`
                  : s.status === 'recusado'
                    ? `Recusou em ${carimbo(s.recusado_em)}`
                    : 'Ainda não assinou'}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-neutral-500">
        Assinatura eletrônica nos termos do art. 10, § 2º, da MP nº 2.200-2/2001 e da Lei nº 14.063/2020. Notkode,
        CNPJ 46.733.108/0001-94.
      </p>
    </div>
  );
}
