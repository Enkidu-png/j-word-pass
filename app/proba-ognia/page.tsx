import DrukOgnia from "@/components/ogien/DrukOgnia";
import KafelTla from "@/components/scena/KafelTla";
import NapisObrazek from "@/components/scena/NapisObrazek";
import Ozdoba from "@/components/scena/Ozdoba";
import Pas from "@/components/scena/Pas";
import PasGoniec from "@/components/scena/PasGoniec";
import StworRogowy from "@/components/scena/StworRogowy";

// ETAP 3: PRÓBA OGNIA (plan/08 A). Ceremonia spalenia i list w butelce
// dochodza w F5-02, radio w F5-03.

// Piec ogni w rzedzie, kazdy z innym opoznieniem (plan/08 A punkt 4).
const OGNIE = ["0ms", "130ms", "260ms", "390ms", "520ms"];

export default function Strona() {
  return (
    <div className="ogien">
      <KafelTla id="kafel-ogien" />
      <Pas id="pas-cienki" pozycja="gora" wysokosc={15} />
      <h1 className="ogien__naglowek" tabIndex={-1}>
        <NapisObrazek tekst="PRÓBA OGNIA" wariant="chrom" klasa="ogien__napis" />
      </h1>

      {/* Dekoracja: `pointer-events: none` na calym bloku (plan/08 E: hover na
          ognisko nie robi nic). */}
      <div className="ognisko" data-ognisko aria-hidden="true">
        {OGNIE.map((op) => (
          <Ozdoba key={op} id="ogien" klasa="ognisko__plomien" opoznienie={op} pierwszyEkran />
        ))}
        <Ozdoba id="stwor-kot" klasa="ognisko__kot" pierwszyEkran />
      </div>

      <DrukOgnia />

      {/* F6-04: miedzy drukiem a delfinami zostawala pusta plachta 172 px
          samego kafla. Goniec jest elementem na cala szerokosc i mowi do
          Aleksandry, wiec zamyka dziure zgodnie z Z8 i Z16, a nie wypelniaczem. */}
      <PasGoniec tekst="ALEKSANDRO, KOMISJA NIE ZWRACA DRUKÓW ANI NADZIEI" czas={10000} />

      <StworRogowy id="stwor-delfin" rog="lewy-dol" />
      <StworRogowy id="stwor-delfin" rog="prawy-dol" lustro />
      <Pas id="pas-cienki" pozycja="dol" wysokosc={15} />
    </div>
  );
}
