import Arkusz from "./Arkusz";
import Scena from "./Scena";

export default function Egzamin() {
  return (
    <main className="egzamin">
      <h1 tabIndex={-1}>ETAP 1 /// EGZAMIN Z FIZYKI</h1>
      <div className="egzamin__plansza">
        <Scena />
        <Arkusz />
      </div>
    </main>
  );
}
