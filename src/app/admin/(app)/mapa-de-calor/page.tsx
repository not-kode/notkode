import { carregarHeatmap } from './data';
import { HeatmapView } from './heatmap-view';

export const dynamic = 'force-dynamic';

export default async function MapaDeCalorPage() {
  const paginas = await carregarHeatmap();

  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow mb-1"><span className="status-dot" />Comportamento</p>
        <h1 className="text-2xl font-semibold tracking-tight">Mapa de calor</h1>
        <p className="mt-1 text-sm text-text-muted">
          Onde as pessoas clicam e até onde rolam cada página. Reconstruído das gravações, sem código de terceiro no site.
        </p>
      </header>

      <HeatmapView paginas={paginas} />
    </div>
  );
}
