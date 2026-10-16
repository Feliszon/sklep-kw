// Opcje dostawy - współdzielone przez checkout (przeglądarka) i serwer.
// Ceny w złotych. Zmiana ceny = zmiana tutaj + ponowne wdrożenie.
export const SHIPPING_METHODS = [
  {
    id: "pickup",
    label: "Odbiór osobisty",
    description: "Siedziba klubu, ul. Składowa 11/10, Poznań - termin odbioru ustalimy mailowo.",
    price: 0,
    requires: "none",
    allowsCash: true,
  },
  {
    id: "inpost",
    label: "Paczkomat InPost",
    description: "Wysyłka w ciągu 3 dni roboczych od zaksięgowania płatności.",
    price: 15,
    requires: "locker",
    allowsCash: false,
  },
  {
    id: "courier",
    label: "Kurier",
    description: "Wysyłka w ciągu 3 dni roboczych od zaksięgowania płatności.",
    price: 20,
    requires: "address",
    allowsCash: false,
  },
];

export function getShippingMethod(id) {
  return SHIPPING_METHODS.find((m) => m.id === id) || null;
}

export function formatPrice(pln) {
  return `${Number(pln).toFixed(2).replace(".", ",")} zł`;
}
