const range9 = [...Array(9).keys()].map((x) => x + 2);
const suit = [...range9, 'J', 'Q', 'K', 'A'];
const cards = [
  ...suit.slice().map((x) => `${x}H`),
  ...suit.slice().map((x) => `${x}D`),
  ...suit.slice().map((x) => `${x}S`),
  ...suit.slice().map((x) => `${x}C`),
];

// Fisher-yates shuffling algorithm
export function shuffleCards(): string[] {
  const deck = cards.slice();

  let i = 0;
  let j = 0;
  let temp = null;

  for (i = deck.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1));
    temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }

  return deck;
}

export type Cards = string[];
