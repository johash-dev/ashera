import { useMemo, useState } from 'react';
import { sofaFromSearch, starterArrangement, tvSizeFromSearch } from './editor';
import { ASHERS_ROOM } from './room';
import { cameraViews, isViewId, SceneCanvas, VIEW_ORDER, viewFromSearch } from './scene';
import { Header } from './ui';

const VIEWS = cameraViews(ASHERS_ROOM);

export function App() {
  const [view, setView] = useState(() => viewFromSearch(VIEWS, window.location.search));
  const [tvSize, setTvSize] = useState(() => tvSizeFromSearch(window.location.search));
  const [sofa, setSofa] = useState(() => sofaFromSearch(window.location.search));
  const items = useMemo(() => starterArrangement(ASHERS_ROOM, tvSize, sofa), [tvSize, sofa]);
  return (
    <div className="app">
      <SceneCanvas room={ASHERS_ROOM} items={items} tvSize={tvSize} sofa={sofa} view={view} />
      <Header
        views={VIEW_ORDER.map((id) => VIEWS[id])}
        currentId={view.id}
        onSelect={(id) => {
          if (isViewId(id)) setView(VIEWS[id]);
        }}
        tvSize={tvSize}
        onToggleTvSize={() => setTvSize((size) => (size === 55 ? 65 : 55))}
        sofa={sofa}
        onToggleSofa={() => setSofa((choice) => (choice === 'compact' ? 'l' : 'compact'))}
      />
    </div>
  );
}
