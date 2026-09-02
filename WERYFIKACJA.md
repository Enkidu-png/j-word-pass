# WERYFIKACJA - lista kontrolna dla Aleksandry

Aleksandro, to jest lista rzeczy, ktore Komisja twierdzi, ze zbudowala. Kazdy punkt
mowi: co uruchomic, co kliknac, czego dokladnie sie spodziewac i czym to zmierzyc.
Odhaczaj tylko to, co ZOBACZYSZ. Jesli punkt nie wychodzi, zapisz numer punktu.

Lista jest zbudowana z issues faktycznie zamknietych w `plan/11-BACKLOG.md`
(F0 do F7). Punkty oznaczone **ZNANY BLAD** juz padaja u recenzenta, wiec jesli
padna i u Ciebie, to nie Twoja wina.

## 0. Przygotowanie

- [ ] `pnpm dev` w katalogu projektu, otworz `http://localhost:3000`. Konsola ma
      wypisac `Ready`, a strona odpowiedziec 200.
- [ ] Do sprawdzenia wersji produkcyjnej (wazne, patrz punkty 6.4 i 8.3):
      `pnpm build && npx next start -p 3100`, potem `http://localhost:3100`.
      Wersja dev i produkcyjna zachowuja sie INACZEJ, wiec dwa punkty trzeba
      sprawdzic na 3100.
- [ ] `pnpm run check` konczy sie linia `lint-tokens: czysto` i zerem bledow
      TypeScriptu. To automat pilnujacy zasad Z1, Z2, Z3, Z5, Z6, Z9, Z14.
- [ ] `npx playwright test` konczy sie okolo `365 passed`. Jeden test potrafi
      paść, patrz punkt 8.3.

## 1. Wyglad ogolny (zasady Z7, Z8, Z9, Z6)

- [ ] **1.1 Kursor.** Na kazdej stronie kursor myszy to animowany GIF, a nie
      strzalka systemowa. Sprawdz na `/`, `/egzamin`, `/quiz`, `/proba-ognia`.
- [ ] **1.2 Wlasny kafel na kazdej stronie.** Tlo to POWTARZANY obrazek, inny na
      kazdej stronie: brama to gwiazdy, egzamin to swoj kafel, quiz swoj,
      proba ognia to plomienie, 404 swoj. Pomiar: DevTools, zakladka Elements,
      zaznacz `<html>`, w Computed poszukaj `background-image`. Ma tam byc
      `kafel-brama.png` / `kafel-egzamin.png` / `kafel-quiz.png` /
      `kafel-ogien.png` / `kafel-404.png` oraz `background-repeat: repeat`
      i `background-size: auto`. Zadnego `cover`, zadnego gradientu.
- [ ] **1.3 Gestosc.** Na kazdym widoku ma sie ruszac co najmniej szesc rzeczy.
      Zmierzone przez recenzenta: brama 22, egzamin 73, quiz 20, proba ognia 23,
      404 24. Policz na oko, czy nie ma pustych plach.
- [ ] **1.4 Rogi.** Na dole kazdego widoku dwa te same stwory w przeciwleglych
      rogach, prawy odbity lustrzanie: brama i proba ognia to delfiny, quiz to
      koty, egzamin to osmiornice, 404 to ptaki i osmiornice.
- [ ] **1.5 Pasy.** Co najmniej jeden waski animowany pas na cala szerokosc:
      brama ma dolny pas budowlany, quiz gorny pas balonow, proba ognia cienki
      pas u gory i u dolu.
- [ ] **1.6 Nic nie jest przekrzywione.** Zaden naglowek, karta, druk ani
      pieczatka nie stoi pod katem. Jedyny obrot w calym projekcie to obracajacy
      sie szescian na ekranie ladowania (punkt 2.1).
- [ ] **1.7 Zero emoji w interfejsie.** Wszystkie ozdoby to GIF-y. Serduszko
      i koperta w stopce to obrazki, nie emoji.
- [ ] **1.8 Zero dlugich myslnikow i kropek srodkowych.** Nigdzie nie ma znaku
      `—` ani `·`. Pomiar automatyczny: `npx playwright test tests/kanon.spec.ts`.

## 2. Brama (strona glowna `/`)

- [ ] **2.1 Ekran ladowania.** Pierwsze wejscie na `/` w nowej karcie: pelny ekran
      z obracajacym sie szescianem 3D. Znika sam po okolo 4 sekundach. Odswiez
      strone: ekran NIE pokazuje sie drugi raz w tej samej karcie.
- [ ] **2.2 Naglowek.** Napis `J-WORD PASS` jest chromowanym obrazkiem, nie
      zwyklym tekstem. Nie jest przyciety przy zadnej krawedzi. Sprawdz takze
      przy szerokosci okna 390 px (DevTools, tryb urzadzenia mobilnego).
- [ ] **2.3 Statek i strzalka.** Nad naglowkiem lata statek, pod podtytulem
      przewija sie tam i z powrotem napis `< PRZEWIŃ W DÓŁ, ALEKSANDRO >`
      i miga strzalka w dol.
- [ ] **2.4 Tablica ogloszen.** Szesc ozdob w dwoch rzedach po trzy, kazda miga
      w INNYM momencie (nie wszystkie naraz).
- [ ] **2.5 Przycisk-uciekinier.** Najedz myszka na `WOLĘ NIE`. Ma uciec.
      Zabierz kursor, najedz znowu. Ma uciec drugi raz. I trzeci raz. Za CZWARTYM
      razem ma stanac i zmienic napis na `DOBRZE, ALEKSANDRO, NIECH BĘDZIE`.
      Zmierzone przez recenzenta: dokladnie 3 skoki, potem kapitulacja.
- [ ] **2.6 Uciekinier nie zaslania.** W zadnym z trzech skokow przycisk nie
      przykrywa przycisku `PRZYSTĘPUJĘ DO ETAPU 1`.
- [ ] **2.7 Na telefonie nie ucieka.** W trybie urzadzenia dotykowego (DevTools,
      ikona telefonu) przycisk stoi w miejscu i da sie go zwyczajnie kliknac.
- [ ] **2.8 Wejscie.** Klikniecie `PRZYSTĘPUJĘ DO ETAPU 1` przenosi na `/egzamin`.
      Pole z imieniem jest wypelnione `ALEKSANDRA` i nie da sie go edytowac.

## 3. Etap 1: Egzamin (`/egzamin`)

- [ ] **3.1 Plonacy napis.** `EGZAMIN JASIU` ma pod soba poswiate i ogien
      w kilkunastu punktach. Napis stoi prosto.
- [ ] **3.2 Scena kosmiczna.** Planeta, statek i dwanascie migajacych gwiazdek.
- [ ] **3.3 Tresc.** Druk `DANE DO ZADANIA` ma szesc zalozen (zebry, jetpacki,
      slon, masa, akademia wojskowa, przyspieszenie od odrzutu). Druk
      `TREŚĆ PYTANIA` mowi do Ciebie po imieniu, dwa razy `Aleksandro`.
- [ ] **3.4 Licznik znakow.** Pisz w ramce. Pod nia licznik `ZNAKÓW: N Z 8000`
      rosnie na biezaco.
- [ ] **3.5 Pusta odpowiedz.** Wyczysc pole i kliknij `ODDAJ PRACĘ KOMISJI`.
      Ma wyjsc werdykt `PUSTKA.` i zero punktow, bez pytania modelu.
- [ ] **3.6 Ceremonia oceny.** Wpisz cokolwiek sensownego i oddaj. Ma sie pokazac
      ekran narady (szescian w wariancie `narada`) z dymkami Komisji, a po nim
      werdykt: `ZDANE`, wynik `N/10` i komentarz. Sprawdzone przez recenzenta na
      zywym modelu: `7/10`, komentarz zaczynal sie od `Szanowna Aleksandro`.
- [ ] **3.7 Komentarz mowi do Ciebie.** W komentarzu ma padac `Aleksandro`.
      Nie moze byc slowa `kandydatka` ani `kandydat`.
- [ ] **3.8 Komentarz bez zakazanych znakow.** W komentarzu nie ma `—` ani `·`.
      To wycina sanitizer po stronie serwera, wiec dziala takze wtedy, gdy model
      ich uzyje.
- [ ] **3.9 Awaria Komisji.** Zatrzymaj serwer, w `.env.local` zakomentuj
      `OPENROUTER_API_KEY`, uruchom `pnpm dev` ponownie i oddaj prace.
      Zamiast bledu ma wyjsc werdykt awaryjny (jeden z co najmniej pieciu
      wariantow z `data/komisja.json`). Potem przywroc klucz.
- [ ] **3.10 Powrot.** Odswiez `/egzamin` po werdykcie. Wynik ma zostac, ceremonia
      NIE ma sie powtorzyc.
- [ ] **3.11 Przejscie dalej.** Przycisk `PRZEJDŹ DO ETAPU 2` prowadzi na `/quiz`.

## 4. Etap 2: Quiz (`/quiz`)

- [ ] **4.1 Straz etapu.** Otworz `/quiz` w NOWEJ karcie (bez zdanego egzaminu).
      Zamiast quizu ma byc druk odmowny `ALEKSANDRO, KOMISJA ZABRANIA. NAJPIERW
      ETAP 1.` z linkiem powrotu. Adres w pasku ma zostac `/quiz`.
- [ ] **4.2 Pietnascie pytan.** Licznik `PYTANIE 01 / 15`. Pytanie 14 jest otwarte
      (pole tekstowe), reszta ma warianty A, B, C, D.
- [ ] **4.3 Rzad kwadratow.** Pod karta rzad 15 kwadratow. Klikniecie kwadratu
      przenosi do tego pytania. Kwadraty z odpowiedzia wygladaja inaczej niz puste.
- [ ] **4.4 Kwadraty z klawiatury.** Tabem dojdz do kwadratu, wcisnij Enter.
      Ma przeskoczyc do tego pytania.
- [ ] **4.5 Nawigacja strzalkami.** Strzalki lewo i prawo przewracaja pytania
      OD RAZU po wejsciu na `/quiz`, bez klikania w cokolwiek (patrz 8.3).
- [ ] **4.6 Strzalki w polu tekstowym.** W pytaniu 14 wpisz slowo, wroc kursorem
      strzalka w srodek slowa. Kursor ma sie przesuwac w tekscie, a NIE zmieniac
      pytania.
- [ ] **4.7 Zapis stanu.** Odpowiedz na kilka pytan, odswiez strone.
      Zaznaczenia maja zostac.
- [ ] **4.8 Ozdoby pytan.** Kazde pytanie ma wlasna ozdobe obok tresci
      (osmiornica przy pytaniu o osmiornice, dyskietka przy pytaniu o dyskietke
      i tak dalej). Najedz na nia myszka: ma zareagowac.
- [ ] **4.9 Maszyna prawdy.** Odpowiedz na wszystkie 15 i kliknij
      `ODDAJ ARKUSZ KOMISJI`. Werdykty maja wychodzic PO KOLEI, mniej wiecej
      jeden co pol sekundy, nie wszystkie naraz.
- [ ] **4.10 Escape skraca ceremonie.** W trakcie odsłaniania wcisnij Escape.
      Wszystkie werdykty maja wyskoczyc od razu, a wynik ma sie zgadzac z tym,
      co by wyszlo bez skracania.
- [ ] **4.11 Tryb rewizji.** Po wyniku przycisk `OBEJRZYJ ARKUSZ` pozwala
      przejsc po pytaniach i zobaczyc, gdzie byl blad. Zle odpowiedzi sa
      przekreslone POZIOMO, bez skosu.
- [ ] **4.12 Wynik zostaje.** Odswiez `/quiz`. Wynik ma sie odtworzyc, ceremonia
      ma sie NIE powtorzyc.
- [ ] **4.13 Przejscie dalej.** `PRZEJDŹ DO PRÓBY OGNIA` prowadzi na
      `/proba-ognia`.

## 5. Etap 3: Proba ognia (`/proba-ognia`)

- [ ] **5.1 Straz etapu.** `/proba-ognia` w nowej karcie ma dac druk odmowny
      `NAJPIERW ETAP 2`.
- [ ] **5.2 Ognisko.** Piec plomieni i kot obok nich. Plomienie zyja.
- [ ] **5.3 Druk OGN-3/TAJ.** Trzy pola: adres e-mail, rozmiar buta, srednica
      ucha w milimetrach. Przy dwoch ostatnich stoja ozdoby (but i ucho).
- [ ] **5.4 Zgoda.** Przycisk `SKŁADAM WNIOSEK` jest wygaszony i niedostepny
      dopoki nie zaznaczysz checkboxa `ALEKSANDRO, POTWIERDZAM...`.
- [ ] **5.5 Walidacja adresu.** Wpisz `nie-adres`, zaznacz zgode, wyslij.
      Ma wyskoczyc `ALEKSANDRO, TO NIE JEST ADRES`. Zmierzone przez recenzenta,
      dziala.
- [ ] **5.6 Walidacja liczb.** Rozmiar buta 5 albo 200 ma zostac odrzucony
      (skala 10 do 70). Srednica ucha 1 albo 900 tez (skala 5 do 500).
- [ ] **5.7 Walidacja po stronie serwera.** Dowod, ze to nie tylko HTML:
      `curl -s -X POST localhost:3000/api/zgloszenie -H 'content-type: application/json' -d '{"email":"zle","rozmiarButa":38,"srednicaUchaMm":60,"punktyEgzamin":8,"punktyQuiz":12}'`
      ma zwrocic 400 i tresc o adresie, mimo ze formularza tu nie ma.
- [ ] **5.8 Ceremonia spalenia.** Poprawny druk plus zgoda plus wyslanie:
      druk ma splonac na ekranie.
- [ ] **5.9 List w butelce.** Po spaleniu zostaje butelka i napis
      `ALEKSANDRO, ZOSTAŁA BUTELKA.` oraz przewijajacy sie `KLIKNIJ BUTELKĘ,
      ALEKSANDRO`. Kliknij butelke: ma sie otworzyc list.
- [ ] **5.10 Butelka z klawiatury.** Tabem dojdz do butelki i wcisnij Enter.
      Ma zadzialac tak samo jak klikniecie.
- [ ] **5.11 PassOMetr.** Po wyslaniu druku trzeci etap w pasku u gory zmienia sie
      na `ZALICZONE`.
- [ ] **5.12 Gdzie ladują dane.** Na `pnpm dev` zgloszenie NIE idzie do chmury,
      tylko do logu serwera. W konsoli `pnpm dev` ma sie pojawic linia
      `[zgloszenie dev-log] zgloszenia/...` z Twoim adresem. To celowe.

## 6. Radio Komisji (stopka, wszystkie strony)

- [ ] **6.1 Cisza na starcie.** Zaraz po wejsciu na strone NIC nie gra. Napis
      w okienku radia: `KLIKNIJ WŁĄCZ, ALEKSANDRO`.
- [ ] **6.2 Zero ruchu do YouTube przed gestem.** DevTools, zakladka Network,
      filtr `youtube`. Przed klikniecim `WŁĄCZ` ma byc PUSTO. Zmierzone przez
      recenzenta: 0 zadan przed gestem, 31 po.
- [ ] **6.3 Po gescie gra.** Klikniecie `WŁĄCZ` uruchamia koncert Post Malone
      Tiny Desk. Suwak `GŁOŚNOŚĆ` dziala.
- [ ] **6.4 Pamiec wlaczenia.** Po `WŁĄCZ` w DevTools, Application, Local Storage
      ma byc klucz `jwp.audio` o wartosci `on`.
- [ ] **6.5 Link zrodlowy.** Pod odtwarzaczem link `youtu.be/oCcks-fwq2c`
      prowadzi do koncertu.

## 7. Dostepnosc i szacunek dla ustawien (Z10, Z11)

- [ ] **7.1 Widoczny fokus.** Przejdz Tabem przez cala strone. KAZDY element
      dostaje magentowa kreskowana obwodke. Zmierzone przez recenzenta na
      `/proba-ognia`: `outline: dashed 3px rgb(255, 0, 200)` na wszystkich
      dziesieciu elementach w kolejce Taba.
- [ ] **7.2 Cala sciezka klawiatura.** Przejdz od bramy do listu w butelce
      SAMA KLAWIATURA, bez ani jednego klikniecia. Automat przechodzi te droge
      w tescie `tests/f6-01.spec.ts` w 15 krokach.
- [ ] **7.3 Zatrzymanie ruchu.** Wlacz w systemie ograniczenie animacji
      (macOS: Ustawienia, Dostepnosc, Wyswietlacz, Ogranicz ruch) albo
      w DevTools: Rendering, `Emulate prefers-reduced-motion: reduce`.
      Odswiez strone. Wszystkie GIF-y maja zamienic sie w nieruchome obrazki,
      a animacje CSS maja stanac.
- [ ] **7.4 Gorny pasek tez stoi.** Przy wlaczonym ograniczeniu ruchu pasek
      `KOMISJA CZUWA - ALEKSANDRO, KOMISJA CZUWA` ma STAC. To byl blad znaleziony
      przez recenzenta i naprawiony: DevTools, zaznacz `.pas-goniec__tresc`,
      Computed, `animation-name` ma byc `none`. Zmierzone po naprawie na buildzie
      produkcyjnym: `none` na wszystkich paskach na `/`, `/egzamin`, `/quiz`
      i `/proba-ognia`.

## 8. Bledy z recenzji koncowej (napraw sprawdzona, potwierdz u siebie)

Recenzent znalazl cztery rzeczy, wszystkie zostaly naprawione i zmierzone na
buildzie PRODUKCYJNYM (`pnpm build && npx next start -p 3100`), nie na `pnpm dev`.
Tu potwierdzasz, ze u Ciebie tez dzialaja.

- [ ] **8.1 Nazwa trzeciego etapu ma polska litere.** Pasek PassOMetr i wielki
      naglowek na `/proba-ognia` mowia `PRÓBA OGNIA`, nie `PROBA OGNIA`. Kreska
      nad `Ó` ma byc widoczna w calosci, nie ucieta u gory.
- [ ] **8.2 Brama mowi do Ciebie.** Etykieta pola na bramie brzmi
      `TWOJE IMIĘ, ALEKSANDRO`, nie `IMIĘ KANDYDATKI`. To samo w druku etapu 3:
      `TWÓJ ROZMIAR BUTA` i `ŚREDNICA TWOJEGO UCHA W MILIMETRACH`.
- [ ] **8.3 Strzalki w quizie dzialaja od razu, takze w produkcji.** Na
      `localhost:3100` wejdz na `/quiz` i wcisnij strzalke w prawo dwa razy,
      NIC wczesniej nie klikajac. Licznik ma pokazac `PYTANIE 03 / 15`.
      Wczesniej stal na `PYTANIE 01 / 15`, bo nasluch wisial na sekcji, do
      ktorej fokus nigdy nie docieral.
- [ ] **8.4 Pytania quizu tez mowia po imieniu.** Przejrzyj 15 pytan. Osiem
      z nich zaczyna sie od `Aleksandro,` (reszta ma wlasna tresc, w ktorej
      zwrot by nie pasowal).

## 9. Bezpieczenstwo (sprawdzenie jednorazowe)

- [ ] **9.1 Zero kluczy w repozytorium.**
      `git log -p | grep -c "sk-or-v1"` ma dac `0`.
      `git ls-files | grep env` ma pokazac wylacznie `.env.example`.
- [ ] **9.2 `.env.example` bez wartosci.** Plik ma miec `OPENROUTER_API_KEY=`
      i `BLOB_READ_WRITE_TOKEN=` z pustymi wartosciami.
- [ ] **9.3 Playground nie wychodzi na produkcje.** Na `localhost:3100`
      adres `/dev/scena` ma zwrocic 404. Sprawdzone przez recenzenta: zwraca.

## 10. Bramka F8 (decyzja nalezy do Ciebie)

- [ ] **10.1** Obejrzalas URL preview i te liste.
- [ ] **10.2** Punkty z sekcji 7.4 i 8 potwierdzone u Ciebie. Wszystkie zostaly
      naprawione po recenzji, ale to Ty je odbierasz.
- [ ] **10.3** Zgadzasz sie na `vercel deploy --prod`, czyli na podmiane zywej
      produkcji wersja druga. Bez tego checkboxa nikt nie wdraza.

## 11. JAK PRZECZYTAC PRACE (dla Jana, nie dla Aleksandry)

Oceniane odpowiedzi i zlozone druki leza w PRYWATNYM store'ie Vercel Blob
`jwp-zgloszenia`. Panelu w aplikacji NIE MA i nie bedzie - czyta sie je
dashboardem Vercela albo z linii polecen. Dwa katalogi:

- `odpowiedzi/<ISO-timestamp>-czesc<N>-<losowe6>.json` - jedna oceniona
  odpowiedz egzaminacyjna: `{ czesc, odpowiedz, punkty, komentarz, model, ts }`.
  Powstaje przy KAZDEJ udanej ocenie, wiec sa tu tez podejscia porzucone
  przed koncem.
- `zgloszenia/<ISO-timestamp>-<losowe6>.json` - komplet z konca przeplywu:
  e-mail, rozmiar buta, srednica ucha, punkty obu etapow oraz `czesc1`
  i `czesc2` z pelna trescia odpowiedzi i werdyktami.

Przepis CLI (`VERCEL_OIDC_TOKEN` z `.env.local` NIE wystarcza, komendy
`vercel blob` wymagaja jawnego tokena zapisu):

```bash
# 1. token do pliku TYMCZASOWEGO poza repo
vercel env pull /tmp/jwp.env --environment=production --yes
TOK=$(grep '^BLOB_READ_WRITE_TOKEN=' /tmp/jwp.env | cut -d= -f2- | tr -d '"')

# 2. listing (wszystko / tylko prace / tylko druki)
vercel blob list --rw-token "$TOK"
vercel blob list --prefix odpowiedzi/ --rw-token "$TOK"
vercel blob list --prefix zgloszenia/ --rw-token "$TOK"

# 3. pobranie jednego pliku po sciezce z listingu.
#    Flaga --access private jest OBOWIAZKOWA, bez niej CLI odmawia.
vercel blob get "odpowiedzi/2026-09-02T10:04:58.069Z-czesc1-4tivwh.json" \
  --access private --rw-token "$TOK"

# 4. posprzataj token
rm /tmp/jwp.env
```

Uwaga: zapis dziala WYLACZNIE na produkcji. Lokalny `pnpm dev` i testy
wypisuja te same dane do konsoli z prefiksem `[blob dev-log]` i nie dotykaja
platnego store'a.
