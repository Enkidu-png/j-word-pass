import type { Metadata } from "next";
import "./globals.css";
import KometaKursora from "@/components/KometaKursora";
import PasekKrawedzi from "@/components/PasekKrawedzi";
import PassOMetr from "@/components/PassOMetr";
import StrazEtapu from "@/components/StrazEtapu";
import WebringStopki from "@/components/WebringStopki";

export const metadata: Metadata = {
  title: "J-WORD PASS",
  description: "System egzaminacyjny Międzygalaktycznej Komisji Kwalifikacyjnej.",
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
        <WebringStopki />
        <KometaKursora />
      </body>
    </html>
  );
}
