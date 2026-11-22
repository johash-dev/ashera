import { useState } from 'react';
import { tvWallItems } from './editor';
import { ASHERS_ROOM } from './room';
import { cameraViews, isViewId, SceneCanvas, VIEW_ORDER, viewFromSearch } from './scene';
import { Header } from './ui';

const VIEWS = cameraViews(ASHERS_ROOM);
const ITEMS = tvWallItems(ASHERS_ROOM);

export function App() {
  const [view, setView] = useState(() => viewFromSearch(VIEWS, window.location.search));
  return (
    <div className="app">
      <SceneCanvas room={ASHERS_ROOM} items={ITEMS} view={view} />
      <Header
        views={VIEW_ORDER.map((id) => VIEWS[id])}
        currentId={view.id}
        onSelect={(id) => {
          if (isViewId(id)) setView(VIEWS[id]);
        }}
      />
    </div>
  );
}
