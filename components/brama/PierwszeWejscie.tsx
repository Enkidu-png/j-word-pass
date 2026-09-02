"use client";

import { useEffect, useState } from "react";
import EkranLadowania from "@/components/scena/EkranLadowania";

// Ekran ladowania przy PIERWSZYM wejsciu na brame w sesji (plan/05 B1 punkt 1).
// Klucz w sessionStorage, wiec drugie wejscie w tej samej karcie juz go nie
// pokazuje, a nowa karta zaczyna ceremonie od nowa.
const KLUCZ = "jwp.ladowanie";

export default function PierwszeWejscie() {
  // Decyzja zapada dopiero po montazu: serwer nie zna sessionStorage, a render
  // ekranu po stronie serwera dalby migniecie nakladki takze przy drugim wejsciu.
  const [widoczny, ustawWidoczny] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(KLUCZ)) return;
      window.sessionStorage.setItem(KLUCZ, "1");
    } catch {
      // tryb prywatny: ceremonia po prostu sie nie pokazuje, strona dziala
      return;
    }
    ustawWidoczny(true);
  }, []);

  if (!widoczny) return null;
  return <EkranLadowania wariant="start" naKoniec={() => ustawWidoczny(false)} />;
}
