// Bebny z cyframi przewijane pionowo. Kazda kolumna to tasma 0-9 przesuwana
// `translateY` ze `steps(10)` - liczba nie plynie, tylko przeskakuje (Z7).

const MS_NA_POZYCJE = 120;
const CAP_MS = 900; // cap z 03 sekcja F: caly obrot nigdy dluzej niz 900 ms

export default function LicznikMechaniczny({
  wartosc,
  szerokosc,
}: {
  wartosc: number;
  szerokosc: number;
}) {
  const cyfry = String(Math.max(0, Math.trunc(wartosc)))
    .padStart(szerokosc, "0")
    .slice(-szerokosc)
    .split("");

  return (
    <span className="licznik-mechaniczny" data-licznik={wartosc}>
      {cyfry.map((cyfra, i) => (
        <span className="licznik-mechaniczny__okno" key={i}>
          <span
            className="licznik-mechaniczny__tasma"
            style={{
              transform: `translateY(${-Number(cyfra) * 10}%)`,
              // kolumny dojezdzaja kaskadowo, ale nigdy powyzej capu
              transitionDuration: `${Math.min(CAP_MS, MS_NA_POZYCJE * (i + 1))}ms`,
            }}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span className="licznik-mechaniczny__cyfra" key={n}>
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
