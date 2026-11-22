import { useMemo, useState } from 'react';
import { starterArrangement, tvSizeFromSearch } from './editor';
import { ASHERS_ROOM } from './room';
import { cameraViews, isViewId, SceneCanvas, VIEW_ORDER, viewFromSearch } from './scene';
import { Header } from './ui';

const VIEWS = cameraViews(ASHERS_ROOM);

export function App() {
  const [view, setView] = useState(() => viewFromSearch(VIEWS, window.location.search));
  const [tvSize, setTvSize] = useState(() => tvSizeFromSearch(window.location.search));
  const items = useMemo(() => starterArrangement(ASHERS_ROOM, tvSize), [tvSize]);
  return (
    <div className="app">
      <SceneCanvas room={ASHERS_ROOM} items={items} tvSize={tvSize} view={view} />
      <Header
        views={VIEW_ORDER.map((id) => VIEWS[id])}
        currentId={view.id}
        onSelect={(id) => {
          if (isViewId(id)) setView(VIEWS[id]);
        }}
        tvSize={tvSize}
        onToggleTvSize={() => setTvSize((size) => (size === 55 ? 65 : 55))}
      />
    </div>
  );
}
