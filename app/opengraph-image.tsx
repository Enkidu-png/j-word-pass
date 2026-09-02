import { ImageResponse } from "next/og";

// Obrazek OG (F6-03). `next/og` jest czescia `next`, wiec Z14 zostaje caly -
// zadnej nowej zaleznosci runtime. Absolutny URL sklada Next z `metadataBase`
// w `app/layout.tsx`, czyli na Vercelu z VERCEL_PROJECT_PRODUCTION_URL.
export const alt = "J-WORD PASS, Miedzygalaktyczna Komisja Kwalifikacyjna";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Obrazek() {
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
          gap: 24,
          background: "#000018",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 130, letterSpacing: 12, color: "#dcdcdc" }}>J-WORD PASS</div>
        <div style={{ fontSize: 38, letterSpacing: 6, color: "#39ff14" }}>
          MIEDZYGALAKTYCZNA KOMISJA KWALIFIKACYJNA
        </div>
        <div style={{ fontSize: 30, letterSpacing: 4, color: "#ff00c8" }}>
          ALEKSANDRO, KOMISJA CZUWA
        </div>
      </div>
    ),
    size,
  );
}
