// Tymczasowe dane produktów. W kolejnym kroku zastąpimy to bazą danych (Supabase),
// żeby administrator mógł zmieniać stany magazynowe bez edytowania kodu.

export const products = [
  {
    id: "koszulka-klasyk",
    name: "Koszulka klubowa Klasyk",
    category: "Koszulki",
    description:
      "Bawełniana koszulka z haftowanym logo KW Poznań. Idealna na wyjścia w góry i co dzień.",
    image: "/products/koszulka-klasyk.svg",
    variants: [
      { id: "cz-s", color: "Czarna", size: "S", price: 69, stock: 4 },
      { id: "cz-m", color: "Czarna", size: "M", price: 69, stock: 0 },
      { id: "cz-l", color: "Czarna", size: "L", price: 69, stock: 7 },
      { id: "gr-s", color: "Grafitowa", size: "S", price: 69, stock: 2 },
      { id: "gr-m", color: "Grafitowa", size: "M", price: 69, stock: 5 },
      { id: "gr-l", color: "Grafitowa", size: "L", price: 69, stock: 1 },
    ],
  },
  {
    id: "koszulka-tatry",
    name: "Koszulka Tatry Edition",
    category: "Koszulki",
    description: "Limitowana edycja z grafiką panoramy Tatr na plecach.",
    image: "/products/koszulka-tatry.svg",
    variants: [
      { id: "biala-m", color: "Biała", size: "M", price: 79, stock: 3 },
      { id: "biala-l", color: "Biała", size: "L", price: 79, stock: 0 },
      { id: "biala-xl", color: "Biała", size: "XL", price: 79, stock: 6 },
    ],
  },
  {
    id: "torba-sportowa",
    name: "Torba sportowa KW",
    category: "Torby",
    description: "Pojemna torba na sprzęt wspinaczkowy, wodoodporny spód.",
    image: "/products/torba-sportowa.svg",
    variants: [{ id: "standard", color: "Czarna", size: "One size", price: 89, stock: 12 }],
  },
  {
    id: "worek-workout",
    name: "Worek na magnezję",
    category: "Torby",
    description: "Mały worek ze sznurkiem, z logo klubu.",
    image: "/products/worek-workout.svg",
    variants: [{ id: "standard", color: "Beżowy", size: "One size", price: 19, stock: 20 }],
  },
  {
    id: "kubek-ceramiczny",
    name: "Kubek ceramiczny KW Poznań",
    category: "Kubki",
    description: "Pojemność 350 ml, logo klubu z dwóch stron.",
    image: "/products/kubek-ceramiczny.svg",
    variants: [{ id: "standard", color: "Biały", size: "350 ml", price: 29, stock: 15 }],
  },
  {
    id: "kubek-termiczny",
    name: "Kubek termiczny na szlak",
    category: "Kubki",
    description: "Stalowy, izolowany kubek 450 ml — trzyma ciepło na wyjściach w góry.",
    image: "/products/kubek-termiczny.svg",
    variants: [{ id: "standard", color: "Zielony", size: "450 ml", price: 59, stock: 0 }],
  },
];

export function getProductById(id) {
  return products.find((p) => p.id === id);
}

export function getCategories() {
  return [...new Set(products.map((p) => p.category))];
}
