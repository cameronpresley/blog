---
draft: false
date: 2025-03-27
authors:
  - cameronpresley
description: >
  Tips and Tricks with TypeScript

categories:
  - Today I Learned
  - TypeScript

hide:
  - toc
---

# Tips and Tricks with TypeScript

One of my most recent projects has been tackling how to model the card game, [Love Letter](https://boardgamegeek.com/boardgame/129622/love-letter). For those who've seen me present my [How Functional Programming Made Me a Better Developer](../../presentations.md#how-functional-programming-made-me-a-better-developer) talk, you might recall that this was my second project to tackle in F# and that even though I was able to get some of it to work, there were some inconsistency in the rules that I wasn't able to reason about.

While implementing in TypeScript, I came across some cool tricks and thought I'd share some of them here, enjoy!

## Swapping two variables

A common enough task in programming, we need to swap two values around. When I was learning C++, I had a memory trick to remember the ordering (think like a zigzag pattern)

```cpp
int a = 100;
int b = 200;

// Note how a starts on the right, then goes left
int temp = a;
a = b;
b = temp;

```

You can do the same thing in TypeScript, however, you can remove the need for the `temp` variable by using array destructuring. The idea is that we create an array which contains the two variables to swap. We then assign this array to destructured variables (see below)

```ts
let a:number = 100;
let b:number = 200;

// using array destructuring

[a,b] = [b,a]
```

## Drawing a Card 

One of the common interactions that happens in the game is that we need to model drawing a card from a deck. As such, we will have a function that looks like the following

```ts

type Card = "Guard" | "Priest" | "Baron" | .... // other options omitted for brevity
type Deck = Card[]

function draw(d:Deck): {card:Card, restOfDeck:Deck} {
  const card = d[0];
  const restOfDeck = d.slice(1);
  return {card, restOfDeck};
}

```

This absolutely works, however, we can use the rest operator (...) with array destructuring to simplify this code. 

```ts

type Card = "Guard" | "Priest" | "Baron" | .... // other options omitted for brevity
type Deck = Card[]

function draw(d:Deck): {card:Card, restOfDeck:Deck} {
  const [card, ...restOfDeck] = d; // note the rest operator before restOfDeck
  return {card, restOfDeck};
}

```

This code should be read as _assign the first element of the array to a const called `card` and the rest of the array to a const called `restOfDeck`_.


## Drawing Multiple Cards with Object Destructuring

```ts

function draw(d:Deck): {card:Card, restOfDeck:Deck} {
  const [card, ...restOfDeck] = d;
  return {card, restOfDeck};
}

function drawMultipleCads(d:Deck, count:number): {cards:Card[], restOfDeck:Deck} {
  let currentDeck = d;
  const cards:Card[] = [];
  for (let i = 0; i < count; i++) {
    const result = draw(currentDeck)
    cards.push(result.card)
    currentDeck = result.restOfDeck
  }
  return {cards, restOfDeck:currentDeck};
}

```

This works, however, we don't actually care about `result`, but the specific values `card` and `restOfDeck`. Instead of referencing them via property drilling, we can use object destructuring to get their values.


```ts

function drawMultipleCads(d:Deck, count:number): {cards:Card[], restOfDeck:Deck} {
  let currentDeck = d;
  const cards:Card[] = [];
  for (let i = 0; i < count; i++) {
    const {card, restOfDeck} = draw(currentDeck) // note using curly braces
    cards.push(card)
    currentDeck = restOfDeck
  }
  return {cards, restOfDeck:currentDeck};
}

```
