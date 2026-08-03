'use client';

/**
 * Imprimir usa o diálogo do navegador; baixar o PDF passa pelo servidor, que
 * renderiza o mesmo documento. Os dois existem porque o PDF do servidor sai
 * igual em qualquer máquina, mas depende do Chrome headless estar de pé.
 */
export function PrintButton({ contratoId }: { contratoId: string }) {
  return (
    <div className="no-print" style={{ position: 'fixed', top: 20, right: 20, display: 'flex', gap: 8, zIndex: 50 }}>
      <a
        href={`/admin/contrato/${contratoId}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: '#fff', color: '#191918', border: '1px solid rgba(25,25,24,.15)', borderRadius: 8,
          padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
        }}
      >
        Baixar PDF
      </a>
      <button
        onClick={() => window.print()}
        style={{
          background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8,
          padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Imprimir
      </button>
    </div>
  );
}
