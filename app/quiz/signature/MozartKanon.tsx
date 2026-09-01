// Pytanie 12: cztery nutki skacza po pieciolinii. Hover wariantu A: ukladaja sie
// w usmiech (skrajne w gore, srodkowe w dol) - reakcja siedzi w CSS.
export default function MozartKanon() {
  return (
    <span className="sig sig--nuty" aria-hidden="true">
      <span className="sig__pieciolinia">
        {[0, 1, 2, 3].map((i) => (
          <svg key={i} viewBox="0 0 16 20" className="sig__nutka gif-less" style={{ animationDelay: `${(i * 137) % 900}ms` }}>
            <circle cx="6" cy="15" r="4" />
            <path d="M10 15 V2" />
          </svg>
        ))}
      </span>
      <span className="sig__podpis">KANON NA CZTERY GŁOSY</span>
    </span>
  );
}
