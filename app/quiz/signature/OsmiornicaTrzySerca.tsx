// Pytanie 1: trzy serca pulsuja niezaleznie. Hover wariantu B zatrzymuje serce
// nr 1 (`animation-play-state: paused`) - reszta bije dalej. Cala reakcja w CSS.
export default function OsmiornicaTrzySerca() {
  return (
    <span className="sig sig--osmiornica" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 22"
          data-serce={i}
          className="sig__serce gif-less"
          style={{ animationDelay: `${(i * 137) % 900}ms` }}
        >
          <path d="M12 20 L3 11 A5 5 0 0 1 12 6 A5 5 0 0 1 21 11 Z" />
        </svg>
      ))}
      <span className="sig__podpis">TRZY SERCA /// JEDNO BYWA LENIWE</span>
    </span>
  );
}
