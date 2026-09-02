import type { Metadata } from "next";
import "./globals.css";
import komisja from "@/data/komisja.json";
import PasGoniec from "@/components/scena/PasGoniec";
import BramaWstepu from "@/components/shell/BramaWstepu";
import FokusNaNaglowku from "@/components/shell/FokusNaNaglowku";
import PassOMetr from "@/components/shell/PassOMetr";
import StrazEtapu from "@/components/shell/StrazEtapu";
import StopkaWebring from "@/components/shell/StopkaWebring";

// Bez `metadataBase` Next sklada absolutne URL-e obrazka OG na localhost:3000 -
// podglad linku na Slacku czy Discordzie wtedy nie dziala. Na Vercelu adres
// produkcyjny siedzi w VERCEL_PROJECT_PRODUCTION_URL (bez schematu).
const ADRES = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(ADRES),
  title: "J-WORD PASS",
  description: "System egzaminacyjny Międzygalaktycznej Komisji Kwalifikacyjnej.",
  // og:image wraca w F6-03 razem z `app/opengraph-image.tsx`; tu tylko tytul i opis
  openGraph: {
    title: "J-WORD PASS /// KOMISJA CZUWA",
    description: "Trzy etapy: egzamin z fizyki, quiz o wszystkim i o niczym, próba ognia.",
    type: "website",
    locale: "pl_PL",
  },
};

// Kolejnosc w DOM wiazaca (plan/05 A). EkranLadowania wchodzi w F2-04,
// RadioTinyDesk w F5-03 (slot na niego stoi juz w stopce).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        {/* Petent z waznym wpisem nie moze zobaczyc nawet jednej klatki nakladki,
            a nakladka MUSI byc w HTML-u z serwera (inaczej mignelaby tresc pod
            nia). Rozstrzyga to atrybut postawiony przed pierwszym malowaniem;
            reszta reguly siedzi w app/style/wstep.css. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("jwp.wstep"))document.documentElement.dataset.wstep="1"}catch(e){}`,
          }}
        />
      </head>
      <body>
        <BramaWstepu />
        <PasGoniec tekst={komisja.gonce.gora} wariant="odbijany" czas={12000} />
        <PassOMetr />
        <FokusNaNaglowku />
        <main className="tresc">
          <StrazEtapu>{children}</StrazEtapu>
        </main>
        <StopkaWebring />
      </body>
    </html>
  );
}
