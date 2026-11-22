import { type SofaChoice, type TvSize } from '../editor';

export interface ViewOption {
  readonly id: string;
  readonly label: string;
}

export function Header({
  views,
  currentId,
  onSelect,
  tvSize,
  onToggleTvSize,
  sofa,
  onToggleSofa,
}: {
  views: readonly ViewOption[];
  currentId: string;
  onSelect: (id: string) => void;
  /** TV size shown, in inches. */
  tvSize: TvSize;
  onToggleTvSize: () => void;
  /** Sofa shown. */
  sofa: SofaChoice;
  onToggleSofa: () => void;
}) {
  const current = views.find((view) => view.id === currentId);
  return (
    <header className="hud-header">
      <span className="hud-brand">ASHERA</span>
      <span className="hud-tagline">Enter Your Era</span>
      <span className="hud-view" data-testid="view-label">
        {current?.label}
      </span>
      <nav className="hud-views" aria-label="Views">
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            className="hud-view-button"
            aria-pressed={view.id === currentId}
            onClick={() => onSelect(view.id)}
          >
            {view.label}
          </button>
        ))}
      </nav>
      <button
        type="button"
        className="hud-view-button hud-tv-button"
        data-testid="tv-size"
        title="Switch the TV between 55″ and 65″"
        onClick={onToggleTvSize}
      >
        TV {tvSize}″
      </button>
      <button
        type="button"
        className="hud-view-button hud-sofa-button"
        data-testid="sofa-choice"
        title="Switch the sofa between the compact one and the L-shaped one"
        onClick={onToggleSofa}
      >
        Sofa: {sofa === 'compact' ? 'compact' : 'L-shaped'}
      </button>
    </header>
  );
}
