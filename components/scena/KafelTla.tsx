import { assetPo } from "@/lib/assety";

// Z9: kazdy widok ma wlasny kafel tla, powtarzany przez background-repeat,
// BEZ background-size, w oryginalnej rozdzielczosci.
//
// Kafel siedzi na <html>, a widok jest w <body>, wiec zaden styl komponentu go
// tam nie dosiegnie. Zamiast tego widok renderuje jedna regule - sciezka idzie
// z manifestu, nie z JSX ani z arkusza, wiec zakaz twardych sciezek do assetow
// zostaje utrzymany. Element <style> renderuje sie po stronie serwera, wiec tlo
// jest takze bez JS, a przy nawigacji na inny widok znika razem z komponentem.
//
// `html:root` zamiast `html`: globals.css ustawia `html { background: ... }`,
// a skrot zerowalby nam obrazek. Wyzsza specyficznosc jest tu pewniejsza niz
// poleganie na kolejnosci wstrzykiwania arkuszy przez Next.
export default function KafelTla({ id }: { id: string }) {
  const kafel = assetPo(id);
  return <style>{`html:root{background-image:url("${kafel.plik}");background-repeat:repeat}`}</style>;
}
