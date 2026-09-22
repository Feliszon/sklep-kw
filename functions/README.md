# Płatności P24 — Cloud Functions

Ten folder zawiera integrację płatności Przelewy24 (P24) jako Firebase Cloud
Functions (2nd gen, `onRequest`). Na tym etapie **nic nie jest zapisywane do
bazy danych** — celem jest przetestowanie samego flow płatności end-to-end.
Miejsca przewidziane pod przyszły zapis do Firestore są oznaczone `TODO`
(patrz [`src/processWebhookResult.js`](src/processWebhookResult.js)).

## Funkcje

| Funkcja              | Metoda | Rola |
|-----------------------|--------|------|
| `createPayment`       | POST   | Rejestruje transakcję w P24, zwraca URL do przekierowania klienta na stronę płatności. |
| `paymentWebhook`      | POST   | Odbiera powiadomienie od P24, weryfikuje podpis (CRC), wywołuje `Transaction/verify`, loguje wynik. |
| `paymentReturn`       | GET    | Obsługuje powrót klienta z P24, zwraca prosty status do frontendu. |
| `getPaymentMethods`   | GET    | Zwraca listę metod płatności aktualnie dostępnych w P24 (do wyświetlenia w checkoucie). |

## Wymagania

- Node.js 20
- Firebase CLI (`npm i -g firebase-tools` albo `npx firebase-tools`)
- Konto testowe P24 sandbox — rejestracja na https://sandbox.przelewy24.pl
  (osobne dane logowania/klucze niż konto produkcyjne)
- [ngrok](https://ngrok.com/) (albo inny tunel) — **wyłącznie do udostępnienia
  webhooka**, patrz niżej dlaczego

## Dlaczego w ogóle potrzebny jest ngrok?

P24 wysyła powiadomienie o statusie płatności (`paymentWebhook`) ze swoich
serwerów na adres `urlStatus`, który podajemy przy rejestracji transakcji.
Serwery P24 muszą więc mieć możliwość połączenia się z tym adresem przez
internet — lokalny emulator Firebase (`http://127.0.0.1:5001/...`) nie jest
z zewnątrz osiągalny, więc trzeba go wystawić tunelem.

**Adres powrotny (`urlReturn`, obsługiwany przez `paymentReturn`) NIE musi być
publiczny** — to tylko przekierowanie przeglądarki klienta, który i tak
korzysta lokalnie z `localhost:3000`.

## Konfiguracja

1. Zainstaluj zależności funkcji:
   ```bash
   cd functions
   npm install
   ```

2. Skopiuj `.env.example` do `.env` i uzupełnij danymi z panelu **sandbox**
   P24 (Ustawienia sklepu → Dane techniczne / Klucze):
   ```bash
   cp .env.example .env
   ```
   Uzupełnij: `P24_MERCHANT_ID`, `P24_POS_ID`, `P24_API_KEY`, `P24_CRC_KEY`.
   Zostaw `P24_ENV=sandbox`.

3. Zaloguj się do Firebase i podłącz projekt (potrzebny jakikolwiek projekt
   Firebase — może być darmowy, plan Spark, funkcje `onRequest` na emulatorze
   nie wymagają płatnego planu):
   ```bash
   firebase login
   firebase use --add
   ```
   Zaktualizuj `.firebaserc` w katalogu `sklep-kw/` swoim ID projektu.

## Uruchomienie sandboxa lokalnie

1. **Uruchom emulator funkcji** (z katalogu `sklep-kw/`):
   ```bash
   firebase emulators:start --only functions
   ```
   Zwróci lokalne adresy funkcji, np.:
   `http://127.0.0.1:5001/<project-id>/europe-west1/createPayment`

2. **Wystaw tunel ngrok na port emulatora** (domyślnie `5001`):
   ```bash
   ngrok http 5001
   ```
   Skopiuj publiczny adres (np. `https://abcd1234.ngrok-free.app`).

3. **Ustaw webhook w `functions/.env`** na publiczny adres z ngrok +
   ścieżkę do `paymentWebhook`:
   ```
   P24_WEBHOOK_URL=https://abcd1234.ngrok-free.app/<project-id>/europe-west1/paymentWebhook
   ```
   Zrestartuj emulator, żeby wczytał zmienną.

4. **Skonfiguruj frontend** — w katalogu `sklep-kw/` skopiuj
   `.env.local.example` do `.env.local` i ustaw:
   ```
   NEXT_PUBLIC_FUNCTIONS_URL=http://127.0.0.1:5001/<project-id>/europe-west1
   ```
   Uruchom Next.js:
   ```bash
   npm run dev
   ```

## Test end-to-end

1. Wejdź na `http://localhost:3000/sklep`, dodaj produkt do koszyka.
2. Przejdź na `http://localhost:3000/kasa`.
3. Wypełnij dane (imię, e-mail), wybierz metodę płatności:
   - **Gotówka – odbiór osobisty** → nie wywołuje P24, pokazuje od razu
     potwierdzenie (na tym etapie tylko w przeglądarce, bez zapisu).
   - Dowolna metoda P24 lub „wybiorę na stronie płatności" → wywołuje
     `createPayment` i przekierowuje na `sandbox.przelewy24.pl`.
4. Na stronie sandboxa P24 dokończ płatność testowymi danymi z panelu P24
   (sandbox udostępnia testowe numery kart / BLIK w swojej dokumentacji).
5. Po zakończeniu P24 przekieruje z powrotem na
   `http://localhost:3000/platnosc/status?session=...`.
6. W terminalu z emulatorem (albo `firebase functions:log`) sprawdź log
   `P24 payment result` — powinien pokazywać `status`, `orderId`, `amount`
   dla Twojej transakcji.

## Bezpieczeństwo — o czym pamiętać

- `createPayment` nigdy nie przyjmuje ani nie przekazuje dalej danych karty
  czy BLIK — to obsługuje wyłącznie hostowana strona P24.
- `paymentWebhook` **odrzuca** powiadomienia z nieprawidłowym podpisem (`sign`)
  i nie loguje ich statusu jako zaufanego.
- Sekrety (`P24_API_KEY`, `P24_CRC_KEY`) trzymamy tylko w `functions/.env`
  (gitignorowany), nigdy w kodzie ani we frontendzie.

## Przełączanie sandbox / produkcja

Zmienna `P24_ENV` w `functions/.env` (`sandbox` lub `production`) przełącza
bazowy URL API P24. **Konto sandbox i produkcyjne to dwa oddzielne konta** —
`P24_MERCHANT_ID`, `P24_POS_ID`, `P24_API_KEY`, `P24_CRC_KEY` dla produkcji
będą innymi wartościami niż dla sandboxa. Do produkcji `P24_WEBHOOK_URL` i
`FRONTEND_URL` powinny wskazywać na docelowe, publiczne domeny.

## Następny etap: Firestore

Zapis wyniku płatności do Firestore ma trafić wyłącznie do
[`src/processWebhookResult.js`](src/processWebhookResult.js) — miejsce jest
już przygotowane (zakomentowany przykładowy zapis). `paymentReturn.js` ma
gotowy `TODO` na odczyt tego zapisu po `sessionId`, żeby móc zwrócić realny
status `success` / `failed` zamiast `pending`.
