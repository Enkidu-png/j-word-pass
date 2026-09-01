// Pytanie 14: dziesiec kamykow od 1 do 10. Kamyk 10 blyska diamentowo dopiero
// wtedy, gdy wpis w luke pasuje do klucza - slot ma wtedy data-otwarte-trafione.
export default function SkalaTwardosci() {
  return (
    <span className="sig sig--skala" aria-hidden="true">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <span key={n} className="sig__kamyk" data-twardosc={n} style={{ width: `${8 + n}px`, height: `${8 + n}px` }}>
          {n === 10 ? <span className="sig__diament gif-less" /> : null}
        </span>
      ))}
      <span className="sig__podpis">OD TALKU DO DIAMENTU</span>
    </span>
  );
}
