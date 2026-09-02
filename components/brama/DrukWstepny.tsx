"use client";

import { useRouter } from "next/navigation";

// Druk wstepny bramy (plan/05 B1 punkt 8). Imie jest wpisane na sztywno
// i readOnly - to zart dla jednej osoby, a nie formularz rejestracji.
// Ceremonia wejscia (ekran ladowania przed nawigacja) dochodzi w F2-04,
// tutaj klik prowadzi wprost na etap 1.
export default function DrukWstepny() {
  const router = useRouter();

  return (
    <form
      className="druk-wstepny"
      onSubmit={(zdarzenie) => {
        zdarzenie.preventDefault();
        router.push("/egzamin");
      }}
    >
      <label className="druk-wstepny__etykieta" htmlFor="imie-kandydatki">
        IMIĘ KANDYDATKI
      </label>
      <input
        className="druk-wstepny__pole"
        id="imie-kandydatki"
        name="imie"
        data-pole="imie"
        value="ALEKSANDRA"
        readOnly
      />
      <button className="druk-wstepny__cta" type="submit" data-cta="przystepuje">
        PRZYSTĘPUJĘ DO ETAPU 1
      </button>
    </form>
  );
}
