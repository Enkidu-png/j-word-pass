// Pytanie 6: pasek 11 zegarow, kazdy na innej godzinie, wskazowki skacza.
const ZEGARY = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

export default function RosjaStrefy() {
  return (
    <span className="sig sig--strefy" aria-hidden="true">
      {ZEGARY.map((g, i) => (
        <svg key={g} viewBox="0 0 24 24" className="sig__zegar">
          <circle cx="12" cy="12" r="10" />
          <path
            className="sig__wskazowka gif-less"
            d="M12 12 L12 5"
            style={{ transform: `rotate(${g * 30}deg)`, animationDelay: `${(i * 137) % 900}ms` }}
          />
        </svg>
      ))}
      <span className="sig__podpis">JEDENAŚCIE RAZY TERAZ</span>
    </span>
  );
}
