import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { SELLER } from "@/lib/seller";
import { SHIPPING_METHODS, formatPrice } from "@/lib/shipping";

export const metadata = { title: "Regulamin", description: "Regulamin sklepu internetowego Klubu Wysokogórskiego w Poznaniu." };

export default function RegulaminPage() {
  return (
    <LegalPage title="Regulamin sklepu" updated="16 października 2026 r.">
      <h2>§1. Postanowienia ogólne</h2>
      <ol>
        <li>
          Sklep internetowy dostępny pod tym adresem (dalej: „Sklep”) prowadzi {SELLER.name}, {SELLER.street}, {SELLER.postalCity}, wpisany do
          Krajowego Rejestru Sądowego pod numerem KRS {SELLER.krs}, NIP {SELLER.nip}, REGON {SELLER.regon} (dalej:
          „Sprzedawca”).
        </li>
        <li>
          Kontakt ze Sprzedawcą: e-mail <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>, telefon {SELLER.phone}, adres
          korespondencyjny: {SELLER.street}, {SELLER.postalCity}.
        </li>
        <li>Regulamin określa zasady składania zamówień, zawierania umów sprzedaży, dostawy, płatności, odstąpienia od umowy i reklamacji.</li>
        <li>
          Postanowienia dotyczące konsumentów stosuje się także do osoby fizycznej zawierającej umowę bezpośrednio związaną z jej
          działalnością gospodarczą, gdy z treści umowy wynika, że nie ma ona dla tej osoby charakteru zawodowego.
        </li>
      </ol>

      <h2>§2. Wymagania techniczne</h2>
      <ol>
        <li>Do korzystania ze Sklepu potrzebne są: urządzenie z dostępem do internetu, aktualna przeglądarka internetowa z włączoną obsługą JavaScript oraz aktywny adres e-mail.</li>
        <li>Zakazane jest dostarczanie przez Klienta treści o charakterze bezprawnym.</li>
      </ol>

      <h2>§3. Składanie zamówień i zawarcie umowy</h2>
      <ol>
        <li>Informacje o produktach w Sklepie nie stanowią oferty w rozumieniu Kodeksu cywilnego, lecz zaproszenie do zawarcia umowy.</li>
        <li>Ceny podane w Sklepie są cenami brutto w złotych polskich. Koszt dostawy jest podawany przed złożeniem zamówienia i doliczany do ceny.</li>
        <li>
          Aby złożyć zamówienie, należy dodać produkty do koszyka, podać dane kontaktowe, wybrać sposób dostawy i płatności,
          zaakceptować Regulamin i kliknąć przycisk potwierdzający zamówienie z obowiązkiem zapłaty.
        </li>
        <li>Umowa sprzedaży zostaje zawarta z chwilą otrzymania przez Klienta e-maila potwierdzającego przyjęcie zamówienia.</li>
        <li>Sprzedawca może anulować zamówienie, jeżeli płatność online nie zostanie dokonana w ciągu 30 minut od złożenia zamówienia.</li>
      </ol>

      <h2>§4. Płatności</h2>
      <ol>
        <li>
          Dostępne metody płatności: płatność online za pośrednictwem serwisu Przelewy24 (BLIK, karta płatnicza, szybki przelew
          i inne metody dostępne w serwisie) oraz gotówka przy odbiorze osobistym.
        </li>
        <li>Obsługę płatności online prowadzi PayPro S.A. z siedzibą w Poznaniu (operator serwisu Przelewy24).</li>
        <li>Zamówienia płatne online są realizowane po zaksięgowaniu płatności.</li>
        <li>Na życzenie Klienta Sprzedawca wystawia dowód zakupu - prośbę należy przesłać na adres e-mail Sprzedawcy.</li>
      </ol>

      <h2>§5. Dostawa</h2>
      <ol>
        <li>Dostawa odbywa się na terenie Polski. Dostępne sposoby dostawy i ich koszty:</li>
      </ol>
      <ul>
        {SHIPPING_METHODS.map((m) => (
          <li key={m.id}>
            {m.label} - {m.price ? formatPrice(m.price) : "bezpłatnie"}. {m.description}
          </li>
        ))}
      </ul>
      <ol start={2}>
        <li>Przewidywany czas dostawy przez przewoźnika to zwykle 1-2 dni robocze od nadania przesyłki.</li>
        <li>Klient otrzymuje wiadomość e-mail o wysłaniu zamówienia.</li>
      </ol>

      <h2>§6. Prawo odstąpienia od umowy</h2>
      <ol>
        <li>
          Konsument może odstąpić od umowy bez podania przyczyny w terminie 14 dni od dnia objęcia towaru w posiadanie. Do
          zachowania terminu wystarczy wysłanie oświadczenia przed jego upływem.
        </li>
        <li>
          Oświadczenie można złożyć e-mailem na adres <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a> lub pisemnie na
          adres Sprzedawcy, np. korzystając z wzoru formularza zamieszczonego poniżej (nie jest to obowiązkowe).
        </li>
        <li>
          Sprzedawca zwraca wszystkie płatności, w tym koszt najtańszego oferowanego sposobu dostawy, niezwłocznie, nie później
          niż w ciągu 14 dni od otrzymania oświadczenia, przy użyciu takiego samego sposobu płatności, jakiego użył Konsument.
          Sprzedawca może wstrzymać zwrot do chwili otrzymania towaru lub dowodu jego odesłania.
        </li>
        <li>Konsument odsyła towar na adres Sprzedawcy w terminie 14 dni od odstąpienia i ponosi bezpośredni koszt jego zwrotu.</li>
        <li>Konsument odpowiada za zmniejszenie wartości towaru wynikające z korzystania z niego w sposób wykraczający poza konieczny do stwierdzenia jego charakteru, cech i funkcjonowania.</li>
        <li>Prawo odstąpienia nie przysługuje w odniesieniu do towarów wyprodukowanych według specyfikacji Konsumenta lub służących zaspokojeniu jego zindywidualizowanych potrzeb.</li>
      </ol>

      <h2>§7. Reklamacje</h2>
      <ol>
        <li>Sprzedawca odpowiada wobec Konsumenta za zgodność towaru z umową na zasadach określonych w ustawie o prawach konsumenta.</li>
        <li>
          Reklamację można złożyć e-mailem na adres <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a> lub pisemnie na adres
          Sprzedawcy. Warto podać numer zamówienia, opis niezgodności i oczekiwany sposób jej usunięcia (naprawa, wymiana,
          obniżenie ceny lub odstąpienie od umowy).
        </li>
        <li>Sprzedawca odpowiada na reklamację w terminie 14 dni od jej otrzymania.</li>
        <li>
          Konsument może skorzystać z pozasądowych sposobów rozpatrywania reklamacji, m.in. zwrócić się do miejskiego lub
          powiatowego rzecznika konsumentów albo wojewódzkiego inspektoratu Inspekcji Handlowej. Informacje są dostępne na stronie{" "}
          <a href="https://uokik.gov.pl" target="_blank" rel="noopener noreferrer">uokik.gov.pl</a>.
        </li>
      </ol>

      <h2>§8. Dane osobowe</h2>
      <p>
        Zasady przetwarzania danych osobowych opisuje <Link href="/polityka-prywatnosci">Polityka prywatności</Link>.
      </p>

      <h2>§9. Postanowienia końcowe</h2>
      <ol>
        <li>Do umów zawieranych przez Sklep stosuje się prawo polskie, z zachowaniem uprawnień przysługujących Konsumentowi na mocy przepisów kraju jego zwykłego pobytu.</li>
        <li>Zmiany Regulaminu nie dotyczą zamówień złożonych przed ich wejściem w życie.</li>
      </ol>

      <h2>Wzór formularza odstąpienia od umowy</h2>
      <p className="rounded-lg border border-neutral-200 bg-white p-5 text-sm">
        (formularz należy wypełnić i odesłać tylko w przypadku chęci odstąpienia od umowy)
        <br />
        <br />
        Adresat: {SELLER.name}, {SELLER.street}, {SELLER.postalCity}, {SELLER.email}
        <br />
        <br />
        Ja/My(*) niniejszym informuję/informujemy(*) o moim/naszym odstąpieniu od umowy sprzedaży następujących rzeczy(*):
        ……………………………
        <br />
        Numer zamówienia: ……………………………
        <br />
        Data odbioru(*): ……………………………
        <br />
        Imię i nazwisko konsumenta(-ów): ……………………………
        <br />
        Adres konsumenta(-ów): ……………………………
        <br />
        Podpis konsumenta(-ów) (tylko jeżeli formularz jest przesyłany w wersji papierowej): ……………………………
        <br />
        Data: ……………………………
        <br />
        <br />
        (*) Niepotrzebne skreślić.
      </p>
    </LegalPage>
  );
}
