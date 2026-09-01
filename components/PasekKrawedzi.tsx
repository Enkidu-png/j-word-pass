// Pas 44 px przyklejony do gornej krawedzi: kafelek proporczykow w ruchu
// (.gif-less--jazda) plus marquee wlasnej roboty - zero <marquee>, zero JS.

const NAPIS =
  "WITAMY W SYSTEMIE J-WORD PASS /// KOMISJA CZUWA /// NIE ODŚWIEŻAJ STRONY (ALBO ODŚWIEŻ, ZAPISUJEMY) ///";

export default function PasekKrawedzi() {
  return (
    <div className="pasek-krawedzi gif-less gif-less--jazda" data-pasek-krawedzi="">
      <div className="pasek-krawedzi__marquee" aria-hidden="true">
        {/* dwie kopie napisu: druga wjezdza, zanim pierwsza zjedzie */}
        <span className="pasek-krawedzi__napis">{NAPIS}</span>
        <span className="pasek-krawedzi__napis">{NAPIS}</span>
      </div>
      {/* czytnik ekranu dostaje napis raz i bez teatru */}
      <p className="tylko-dla-czytnika">{NAPIS}</p>
    </div>
  );
}
