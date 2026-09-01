// Pytanie 2: kula Wenus krazy w lewo, strzalka podpisana WSZYSCY INNI w prawo.
export default function WenusObracaSieZle() {
  return (
    <span className="sig sig--wenus" aria-hidden="true">
      <span className="sig__kula gif-less">
        <span className="sig__plama" />
      </span>
      <span className="sig__strzalka-blok">
        <svg viewBox="0 0 40 40" className="sig__strzalka gif-less">
          <path d="M20 6 A14 14 0 1 1 6 20" />
          <path d="M14 2 L20 6 L14 11 Z" />
        </svg>
        <span className="sig__podpis">WSZYSCY INNI</span>
      </span>
    </span>
  );
}
