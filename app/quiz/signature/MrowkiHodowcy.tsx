// Pytanie 13: rzadek mrowek niesie mszyce jak walizki, w kolko przez teczke.
export default function MrowkiHodowcy() {
  return (
    <span className="sig sig--mrowki" aria-hidden="true">
      <span className="sig__karawana gif-less">
        {[0, 1, 2, 3].map((i) => (
          <svg key={i} viewBox="0 0 30 20" className="sig__mrowka gif-less" style={{ animationDelay: `${(i * 137) % 900}ms` }}>
            <circle cx="6" cy="12" r="3" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="19" cy="12" r="4" />
            <path d="M6 9 L4 4 M12 9 L12 4 M19 8 L22 4" />
            <rect x="22" y="8" width="7" height="7" className="sig__mszyca" />
          </svg>
        ))}
      </span>
      <span className="sig__podpis">HODOWLA WŁASNA</span>
    </span>
  );
}
