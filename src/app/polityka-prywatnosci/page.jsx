import LegalPage from "@/components/LegalPage";
import { SELLER } from "@/lib/seller";

export const metadata = { title: "Polityka prywatności", description: "Zasady przetwarzania danych osobowych w sklepie Klubu Wysokogórskiego w Poznaniu." };

export default function PolitykaPrywatnosciPage() {
  return (
    <LegalPage title="Polityka prywatności" updated="17 października 2026 r.">
      <h2>1. Administrator danych</h2>
      <p>
        Administratorem Twoich danych osobowych jest {SELLER.name}, {SELLER.street}, {SELLER.postalCity}, KRS {SELLER.krs}, NIP {SELLER.nip}.
        Kontakt w sprawach danych osobowych: <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>.
      </p>

      <h2>2. Jakie dane przetwarzamy i po co</h2>
      <ul>
        <li>
          <strong>Realizacja zamówienia</strong> - imię i nazwisko, adres e-mail, telefon, adres dostawy lub kod paczkomatu,
          treść zamówienia. Podstawa: niezbędność do zawarcia i wykonania umowy (art. 6 ust. 1 lit. b RODO).
        </li>
        <li>
          <strong>Obowiązki prawne</strong> - przechowywanie dokumentacji sprzedaży i rozliczeń, obsługa reklamacji i odstąpień.
          Podstawa: art. 6 ust. 1 lit. c RODO.
        </li>
        <li>
          <strong>Dochodzenie roszczeń i obrona przed nimi</strong>. Podstawa: nasz prawnie uzasadniony interes (art. 6 ust. 1
          lit. f RODO).
        </li>
        <li>
          <strong>Bezpieczeństwo strony</strong> - serwer hostingowy zapisuje w logach techniczne dane połączeń (m.in. adres IP,
          czas, rodzaj przeglądarki), które służą wykrywaniu błędów i nadużyć i są automatycznie usuwane. Podstawa: nasz prawnie
          uzasadniony interes (art. 6 ust. 1 lit. f RODO).
        </li>
      </ul>
      <p>Nie podejmujemy wobec Ciebie decyzji w sposób zautomatyzowany i nie profilujemy Cię.</p>
      <p>Podanie danych jest dobrowolne, ale niezbędne do złożenia zamówienia.</p>

      <h2>3. Komu przekazujemy dane</h2>
      <ul>
        <li>PayPro S.A. (Przelewy24) - w zakresie potrzebnym do obsługi płatności online;</li>
        <li>InPost lub firma kurierska - w zakresie potrzebnym do doręczenia przesyłki;</li>
        <li>dostawcom usług IT, z których korzystamy: hosting strony (Vercel Inc.), baza danych (Google Firebase), poczta e-mail.</li>
      </ul>
      <p>
        Niektórzy dostawcy usług IT mogą przetwarzać dane poza Europejskim Obszarem Gospodarczym (USA). Odbywa się to na podstawie
        decyzji Komisji Europejskiej stwierdzającej odpowiedni stopień ochrony (EU-US Data Privacy Framework) lub standardowych
        klauzul umownych.
      </p>

      <h2>4. Jak długo przechowujemy dane</h2>
      <p>
        Dane zamówień przechowujemy przez okres wymagany przepisami podatkowymi i rachunkowymi (5 lat od końca roku, w którym
        dokonano sprzedaży), a w zakresie roszczeń - do upływu okresu ich przedawnienia.
      </p>

      <h2>5. Twoje prawa</h2>
      <p>
        Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz
        wniesienia sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie. Aby skorzystać z tych praw, napisz na{" "}
        <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>. Masz też prawo wnieść skargę do
        Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).
      </p>

      <h2>6. Pliki cookies i pamięć przeglądarki</h2>
      <p>
        Sklep nie używa cookies analitycznych ani marketingowych. Zawartość koszyka zapisujemy wyłącznie w pamięci Twojej
        przeglądarki (localStorage), aby nie zniknęła po odświeżeniu strony - te dane nie są wysyłane do nas, dopóki nie złożysz
        zamówienia. Panel administracyjny używa niezbędnego pliku cookie sesji, który dotyczy wyłącznie administratorów.
      </p>
    </LegalPage>
  );
}
