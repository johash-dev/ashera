import { useState } from 'react';
import { ASHERS_ROOM } from './room';
import { isViewId, SceneCanvas, VIEWS, viewFromSearch } from './scene';
import { Header } from './ui';

export function App() {
  const [view, setView] = useState(() => viewFromSearch(window.location.search));
  return (
    <div className="app">
      <SceneCanvas room={ASHERS_ROOM} view={view} />
      <Header
        views={Object.values(VIEWS)}
        currentId={view.id}
        onSelect={(id) => {
          if (isViewId(id)) setView(VIEWS[id]);
        }}
      />
    </div>
  );
}
