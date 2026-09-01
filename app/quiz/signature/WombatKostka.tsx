// Pytanie 15: wombat, a za nim rzadek idealnych szescianow - dokladaja sie po kolei.
export default function WombatKostka() {
  return (
    <span className="sig sig--wombat" aria-hidden="true">
      <svg viewBox="0 0 40 26" className="sig__wombat">
        <path d="M4 22 C4 10 34 10 34 22 Z" />
        <circle cx="30" cy="14" r="1.6" />
        <path d="M8 12 L6 6 L12 9" />
      </svg>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="sig__kostka gif-less" style={{ animationDelay: `${i * 200}ms` }} />
      ))}
      <span className="sig__podpis">SZEŚĆ NA SZEŚĆ</span>
    </span>
  );
}
