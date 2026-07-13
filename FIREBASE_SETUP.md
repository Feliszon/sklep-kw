# Firebase Realtime Database Setup

## Krok 1: Ustaw Firebase Rules

Przejdź do: https://console.firebase.google.com → Projekt → Realtime Database → Rules

**Zastąp wszystkie Rules tym kodem:**

```json
{
  "rules": {
    ".read": true,
    ".write": false,
    "data": {
      ".read": true,
      ".write": true
    }
  }
}
```

Kliknij **"Publish"**

⚠️ **WAŻNE:** Te Rules pozwalają na publiczne zapisy! Na produkcji powinieneś:
- Użyć Firebase Authentication
- Ograniczyć zapisy tylko do zalogowanych użytkowników
- Albo użyć Firebase Admin SDK z tokenami

## Krok 2: Test w przeglądarce

Po ustawieniu Rules spróbuj:
- http://localhost:3000/sklep - powinna załadować produkty
- http://localhost:3000/admin/produkty - powinna załadować panel

## Krok 3: Dodaj produkty w panelu

- Przejdź do http://localhost:3000/admin
- Zaloguj się (hasło: `ValDiMello!2026`)
- Dodaj/edytuj produkty

## Troubleshooting

Jeśli dalej masz błąd 401:
1. Upewnij się że Rules zostały opublikowane
2. Odśwież stronę (Ctrl+F5)
3. Sprawdź w Developer Tools → Network czy Request idzie do Firebase
