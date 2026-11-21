export function Header({ viewLabel }: { viewLabel: string }) {
  return (
    <header className="hud-header">
      <span className="hud-brand">ASHERA</span>
      <span className="hud-tagline">Enter Your Era</span>
      <span className="hud-view" data-testid="view-label">
        {viewLabel}
      </span>
    </header>
  );
}
