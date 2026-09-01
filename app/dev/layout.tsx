import { notFound } from "next/navigation";

// Plac prob jest narzedziem pracy, nie czescia egzaminu: w produkcji calego
// drzewa /dev nie ma. Brama zamknieta w layoucie (serwer), wiec chroni kazda
// przyszla podstrone playgroundu, nie tylko /dev/animacje.
export default function LayoutDev({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return children;
}
