import Link from "next/link";
import Pieczatka from "@/components/Pieczatka";

// 404 w stylu Komisji (plan/06... a dokladnie F6-03): druk, pieczatka i droga
// powrotna do bramy. Shell (pasek, PassOMetr, radio, webring) dostaje kandydat
// z layoutu, wiec stopka zostaje spojna z reszta serwisu (plan/04 A pkt 5).

export const metadata = { title: "AKTA ZAGINĘŁY /// J-WORD PASS" };

export default function NieZnaleziono() {
  return (
    <main className="brak-akt">
      {/* chromowy gradient czyta sie WYLACZNIE na ciemnym pasku - na papierze
          ginie (ta sama pulapka co w arkuszu egzaminu) */}
      <div className="brak-akt__pasek">
        <h1 className="brak-akt__krzyk gif-less gif-less--chrom" tabIndex={-1}>
          AKTA ZAGINĘŁY. NISZCZARKA BYŁA SZYBSZA.
        </h1>
      </div>
      <section className="formularz-F7 brak-akt__druk">
        <p className="brak-akt__numer">DRUK 404/NIC</p>
        <p>
          Komisja przeszukała segregator, szufladę i kosz. Pod tym adresem nie ma
          niczego, co dałoby się ostemplować.
        </p>
        <p className="brak-akt__pieczec">
          <Pieczatka tekst="BRAK AKT" ton="urzad" obrocDeg={-9} />
        </p>
        <Link className="brak-akt__powrot" href="/" data-do-bramy>
          WRACAM DO BRAMY I MELDUJĘ SIĘ PONOWNIE
        </Link>
      </section>
    </main>
  );
}
