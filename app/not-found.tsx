import Link from "next/link";
import KafelTla from "@/components/scena/KafelTla";
import NapisObrazek from "@/components/scena/NapisObrazek";
import Ozdoba from "@/components/scena/Ozdoba";
import Pas from "@/components/scena/Pas";
import PasGoniec from "@/components/scena/PasGoniec";
import StworRogowy from "@/components/scena/StworRogowy";

// 404 KOMISJI (F6-03). Z8 obowiazuje tak samo jak na kazdym innym widoku:
// wlasny kafel, minimum szesc animowanych elementow, dwa stwory rogowe
// i pas na cala szerokosc. Naglowek niesie NapisObrazek, nie tekst - to ta
// sama droga, ktora omija przycinanie `h1` z F7-02.

// Sciana zagubionych druków: szesc ozdob z roznymi opoznieniami migania,
// roznica minimum 120 ms (ten sam wzorzec, co tablica ogloszen bramy).
const ARCHIWUM = [
  { id: "stwor-klepsydra", opoznienie: "0ms" },
  { id: "stwor-klodka", opoznienie: "120ms" },
  { id: "stwor-koperta", opoznienie: "240ms" },
  { id: "stwor-slimak", opoznienie: "360ms" },
  { id: "stwor-kosc", opoznienie: "480ms" },
  { id: "stwor-mlotek", opoznienie: "600ms" },
];

export default function NieZnaleziono() {
  return (
    <div className="brak" data-widok="404">
      <KafelTla id="kafel-404" />
      <Pas id="pas-budowa" pozycja="gora" wysokosc={45} />
      <Ozdoba id="statek-wir" klasa="brak__statek" pierwszyEkran />
      <h1 className="brak__naglowek">
        <NapisObrazek tekst="404" wariant="chrom" klasa="brak__napis" />
      </h1>
      <div className="druk brak__druk">
        <p className="druk__naglowek">AKTA NIE ODNALEZIONE</p>
        <p className="brak__tresc">
          ALEKSANDRO, KOMISJA PRZESZUKAŁA CAŁE ARCHIWUM I TEJ STRONY W NIM NIE MA.
          ARCHIWISTA TWIERDZI, ŻE NIGDY NIE BYŁO, ALE ARCHIWISTA JEST ŚLIMAKIEM.
        </p>
        <ul className="brak__archiwum">
          {ARCHIWUM.map((o) => (
            <li key={o.id} className="brak__pole">
              <Ozdoba id={o.id} klasa="brak__ozdoba" opoznienie={o.opoznienie} pierwszyEkran />
            </li>
          ))}
        </ul>
        <Link className="druk__cta" href="/" data-cta="do-bramy">
          WRACAM DO BRAMY, ALEKSANDRA
        </Link>
      </div>
      <PasGoniec tekst="ALEKSANDRO, KOMISJA NIE ZNA TEGO ADRESU" czas={11000} />
      <StworRogowy id="stwor-ptak" rog="lewy-gora" />
      <StworRogowy id="stwor-ptak" rog="prawy-gora" lustro />
      <StworRogowy id="stwor-osmiornica" rog="lewy-dol" />
      <StworRogowy id="stwor-osmiornica" rog="prawy-dol" lustro />
      <Pas id="pas-balony" pozycja="dol" wysokosc={60} />
    </div>
  );
}
