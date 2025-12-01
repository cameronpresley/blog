---
draft: false
date: 2024-04-13
authors:
  - cameronpresley
description: >
  TIL - Iterating Through Union Type
categories:
  - Functional Programming
  - TypeScript
  - Today I Learned

hide:
  - toc
---

# Today I Learned - Iterating Through Union Types

In a [previous post](./typescript-discriminated-union.md), we cover on how using union types in TypeScript is a great approach for domain modeling because it limits the possible values that a type can have.

For example, let's say that we're modeling a card game with a standard deck of playing cards. We could model the domain as such.

```ts
type Rank = "Ace" | "Two" | "Three" | "Four" | "Five" | "Six" | "Seven"
		   | "Eight" | "Nine" | "Ten" |"Jack" | "Queen" | "King"
type Suite = "Hearts" | "Clubs" | "Spades" | "Diamonds"

type Card = {rank:Rank; suite:Suit}
```

With this modeling, there's no way to create a `Card` such that it has an invalid `Rank` or `Suite`.

With this definition, let's create a function to build the deck.

```ts

function createDeck(): Card[] {
  const ranks = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"];
  const suites = ["Hearts", "Clubs", "Spades", "Diamonds"];

  const deck:Card[] = [];
  for (const rank of ranks) {
	for (const suite of suites) {
	  deck.push({rank, suite});
	}
  }
  return deck;
}
```

This code works, however, I don't like the fact that I had to formally list the option for both `Rank` and `Suite` as this means that I have two different representtions for `Rank` and `Suite`, which implies tthat if we needed to add a new `Rank` or `Suite`, then we'd need to add it in two places (a violation of DRY).

Doing some digging, I found [this StackOverflow post](https://stackoverflow.com/questions/43067354/how-to-iterate-a-string-literal-type-in-typescript) that gave a different way of defining our `Rank` and `Suite` types. Let's try that new definition.

```ts
const ranks = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"] as const;
type Rank = typeof ranks[number];
const suites = ["Hearts", "Clubs", "Spades", "Diamonds"] as const;
type Suite = typeof suites[number]

```

In this above code, we're saying that `ranks` cannot change (either by assignment or by operations like `push`). With that definition, we can say that `Rank` is some entry in the `ranks` array. Similar approach for our `suites` array and `Suite` type.

I prefer this approach much more because we have our ranks and suites defined in one place and our code reads cleaner as this says _Here are the possible ranks and Rank can only be one of those choices_.

## Limitations

The main limitation is that it only works for "enum" style unions. Let's change example and say that we want to model a series of shapes with the following.

```ts
type Circle = {radius:number};
type Square = {length:number};
type Rectangle = {height:number, width:number}

type Shape = Circle | Square | Rectangle
```

To use the same trick, we would need to have an array of constant values. However, we can't have a constant value for any of the `Shape`s because there are an infinite number of valid `Circle`s, `Square`s, and `Rectangle`s.
