import LegalPage, { Section, Fill } from "@/components/LegalPage";
import { SELLER } from "@/lib/seller";

export const metadata = {
  title: "Polityka prywatności",
  description: "Zasady przetwarzania danych osobowych w sklepie Klubu Wysokogórskiego w Poznaniu.",
};

export default function PolitykaPrywatnosciPage() {
  return (
    <LegalPage title="Polityka prywatności" updated={<Fill>data wejścia w życie</Fill>}>
      <Section title="1. Administrator danych">
        <p>
          Administratorem danych osobowych jest {SELLER.name}, {SELLER.street}, {SELLER.postalCity}, KRS {SELLER.krs}.
          Kontakt w sprawach danych osobowych:{" "}
          <a href={`mailto:${SELLER.email}`} className="underline">{SELLER.email}</a>.
        </p>
      </Section>

      <Section title="2. Jakie dane zbieramy">
        <p>
          Przy składaniu zamówienia: imię i nazwisko, adres e-mail oraz – opcjonalnie – numer telefonu. Nie zbieramy
          ani nie przechowujemy danych kart płatniczych ani kodów BLIK – obsługuje je operator płatności.
        </p>
      </Section>

      <Section title="3. Cele i podstawy przetwarzania">
        <ul className="list-disc space-y-1 pl-5">
          <li>realizacja zamówienia i kontakt w jego sprawie – art. 6 ust. 1 lit. b RODO (wykonanie umowy);</li>
          <li>obowiązki księgowe i podatkowe – art. 6 ust. 1 lit. c RODO (obowiązek prawny);</li>
          <li>rozpatrywanie reklamacji oraz dochodzenie i obrona roszczeń – art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes).</li>
        </ul>
      </Section>

      <Section title="4. Odbiorcy danych">
        <ul className="list-disc space-y-1 pl-5">
          <li>PayPro S.A. (operator Przelewy24) – w zakresie potrzebnym do obsługi płatności elektronicznej;</li>
          <li>dostawcy usług hostingowych i bazodanowych: <Fill>np. Vercel Inc., Google Ireland Ltd. (Firebase)</Fill>;</li>
          <li><Fill>biuro księgowe, przewoźnicy – jeśli dotyczy</Fill>.</li>
        </ul>
        <p>
          Część dostawców może przetwarzać dane poza Europejskim Obszarem Gospodarczym na podstawie standardowych klauzul
          umownych zatwierdzonych przez Komisję Europejską.
        </p>
      </Section>

      <Section title="5. Okres przechowywania">
        <p>
          Dane przechowujemy przez czas realizacji zamówienia, a następnie przez okres wymagany przepisami podatkowymi
          (5 lat od końca roku podatkowego) oraz do upływu terminów przedawnienia roszczeń.
        </p>
      </Section>

      <Section title="6. Twoje prawa">
        <p>
          Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia
          danych oraz wniesienia sprzeciwu. Przysługuje Ci również prawo wniesienia skargi do Prezesa Urzędu Ochrony
          Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).
        </p>
        <p>Podanie danych jest dobrowolne, ale niezbędne do złożenia zamówienia.</p>
      </Section>

      <Section title="7. Pliki cookies i pamięć przeglądarki">
        <p>
          Sklep nie używa cookies analitycznych ani marketingowych. Zawartość koszyka jest zapisywana wyłącznie
          w pamięci Twojej przeglądarki (localStorage) i nie jest wysyłana na serwer przed złożeniem zamówienia.
          Panel administratora używa technicznego pliku cookie sesji, niezbędnego do logowania.
        </p>
      </Section>
    </LegalPage>
  );
}
