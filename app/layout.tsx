import type { Metadata } from "next";
import "./globals.css";

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

// Shell (pas-goniec, PassOMetr, StrazEtapu, webring) wraca w F2-01.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
