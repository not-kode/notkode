'use client';

export function PrintButton({ id }: { id: string }) {
  return (
    <div className="no-print" style={{ position: 'fixed', top: 20, right: 20, display: 'flex', gap: 8, zIndex: 50 }}>
      <a
        href={`/admin/contrato/${id}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: '#3B82F6', color: '#fff', textDecoration: 'none', borderRadius: 8,
          padding: '10px 18px', fontSize: 14, fontWeight: 600,
        }}
      >
        Baixar PDF
      </a>
      <button
        onClick={() => window.print()}
        style={{
          background: '#fff', color: '#191918', border: '1px solid rgba(25,25,24,.2)', borderRadius: 8,
          padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Imprimir
      </button>
    </div>
  );
}
