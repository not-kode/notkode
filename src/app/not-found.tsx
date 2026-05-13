import Link from 'next/link';

// Inherits <html>/<body> from src/app/layout.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="text-center max-w-lg">
        <h1 className="text-6xl font-bold mb-4">
          4<span className="text-gradient">0</span>4
        </h1>
        <p className="text-text-secondary mb-8">
          Página não encontrada. Volte para o início.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-brand text-navy font-semibold hover:-translate-y-0.5 transition-transform"
        >
          Voltar para Home
        </Link>
      </div>
    </div>
  );
}
