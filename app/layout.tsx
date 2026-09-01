import type { Metadata } from "next";
import "./globals.css";
import KometaKursora from "@/components/KometaKursora";
import PasekKrawedzi from "@/components/PasekKrawedzi";
import PassOMetr from "@/components/PassOMetr";
import RadioKomisji from "@/components/RadioKomisji";
import StrazEtapu from "@/components/StrazEtapu";
import WebringStopki from "@/components/WebringStopki";

export const metadata: Metadata = {
  title: "J-WORD PASS",
  description: "System egzaminacyjny Międzygalaktycznej Komisji Kwalifikacyjnej.",
  // og:image dokleja sam Next z `app/opengraph-image.tsx`; tu tylko tytul i opis
  openGraph: {
    title: "J-WORD PASS /// KOMISJA CZUWA",
    description: "Trzy etapy: egzamin z fizyki, quiz o wszystkim i o niczym, próba ognia.",
    type: "website",
    locale: "pl_PL",
  },
};

// Kolejnosc DOM wg plan/04 sekcja A. Nawigacja to PassOMetr i webring -
// zero sticky headera, zero hamburgera, zero stopki w czterech kolumnach.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <PasekKrawedzi />
        <PassOMetr />
        <StrazEtapu />
        {children}
        <RadioKomisji />
        <WebringStopki />
        <KometaKursora />
      </body>
    </html>
  );
}
