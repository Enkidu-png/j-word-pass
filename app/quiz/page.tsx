import Arkusz from "@/components/quiz/Arkusz";
import KafelTla from "@/components/scena/KafelTla";
import NapisObrazek from "@/components/scena/NapisObrazek";
import Pas from "@/components/scena/Pas";
import StworRogowy from "@/components/scena/StworRogowy";

// ETAP 2: QUIZ (plan/07 A). Tresc pytan idzie WYLACZNIE z data/quiz.json -
// w tym pliku i w Arkuszu nie ma ani jednego zdania quizu.
// Maszyna prawdy (ceremonia wyniku) dochodzi w F4-03.

export default function Strona() {
  return (
    <div className="quiz">
      <KafelTla id="kafel-quiz" />
      <Pas id="pas-balony" pozycja="gora" wysokosc={43} />
      <h1 className="quiz__naglowek" tabIndex={-1}>
        <NapisObrazek tekst="QUIZ" wariant="neon" klasa="quiz__napis" />
      </h1>

      <Arkusz />

      <StworRogowy id="stwor-kot" rog="lewy-dol" />
      <StworRogowy id="stwor-kot" rog="prawy-dol" lustro />
      <Pas id="pas-cienki" pozycja="dol" wysokosc={14} />
    </div>
  );
}
