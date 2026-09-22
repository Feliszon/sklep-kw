import Link from "next/link";
import LegalPage, { Section, Fill } from "@/components/LegalPage";
import { SELLER } from "@/lib/seller";

export const metadata = {
  title: "Regulamin sklepu",
  description: "Regulamin sklepu internetowego Klubu Wysokogórskiego w Poznaniu.",
};

export default function RegulaminPage() {
  return (
    <LegalPage title="Regulamin sklepu" updated={<Fill>data wejścia w życie</Fill>}>
      <Section title="§1. Sprzedawca">
        <p>
          Sklep internetowy dostępny pod adresem <Fill>adres strony</Fill> prowadzi {SELLER.name}, {SELLER.street},{" "}
          {SELLER.postalCity}, wpisany do Krajowego Rejestru Sądowego pod numerem KRS {SELLER.krs}, NIP {SELLER.nip},
          REGON {SELLER.regon} (dalej: „Sprzedawca”).
        </p>
        <p>
          Kontakt ze Sprzedawcą: e-mail <a href={`mailto:${SELLER.email}`} className="underline">{SELLER.email}</a>,
          telefon <a href={SELLER.phoneHref} className="underline">{SELLER.phone}</a>.
        </p>
      </Section>

      <Section title="§2. Postanowienia ogólne">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Regulamin określa zasady składania zamówień, płatności, odbioru towaru, odstąpienia od umowy i reklamacji.</li>
          <li>Do korzystania ze sklepu potrzebne jest urządzenie z dostępem do internetu, aktualna przeglądarka oraz adres e-mail.</li>
          <li>Klient nie może dostarczać treści o charakterze bezprawnym.</li>
          <li>
            Ceny podane w sklepie są cenami końcowymi w złotych polskich i obejmują wszystkie podatki.{" "}
            <Fill>czy Klub jest płatnikiem VAT – jeśli nie, dopisz „Sprzedawca korzysta ze zwolnienia z VAT”</Fill>
          </li>
        </ol>
      </Section>

      <Section title="§3. Składanie zamówień">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Zamówienie składa się, dodając produkty do koszyka, podając imię i nazwisko oraz adres e-mail, wybierając sposób płatności i akceptując Regulamin.</li>
          <li>Złożenie zamówienia jest ofertą zawarcia umowy sprzedaży. Umowa zostaje zawarta z chwilą potwierdzenia przyjęcia zamówienia przez Sprzedawcę.</li>
          <li>Sprzedawca może odmówić realizacji zamówienia, jeśli towar jest niedostępny – w takim przypadku niezwłocznie zwraca wpłacone kwoty.</li>
        </ol>
      </Section>

      <Section title="§4. Płatności">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Dostępne sposoby płatności: gotówka przy odbiorze osobistym oraz płatności elektroniczne za pośrednictwem serwisu Przelewy24.</li>
          <li>Płatności elektroniczne obsługuje PayPro S.A. z siedzibą w Poznaniu (operator Przelewy24) na podstawie własnego regulaminu.</li>
          <li>W przypadku płatności elektronicznej zamówienie jest realizowane po otrzymaniu potwierdzenia płatności.</li>
        </ol>
      </Section>

      <Section title="§5. Odbiór i dostawa">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Odbiór osobisty jest możliwy w: <Fill>miejsce odbioru</Fill>, w terminach: <Fill>dni i godziny odbioru</Fill>.
          </li>
          <li>
            Czas przygotowania zamówienia do odbioru wynosi do <Fill>liczba</Fill> dni roboczych.
          </li>
          <li>
            <Fill>jeśli Klub wprowadzi wysyłkę: przewoźnicy, koszty i czas dostawy</Fill>
          </li>
        </ol>
      </Section>

      <Section title="§6. Prawo odstąpienia od umowy">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Klient będący konsumentem (lub przedsiębiorcą na prawach konsumenta) może odstąpić od umowy w terminie 14 dni
            bez podawania przyczyny. Termin biegnie od dnia objęcia towaru w posiadanie.
          </li>
          <li>
            Wystarczy wysłać oświadczenie o odstąpieniu przed upływem terminu, np. na adres{" "}
            <a href={`mailto:${SELLER.email}`} className="underline">{SELLER.email}</a>. Można skorzystać z wzoru poniżej,
            ale nie jest to obowiązkowe.
          </li>
          <li>
            Sprzedawca zwraca wszystkie otrzymane płatności niezwłocznie, nie później niż w ciągu 14 dni od otrzymania
            oświadczenia, tym samym sposobem płatności, jakiego użył Klient, chyba że Klient zgodzi się na inny.
            Sprzedawca może wstrzymać zwrot do chwili otrzymania towaru z powrotem.
          </li>
          <li>Klient zwraca towar nie później niż 14 dni od odstąpienia i ponosi bezpośredni koszt jego zwrotu.</li>
          <li>Klient odpowiada za zmniejszenie wartości towaru wynikające z korzystania z niego w sposób wykraczający poza konieczny do stwierdzenia jego charakteru, cech i funkcjonowania.</li>
        </ol>
        <div className="mt-4 rounded-md border border-neutral-200 bg-white p-4 text-sm">
          <p className="mb-2 font-semibold text-black">Wzór formularza odstąpienia od umowy</p>
          <p>Adresat: {SELLER.name}, {SELLER.street}, {SELLER.postalCity}, {SELLER.email}</p>
          <p>Niniejszym informuję o moim odstąpieniu od umowy sprzedaży następujących rzeczy: …</p>
          <p>Data zawarcia umowy / odbioru: …</p>
          <p>Imię i nazwisko konsumenta: …</p>
          <p>Adres konsumenta: …</p>
          <p>Data: …</p>
        </div>
      </Section>

      <Section title="§7. Reklamacje">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Sprzedawca odpowiada za zgodność towaru z umową na zasadach określonych w ustawie o prawach konsumenta.</li>
          <li>
            Reklamację można złożyć e-mailem na adres <a href={`mailto:${SELLER.email}`} className="underline">{SELLER.email}</a>{" "}
            lub pisemnie na adres Sprzedawcy, opisując wadę i żądanie (naprawa, wymiana, obniżenie ceny lub odstąpienie od umowy).
          </li>
          <li>Sprzedawca odpowiada na reklamację w ciągu 14 dni od jej otrzymania.</li>
        </ol>
      </Section>

      <Section title="§8. Pozasądowe rozwiązywanie sporów">
        <p>
          Konsument może skorzystać z pozasądowych sposobów rozpatrywania reklamacji, m.in. zwrócić się do miejskiego
          lub powiatowego rzecznika konsumentów albo wojewódzkiego inspektoratu Inspekcji Handlowej. Informacje są
          dostępne na stronie UOKiK: uokik.gov.pl.
        </p>
      </Section>

      <Section title="§9. Dane osobowe">
        <p>
          Zasady przetwarzania danych osobowych opisuje{" "}
          <Link href="/polityka-prywatnosci" className="underline">Polityka prywatności</Link>.
        </p>
      </Section>

      <Section title="§10. Postanowienia końcowe">
        <ol className="list-decimal space-y-1 pl-5">
          <li>W sprawach nieuregulowanych stosuje się przepisy prawa polskiego, w szczególności Kodeksu cywilnego i ustawy o prawach konsumenta.</li>
          <li>Zmiany Regulaminu nie dotyczą zamówień złożonych przed ich wejściem w życie.</li>
        </ol>
      </Section>
    </LegalPage>
  );
}
