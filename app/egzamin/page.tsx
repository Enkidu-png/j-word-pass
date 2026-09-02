import egzamin from "@/data/egzamin.json";
import DrukOdpowiedzi from "@/components/egzamin/DrukOdpowiedzi";
import KafelTla from "@/components/scena/KafelTla";
import NapisObrazek from "@/components/scena/NapisObrazek";
import Ozdoba from "@/components/scena/Ozdoba";
import Pas from "@/components/scena/Pas";
import PlonacyNapis from "@/components/scena/PlonacyNapis";
import StworRogowy from "@/components/scena/StworRogowy";

// ETAP 1: EGZAMIN (plan/06 B). Ceremonia oceny dochodzi w F3-03.
//
// Tresc zadania i szesc zalozen ida WYLACZNIE z data/egzamin.json - w tym
// pliku nie ma ani jednego zdania egzaminu (plan/06 A, Z3-analog dla danych).

// Gwiazdki stoja na sztywno wpisanych pozycjach, a nie na Math.random():
// losowanie przy renderze rozjechaloby serwer z klientem przy hydracji.
// Opoznienia rosna co 100 ms, od 0 do 1100 ms (plan/06 B punkt 5).
const GWIAZDKI = [
  { lewo: "6%", gora: "12%" },
  { lewo: "18%", gora: "62%" },
  { lewo: "27%", gora: "28%" },
  { lewo: "35%", gora: "78%" },
  { lewo: "44%", gora: "8%" },
  { lewo: "52%", gora: "48%" },
  { lewo: "61%", gora: "22%" },
  { lewo: "69%", gora: "70%" },
  { lewo: "77%", gora: "36%" },
  { lewo: "84%", gora: "84%" },
  { lewo: "90%", gora: "16%" },
  { lewo: "95%", gora: "56%" },
];

export default function Strona() {
  return (
    <div className="egzamin">
      <KafelTla id="kafel-egzamin" />
      <Pas id="pas-balony" pozycja="gora" wysokosc={43} />
      <h1 className="egzamin__naglowek" tabIndex={-1}>
        <NapisObrazek tekst="ETAP 1" wariant="chrom" klasa="egzamin__etap" />
      </h1>
      <div className="egzamin__plonacy">
        <PlonacyNapis tekst="EGZAMIN JASIU" />
      </div>

      <section className="druk druk--pytanie">
        <p className="druk__naglowek">TREŚĆ PYTANIA</p>
        <p className="pytanie__tytul">{egzamin.tytul}</p>
        <p className="pytanie__tresc">{egzamin.tresc}</p>
        <p className="pytanie__polecenie">{egzamin.polecenie}</p>
      </section>

      {/* F7-08: zalozenia siedza w <details> zwinietym domyslnie. Na 390 px
          rozwinieta lista pchala <textarea> na 1462 px od gory strony, wiec
          Aleksandra nie doscrollowala do pola odpowiedzi. Nic nie znika -
          jedno klikniecie i lista jest z powrotem. */}
      <details className="druk druk--dane">
        <summary className="druk__naglowek dane__summary">DANE DO ZADANIA</summary>
        <ul className="dane__lista">
          {egzamin.zalozenia.map((z) => (
            <li className="dane__pozycja" key={z.id}>
              <Ozdoba id="stwor-strzalka" klasa="dane__strzalka" />
              <span>{z.tekst}</span>
            </li>
          ))}
        </ul>
      </details>

      <DrukOdpowiedzi />

      {/* Dekoracja i nic wiecej: `pointer-events: none` na calym bloku, wiec
          klik w planete trafia w to, co lezy pod scena (plan/06 B punkt 5). */}
      <div className="kosmos" data-kosmos aria-hidden="true">
        <Ozdoba id="planeta" klasa="kosmos__planeta" pierwszyEkran />
        <Ozdoba id="statek" klasa="kosmos__statek" pierwszyEkran />
        {GWIAZDKI.map((g, i) => (
          <span
            key={`${g.lewo}-${g.gora}`}
            className="kosmos__gwiazdka"
            style={{ left: g.lewo, top: g.gora, animationDelay: `${i * 100}ms` }}
          >
            <Ozdoba id="stwor-gwiazdka" pierwszyEkran />
          </span>
        ))}
      </div>

      <StworRogowy id="stwor-osmiornica" rog="lewy-dol" />
      <StworRogowy id="stwor-osmiornica" rog="prawy-dol" lustro />
    </div>
  );
}
