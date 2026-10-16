# Sklep KW Poznań

Sklep internetowy Klubu Wysokogórskiego w Poznaniu: Next.js 16 na Vercelu, Firebase Realtime Database, płatności Przelewy24.

```bash
cp .env.local.example .env.local   # uzupełnij wartości
npm install
npm run dev                         # http://localhost:3000, panel: /admin
```

## Jak to działa

| Element | Gdzie |
|---|---|
| Produkty, kategorie, stany | Realtime Database `data/` (Admin SDK, `src/lib/shop-store.js`) |
| Zamówienia | Realtime Database `orders/` (`src/lib/orders.js`), panel `/admin/zamowienia` |
| Płatności P24 | `src/lib/p24.js`, API: `/api/zamowienia`, webhook `/api/p24/webhook` |
| Opcje i ceny dostawy | `src/lib/shipping.js` |
| Maile | SMTP, `src/lib/mailer.js` |
| Zdjęcia | Vercel Blob (lokalnie `public/uploads`) |
| Regulamin, polityka prywatności | `src/app/regulamin`, `src/app/polityka-prywatnosci` |

Cykl zamówienia: złożenie zamówienia od razu rezerwuje towar (stan maleje). Płatność online potwierdza wyłącznie
webhook P24. Zamówienie nieopłacone w ciągu 30 minut jest anulowane, a towar wraca na stan. Anulowanie
w panelu też zwraca towar.

Katalog `functions/` (Firebase Functions) nie jest już używany, bo płatności obsługują API routes Next.js.

## Wdrożenie (checklista)

### 1. Firebase
1. Console → Realtime Database → **Rules**: wklej zawartość `database.rules.json` i opublikuj.
   Blokuje to cały dostęp publiczny, a serwer korzysta z Admin SDK.
2. Ustawienia projektu → **Konta usługi** → „Wygeneruj nowy klucz prywatny”. Zawartość pliku JSON to wartość
   `FIREBASE_SERVICE_ACCOUNT`. Nie commituj tego pliku.

### 2. Vercel
1. Zaimportuj repozytorium w Vercel.
2. Storage → **Create Blob Store** → podłącz do projektu (ustawi `BLOB_READ_WRITE_TOKEN`).
3. Settings → Environment Variables: wszystkie zmienne z `.env.local.example`.
   - `SITE_URL` = docelowy adres https, np. `https://sklep.kw.poznan.pl`
   - `ADMIN_PASSWORD`: **nowe** hasło (stare było w historii repozytorium)
   - `ADMIN_SESSION_SECRET`: losowe 64 znaki hex
4. Domena: Settings → Domains.
5. Uwaga: plan Hobby na Vercelu jest tylko do użytku niekomercyjnego. Dla sklepu potrzebny jest plan Pro.

### 3. Przelewy24
1. Najpierw zostaw `P24_ENV=sandbox` i dane z konta sandbox. Zrób testowe zamówienie i sprawdź,
   czy w panelu zmienia status na „Opłacone” i czy przychodzi mail.
2. Potem ustaw `P24_ENV=production` i dane z konta produkcyjnego (panel P24 → Moje dane / Klucze).
3. W panelu P24 nie trzeba ustawiać adresu powiadomień, bo sklep przekazuje go przy każdej transakcji
   (`SITE_URL/api/p24/webhook`).

### 4. E-mail
Ustaw dane SMTP skrzynki, z której ma wychodzić poczta (np. `sklep@kw.poznan.pl`). Bez SMTP zamówienia działają,
ale maile nie są wysyłane, tylko logowane.

### 5. Test końcowy na produkcji
- [ ] zamówienie z odbiorem osobistym i gotówką → mail do klienta i do sklepu, widoczne w panelu
- [ ] zamówienie online za niską kwotę → status „Opłacone”, stan magazynu zmniejszony
- [ ] anulowanie w panelu → towar wraca na stan
- [ ] dodanie produktu ze zdjęciem z telefonu
