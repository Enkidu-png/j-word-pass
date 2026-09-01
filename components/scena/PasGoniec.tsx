"use client";

// Odpowiednik <marquee> na CSS (plan/04 H). Sam <marquee> dziala, ale nie slucha
// prefers-reduced-motion i wywala walidacje HTML, wiec ruch robimy animacja,
// ktora Z11 potrafi zatrzymac.
export default function PasGoniec({
  tekst,
  wariant = "zwykly",
  czas = 12000,
}: {
  tekst: string;
  wariant?: "zwykly" | "odbijany";
  czas?: number;
}) {
  return (
    <div
      data-goniec={wariant}
      className={`pas-goniec pas-goniec--${wariant}`}
    >
      <span className="pas-goniec__tresc" style={{ animationDuration: `${czas}ms` }}>
        {tekst}
      </span>
    </div>
  );
}
