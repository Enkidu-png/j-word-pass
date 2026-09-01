// Pytanie 10: drewniana mysz na dwoch kolkach jezdzi po dolnej krawedzi teczki.
export default function MyszDrewniana() {
  return (
    <span className="sig sig--mysz" aria-hidden="true">
      <span className="sig__tor gif-less">
        <svg viewBox="0 0 48 24" className="sig__mysz">
          <path d="M6 16 H40 L34 8 H12 Z" />
          <circle cx="14" cy="19" r="4" />
          <circle cx="34" cy="19" r="4" />
          <path d="M40 16 L46 20" />
        </svg>
      </span>
      <span className="sig__podpis">DREWNO, DWA KÓŁKA, ZERO PRETENSJI</span>
    </span>
  );
}
