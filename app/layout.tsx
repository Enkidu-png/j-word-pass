import type { Metadata } from "next";
import "./globals.css";
import KometaKursora from "@/components/KometaKursora";

export const metadata: Metadata = {
  title: "J-WORD PASS",
  description: "System egzaminacyjny Międzygalaktycznej Komisji Kwalifikacyjnej.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        {children}
        <KometaKursora />
      </body>
    </html>
  );
}
