import Ozdoba from "@/components/scena/Ozdoba";
import Pas from "@/components/scena/Pas";
import StworRogowy from "@/components/scena/StworRogowy";
import { POZYCJE, pozycjeRoli } from "@/lib/assety";

// Playground silnika sceny (plan/04). Pokazuje KAZDA pozycje manifestu, zeby
// bledna pozycja albo brakujaca klatka statyczna wyszla tu, a nie w widoku.
export default function Playground() {
  const ozdoby = pozycjeRoli("ozdoba");
  const pasy = pozycjeRoli("pas");

  return (
    <main className="playground">
      <h1 tabIndex={-1}>PLAYGROUND SCENY</h1>

      <p className="playground-licznik">
        Pozycji w manifescie: {POZYCJE.length}, w tym ozdob: {ozdoby.length},
        pasow: {pasy.length}.
      </p>

      <h2>OZDOBY ({ozdoby.length})</h2>
      <ul className="playground-siatka">
        {ozdoby.map((p) => (
          <li key={p.id} className="playground-kafelek">
            <code>{p.id}</code>
            <Ozdoba id={p.id} />
          </li>
        ))}
      </ul>

      <h2>PASY ({pasy.length})</h2>
      <ul className="playground-pasy">
        {pasy.map((p) => (
          <li key={p.id} className="playground-pasek">
            <code>{p.id}</code>
            <Pas id={p.id} pozycja="dol" wysokosc={p.wysokosc} />
          </li>
        ))}
      </ul>

      <h2>STWORY ROGOWE (wzorzec ROGI)</h2>
      <div className="playground-rogi">
        <StworRogowy id="stwor-delfin" rog="lewy-dol" />
        <StworRogowy id="stwor-delfin" rog="prawy-dol" lustro />
        <StworRogowy id="stwor-hotdog" rog="lewy-gora" />
        <StworRogowy id="stwor-hotdog" rog="prawy-gora" lustro />
      </div>
    </main>
  );
}
