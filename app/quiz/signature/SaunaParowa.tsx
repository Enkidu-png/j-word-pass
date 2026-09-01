// Pytanie 8: trzy kleby pary unosza sie nad napisem SAUNA, kazdy w swoim rytmie.
export default function SaunaParowa() {
  return (
    <span className="sig sig--sauna" aria-hidden="true">
      <span className="sig__para-blok">
        {[0, 1, 2].map((i) => (
          <span key={i} className="sig__para gif-less" style={{ animationDelay: `${(i * 137) % 900}ms` }} />
        ))}
      </span>
      <span className="sig__podpis">SAUNA</span>
    </span>
  );
}
