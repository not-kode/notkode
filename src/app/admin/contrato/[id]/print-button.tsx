'use client';

export function PrintButton() {
  return (
    <div className="no-print" style={{ position: 'fixed', top: 20, right: 20, display: 'flex', gap: 8 }}>
      <button
        onClick={() => window.print()}
        style={{
          background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8,
          padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Imprimir / Salvar PDF
      </button>
    </div>
  );
}
