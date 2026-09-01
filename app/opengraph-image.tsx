import { ImageResponse } from "next/og";

// Obrazek OG generowany w locie przez `next/og` - zero binariow w repo, zero
// nowych zaleznosci (plan/02 A). Satori NIE rozumie `var()`, wiec kolory musza
// byc literalami; dlatego ten plik jest wypisany w wyjatkach walidatora Z3
// (app/tokens.css i on). Uzyte wartosci to 1:1 tokeny: papier, atrament, urzad.

export const alt = "J-WORD PASS /// Miedzygalaktyczna Komisja Kwalifikacyjna";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ObrazOG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4e9c8",
          color: "#1a1447",
          // satori nie parsuje `border: ... double` ani skrotow z wieloma slowami -
          // podwojna ramka Komisji powstaje z dwoch prostokatow `solid`
          border: "18px solid #1a1447",
          padding: 10,
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: 4,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "6px solid #1a1447",
          }}
        >
        <div style={{ fontSize: 104 }}>J-WORD PASS</div>
        <div style={{ fontSize: 34, marginTop: 16 }}>
          SYSTEM PRZEPUSTEK MIĘDZYGALAKTYCZNEJ KOMISJI
        </div>
        <div
          style={{
            marginTop: 40,
            padding: "12px 28px",
            fontSize: 30,
            color: "#b3241a",
            border: "6px solid #b3241a",
            transform: "rotate(-4deg)",
          }}
        >
          EGZAMIN /// QUIZ /// PRÓBA OGNIA
        </div>
        </div>
      </div>
    ),
    size,
  );
}
