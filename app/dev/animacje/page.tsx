const WARIANTY = [
  { klasa: "gif-less--blink", nazwa: "blink", opis: "znika i wraca, steps(2), 700 ms" },
  { klasa: "gif-less--majtanie", nazwa: "majtanie", opis: "kolysze sie ±12deg, steps(4), 900 ms" },
  { klasa: "gif-less--skok", nazwa: "skok", opis: "podskok o 6 px, steps(3), 500 ms" },
  { klasa: "gif-less--obrot", nazwa: "obrot", opis: "pelny obrot, steps(8), 1400 ms" },
  { klasa: "gif-less--jazda", nazwa: "jazda", opis: "przesuw kafla, steps(8), 1200 ms" },
  { klasa: "gif-less--chrom", nazwa: "chrom", opis: "blysk po gradiencie, steps(6), 1300 ms" },
  { klasa: "gif-less--tancz", nazwa: "tancz", opis: "odbicie scaleX, steps(2), 600 ms" },
];

const KAFLE = [
  { klasa: "kafel--kosmos", nazwa: "kosmos" },
  { klasa: "kafel--zebra", nazwa: "zebra" },
  { klasa: "kafel--urzad", nazwa: "urzad" },
  { klasa: "kafel--ogien", nazwa: "ogien" },
  { klasa: "kafel--morze", nazwa: "morze" },
];

// Desynchronizacja: kazda dekoracja ma wlasny start liczony z indeksu (03 sekcja B).
const opoznienie = (i: number) => `${(i * 137) % 900}ms`;

export default function Playground() {
  return (
    <main style={{ padding: "24px" }}>
      <h1 tabIndex={-1} className="gif-less gif-less--chrom" style={{ fontFamily: "var(--font-krzyk)" }}>
        PLAC PROB KOMISJI
      </h1>
      <p>DEKORACJE /// 7 WARIANTOW /// 5 KAFLI</p>

      <h2>WARIANTY gif-less</h2>
      <ul style={{ display: "flex", flexWrap: "wrap", gap: "24px", listStyle: "none", padding: 0 }}>
        {WARIANTY.map((w, i) => (
          <li
            key={w.klasa}
            data-wariant={w.nazwa}
            style={{ width: "220px", border: "var(--ramka)", padding: "12px" }}
          >
            <div
              style={{
                height: "72px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className={`gif-less ${w.klasa}`}
                style={{
                  animationDelay: opoznienie(i),
                  fontFamily: "var(--font-krzyk)",
                  backgroundImage:
                    w.klasa === "gif-less--jazda"
                      ? "repeating-linear-gradient(90deg, var(--chrom-a) 0 24px, var(--chrom-c) 24px 48px)"
                      : undefined,
                  display: "inline-block",
                  padding: "4px 10px",
                }}
              >
                KOMISJA
              </span>
            </div>
            <p style={{ fontSize: "var(--rozmiar-drobny)", margin: 0 }}>
              {w.nazwa} /// {w.opis}
            </p>
          </li>
        ))}
      </ul>

      <h2>KAFLE TLA</h2>
      <ul style={{ display: "flex", flexWrap: "wrap", gap: "24px", listStyle: "none", padding: 0 }}>
        {KAFLE.map((k, i) => (
          <li key={k.klasa} data-kafel={k.nazwa}>
            <div
              className={`kafel-tla ${k.klasa}${k.klasa === "kafel--morze" ? " gif-less gif-less--jazda" : ""}`}
              style={{
                width: "220px",
                height: "120px",
                border: "var(--ramka)",
                animationDelay: opoznienie(i),
              }}
            />
            <p style={{ fontSize: "var(--rozmiar-drobny)", margin: 0 }}>{k.nazwa}</p>
          </li>
        ))}
      </ul>

      <h2>SCIANA DEKORACJI (budzet: 20 sztuk + kafel)</h2>
      <div
        className="kafel-tla kafel--kosmos"
        data-sciana=""
        style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "12px" }}
      >
        {Array.from({ length: 20 }, (_, i) => (
          <span
            key={i}
            className={`gif-less ${WARIANTY[i % WARIANTY.length].klasa}`}
            style={{
              animationDelay: opoznienie(i),
              display: "inline-block",
              width: "24px",
              height: "24px",
              background: "var(--chrom-b)",
            }}
          />
        ))}
      </div>
    </main>
  );
}
