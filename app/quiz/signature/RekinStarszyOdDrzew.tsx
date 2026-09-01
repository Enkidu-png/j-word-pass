// Pytanie 11: os czasu. Rekin z laska po lewej, drzewo po prawej, skrzela mrugaja.
export default function RekinStarszyOdDrzew() {
  return (
    <span className="sig sig--rekin" aria-hidden="true">
      <svg viewBox="0 0 60 30" className="sig__rekin">
        <path d="M4 20 C16 6 40 6 54 18 C40 26 16 28 4 20 Z" />
        <path d="M26 8 L30 2 L34 9" />
        <path className="sig__skrzela gif-less" d="M40 12 V20 M44 11 V21" />
        <path d="M14 22 V28 M14 22 L18 26" />
      </svg>
      <span className="sig__os" />
      <svg viewBox="0 0 30 30" className="sig__drzewo">
        <path d="M15 28 V16" />
        <path d="M15 2 L24 18 H6 Z" />
      </svg>
      <span className="sig__podpis">REKIN BYŁ PIERWSZY</span>
    </span>
  );
}
