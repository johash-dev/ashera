import { ASHERS_ROOM } from './room';
import { SceneCanvas, viewFromSearch } from './scene';
import { Header } from './ui';

export function App() {
  const view = viewFromSearch(window.location.search);
  return (
    <div className="app">
      <SceneCanvas room={ASHERS_ROOM} view={view} />
      <Header viewLabel={view.label} />
    </div>
  );
}
