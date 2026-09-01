// Pytanie 7: lyzeczka z galu kapie. Hover wariantu A przyspiesza kapanie (CSS).
export default function GalTopnieje() {
  return (
    <span className="sig sig--gal" aria-hidden="true">
      <svg viewBox="0 0 40 40" className="sig__lyzeczka">
        <path d="M10 6 A6 6 0 1 1 22 6 A6 6 0 1 1 10 6 Z" />
        <path d="M18 12 L28 30" />
      </svg>
      <span className="sig__kropla gif-less" />
      <span className="sig__podpis">TEMPERATURA POKOJOWA WYSTARCZY</span>
    </span>
  );
}
