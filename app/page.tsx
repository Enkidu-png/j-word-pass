import KafelTla from "@/components/scena/KafelTla";
import NapisObrazek from "@/components/scena/NapisObrazek";
import Ozdoba from "@/components/scena/Ozdoba";
import Pas from "@/components/scena/Pas";
import PasGoniec from "@/components/scena/PasGoniec";
import StworRogowy from "@/components/scena/StworRogowy";

// BRAMA, etap 0 (plan/05 B1). Punkty 7 i 8 - tablica ogloszen i druk wstepny -
// dokladane w F2-02b, ceremonia wejscia w F2-04.
export default function Strona() {
  return (
    <div className="brama">
      <KafelTla id="kafel-brama" />
      <Ozdoba id="statek" klasa="brama__statek" pierwszyEkran />
      <h1 className="brama__naglowek">
        <NapisObrazek tekst="J-WORD PASS" wariant="chrom" klasa="brama__napis" />
      </h1>
      <p className="brama__podtytul">MIĘDZYGALAKTYCZNA KOMISJA KWALIFIKACYJNA</p>
      <div className="brama__zjazd">
        <PasGoniec tekst="&lt; PRZEWIŃ W DÓŁ, ALEKSANDRO &gt;" wariant="odbijany" />
        <Ozdoba id="strzalka-dol" klasa="brama__strzalka" />
      </div>
      <StworRogowy id="stwor-delfin" rog="lewy-dol" />
      <StworRogowy id="stwor-delfin" rog="prawy-dol" lustro />
      <Pas id="pas-budowa" pozycja="dol" wysokosc={45} />
    </div>
  );
}
