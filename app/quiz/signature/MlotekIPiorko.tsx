// Pytanie 4: mlotek i piorko spadaja rowno, w petli. Bo prozni jest wszystko jedno.
export default function MlotekIPiorko() {
  return (
    <span className="sig sig--spadek" aria-hidden="true">
      <span className="sig__spadaja gif-less">
        <svg viewBox="0 0 24 32" className="sig__mlotek">
          <path d="M12 14 L12 30" />
          <path d="M3 3 H21 V14 H3 Z" />
        </svg>
        <svg viewBox="0 0 24 32" className="sig__piorko">
          <path d="M18 4 C6 10 6 22 8 30" />
          <path d="M16 8 L10 12 M15 13 L9 17 M13 18 L8 22" />
        </svg>
      </span>
      <span className="sig__podpis">W PRÓŻNI. SERIO.</span>
    </span>
  );
}
