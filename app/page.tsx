import DrukWstepny from "@/components/brama/DrukWstepny";
import PierwszeWejscie from "@/components/brama/PierwszeWejscie";
import KafelTla from "@/components/scena/KafelTla";
import NapisObrazek from "@/components/scena/NapisObrazek";
import Ozdoba from "@/components/scena/Ozdoba";
import Pas from "@/components/scena/Pas";
import PasGoniec from "@/components/scena/PasGoniec";
import StworRogowy from "@/components/scena/StworRogowy";

// BRAMA, etap 0 (plan/05 B1). Ceremonia wejscia dochodzi w F2-04,
// przycisk-uciekinier w F2-03.

// Tablica ogloszen: szesc roznych ozdob w dwoch rzedach po trzy, kazda z innym
// opoznieniem migania, roznica minimum 120 ms (plan/05 B1 punkt 7).
const TABLICA = [
  { id: "stwor-nuta", opoznienie: "0ms" },
  { id: "stwor-dyskietka", opoznienie: "120ms" },
  { id: "stwor-kula-ziemska", opoznienie: "240ms" },
  { id: "stwor-krysztal", opoznienie: "360ms" },
  { id: "stwor-mysz", opoznienie: "480ms" },
  { id: "stwor-zegar", opoznienie: "600ms" },
];
export default function Strona() {
  return (
    <div className="brama">
      <KafelTla id="kafel-brama" />
      <PierwszeWejscie />
      <Ozdoba id="statek" klasa="brama__statek" pierwszyEkran />
      {/* Bez tabIndex: EkranLadowania po zdjeciu nakladki przenosi fokus na
          pierwszy `h1`, wiec focusowalny naglowek bramy dostawal po ceremonii
          magentowa obwodke `:focus-visible` na cala szerokosc ekranu (widac na
          zrzucie z preview, nie w zadnej assercji). Na bramie nie ma dokad
          przenosic fokusu - nic sie nie przenawigowalo. Naglowki etapow maja
          `tabIndex={-1}` i to je fokusuje FokusNaNaglowku po zmianie sciezki. */}
      <h1 className="brama__naglowek">
        <NapisObrazek tekst="J-WORD PASS" wariant="chrom" klasa="brama__napis" />
      </h1>
      <p className="brama__podtytul">MIĘDZYGALAKTYCZNA KOMISJA KWALIFIKACYJNA</p>
      <div className="brama__zjazd">
        <PasGoniec tekst="&lt; PRZEWIŃ W DÓŁ, ALEKSANDRO &gt;" wariant="odbijany" />
        <Ozdoba id="strzalka-dol" klasa="brama__strzalka" />
      </div>
      <div className="tablica">
        <p className="tablica__naglowek">OGŁOSZENIA KOMISJI</p>
        <ul className="tablica__siatka">
          {TABLICA.map((o) => (
            <li key={o.id} className="tablica__pole">
              <Ozdoba id={o.id} klasa="tablica__ozdoba" opoznienie={o.opoznienie} pierwszyEkran />
            </li>
          ))}
        </ul>
        <DrukWstepny />
      </div>
      <StworRogowy id="stwor-delfin" rog="lewy-dol" />
      <StworRogowy id="stwor-delfin" rog="prawy-dol" lustro />
      <Pas id="pas-budowa" pozycja="dol" wysokosc={45} />
    </div>
  );
}
