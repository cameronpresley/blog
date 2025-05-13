---
draft: false
date: 2025-05-13
authors:
  - cameronpresley
description: >
  Using TypeScript Tuples For Basic Data Modeling

categories:
  - Today I Learned
  - TypeScript

hide:
  - toc
---

# Leveraging Tuples in TypeScript

In preparation for [StirTrek](https://stirtrek.com/), I'm revisiting my approach for how to implement the game of [Blackjack](https://en.wikipedia.org/wiki/Blackjack). I find card games to be a great introduction to functional concepts as you hit the major concepts quickly and the use cases are intuitive.

Let's take a look at one of the concepts in the game, `Points`.

Blackjack is played with a standard deck of cards (13 Ranks and 4 Suits) where the goal is to get the closest to 21 points without going over. A card is worth Points based on its Rank. So let's go ahead and model what we know so far.

```ts
type Rank = "Ace" | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "Jack" | "Queen" | "King"
type Suit = "Hearts" | "Clubs" | "Spades" | "Diamonds"
type Card = {readonly rank:Rank, readonly suit:Suit}

```

We know that a `Card` is worth points based on its rank, the rule are:

- Cards with a Rank of 2 through 10 are worth that many points (i.e., 2's are worth 2 points, 3's are worth 3 points, ..., 10's are worth 10 points)
- Cards with a Rank of Jack, Queen, or King are worth 10 points
- Cards with a Rank of Ace can be worth either 1 or 11 points (depending on which one is the most advantageous)

Let's explore the Ace in more detail.

For example, if we had a hand consisting of an `Ace` and a `King`, then it could be worth either 11 (treating the Ace as a 1) or as 21 (treating the Ace as an 11). In this case, we'd want to treat the Ace as an 11 as that gives us 21 exactly (specifically, a _Blackjack_).

In another example, if we had a hand consisting of an `Ace`, `6`, and `Jack`, then it could either be worth 17 (treating the Ace as a 1) or 27 (treating the Ace as an 11). Since 27 is greater than 21 (which would cause us to _bust_), we wouldn't want the Ace to be worth 11.

### Creating cardToPoints

Now that we have this detail, let's take a look at trying to write the `cardToPoints` function.

```ts
function cardToPoints(c:Card): Points { // Note we don't know what the type of this is yet
  switch(c.rank) {
    case 'Ace': return ???
    case 'King': return 10;
    case 'Queen': return 10;
    case 'Jack': return 10;
    default:
      return c.rank; // we can do this because TypeScript knows all the remaining options for Rank are numbers
  }
}
```

At this point, we don't know how to score `Ace` because we would need to know the other cards to get points for. Since we don't have that context here, why not capture both values?

```ts
function cardToPoints(c:Card): Points { // Note we don't know what the type of this is yet
  switch(c.rank) {
    case 'Ace': return [1,11];
    case 'King': return 10;
    case 'Queen': return 10;
    case 'Jack': return 10;
    default:
      return c.rank; // we can do this because TypeScript knows all the remaining options for Rank are numbers
  }
}
```

In TypeScript, we can denote a tuple by using `[]`. Going forward, TypeScript knows that it's a two element array and guarantees that we can index using 0 or 1.

This works, however, anything using `cardToPoints` has to deal with that it could either be a number or a tuple.

When I come across cases like this, I reach for setting up a [sum type](./typescript-discriminated-union.md) to model each case.

```ts
type Hard = {tag:'hard', value:number};
type Soft = {tag:'soft', value:[number,number]}; // note that value here is a tuple of number*number
type Points = Hard | Soft
```

Now, when I call `cardToPoints`, I can use the `tag` field to know whether I'm working with a number or a tuple.

### Adding Points Together

A common workflow in Blackjack is to figure out how many points someone has. At a high level, we'd want to do the following

- Convert each Card to Points
- Add all the Points together

Summing things together is a common enough pattern, so we know our code is going to look something like this:

```ts

function handToPoints(cards:Card[]): Points {
  return cards.map((c)=>cardToPoints(c)).reduce(SOME_FUNCTION_HERE, SOME_INITIAL_VALUE_HERE);
}

```

We don't have the reducer function defined yet, but we do know that it's a function that'll take two `Points` and return a `Points`. So let's stub that out.

```ts
function addPoints(a:Points, b:Points): Points {
  // implementation
}
```

Since we modeled `Points` as a sum type, we can use the `tag` field to go over the possible cases

```ts
function addPoints(a:Points, b:Points): Points {
  if (a.tag === 'hard' && b.tag === 'hard') {
    // logic
  }
  if (a.tag === 'hard' && b.tag === 'soft'){
    // logic
  }
  if (a.tag === 'soft' && b.tag === 'hard'){
    // logic
  } 
  // last case is both of them are soft
}
```

With this skeleton in place, let's start implementing each of the branches

#### Adding Two Hard Values

The first case is the easiest, if we have two hard values, then we add their values together. So a _King_ and _7_ us a _17_ for example. 

```ts
function addHardAndHard(a:Hard, b:Hard): Points { // note that I'm defining a and b as Hard and not just Points
  const value = a.value + b.value;
  return {tag:'hard', value};
}
```

With this function defined, we can update `addPoints` like so

```ts
function addPoints(a:Points, b:Points): Points {
  if (a.tag === 'hard' && b.tag === 'hard'){
    return addHardAndHard(a,b);
  }
  // other branches
}
```

### Adding Hard and Soft

The next two cases are the same, where we're adding a Hard value to a Soft value. For example, we're adding a _6_ to an _Ace_. We can't assume that the answer is 7 since that might not be what the player wants. We also can't assume that the value is 17 because that might not be to the players advantage, which means that we need to keep track of both options, which implies that the result would be a `Soft` value. Let's go ahead and write that logic out

```ts
function addHardAndSoft(a:Hard, b:Soft): Points { // note that a is typed to be Hard and b is typed as Soft
  const [bLow, bHigh] = b.value; // destructuring the tuple into specific pieces
  return {tag:'soft', value:[a.value+bLow, a.value+bHigh]};
}
```

With this function in place, we can write out the next two branches

```ts
function addPoints(a:Points, b:Points): Points {
  if (a.tag === 'hard' && b.tag === 'hard'){
    return addHardAndHard(a, b);
  }
  if (a.tag === 'hard' && b.tag === 'soft'){
    return addHardAndSoft(a, b);
  }
  if (a.tag === 'soft' && b.tag === 'hard'){
    return addHardAndSoft(b, a); 
  }
  // remaining logic
}
```

### Adding Soft and Soft

The last case we need to handle is when both `Points` are `Soft`. If we were to break this down, we have four values (aLow, aHIgh for a, and bLow,bHigh for b) we need to keep track of:

1. aLow + bLow
1. aHigh + bLow
1. aLow + bHigh
1. aHigh + bHigh

However, let's play around with this by assuming that `Points` in question are both Ace. We would get the following:

1. aLow + bLow = 1 + 1 = 2
1. aHigh + bLow = 11 + 1 = 12
1. aLow + bHigh = 1 + 11 = 12
1. aHigh + bHigh = 11 + 11 = 22

Right off the bat, we can discard the case 4, (aHigh + bHigh), because there is no situation where the player would want that score as they would bust.

For cases 2 and 3, they yield the same value, so they're essentially the same case.

Which means, that our real cases are

1. aLow + bLow
1. aHigh + bLow (which is the same as aLow + bHigh)

So let's go ahead and write that function

```ts
function addSoftAndSoft(a:Soft, b:Soft): Points {
  const [aLow, aHigh] = a.value;
  const [bLow] = b.value; // note that we're only grabbing the first element of the tuple here
  return {tag:'soft', value:[aLow+bLow, aHigh+bLow]};
}
```

Which gives us the following for `addPoints`

```ts
function addPoints(a:Points, b:Points): Points {
  if (a.tag === 'hard' && b.tag === 'hard'){
    return addHardAndHard(a, b);
  }
  if (a.tag === 'hard' && b.tag === 'soft'){
    return addHardAndSoft(a, b);
  }
  if (a.tag === 'soft' && b.tag === 'hard'){
    return addHardAndSoft(b, a);
  }
  return addSoftAndSoft(a as Soft, b as Soft);
}

```

Now that we have `addPoints`, let's revisit `handToPoints`

```ts
// Original Implementation
// function handToPoints(cards:Card[]): Points {
//   return cards.map((c)=>cardToPoints(c)).reduce(SOME_FUNCTION_HERE, SOME_INITIAL_VALUE_HERE;
// }

function handToPoints(cards:Card[]): Points {
  return cards.map((c)=>cardToPoints(c)).reduce(addPoints, SOME_INITIAL_VALUE_HERE);
}

```

Now we need to figure out what _SOME_INITIAL_VALUE_HERE_ would be. When working with `reduce`, a good initial value would be what would we return if we had no cards in the hand? Well, they would have 0 points, right? We can use 0, but we can't just return 0 since our function returns `Points`, so we need to go from 0 to Points. Easy enough, we can use `Hard` to accomplish this.

```ts
function handToPoints(cards:Card[]): Points {
  const initialValue:Points = {tag:'hard', value:0};
  return cards.map((c)=>cardToPoints(c)).reduce(addPoints, initialValue);
}

const hand = [{rank:'Ace', suit:'Hearts'}, {rank:7, suit:'Clubs'}]
console.log(handToPoints(hand)); // {tag:'soft', value:[8, 18]};

```

For those who know a bit of [category theory](https://en.wikipedia.org/wiki/Category_theory), you might notice that `addPoints` is the operation and `Hard 0` is the identity for a [monoid](./functional-design-pattern-monoid.md) over `Points`.

### One Last Improvement

So this code works and everything is fine, however, we can make one more improvement to `addPoints`. Let's take a look at what happens when we try to get the `Points` for the following:

```ts
const hand: Card[] = [
  {rank:'Ace', suit:'Diamonds'},
  {rank:8, suit:'Hearts'},
  {rank:4, suit:'Clubs'},
  {rank:8, suit:'Spades'}
]

console.log(handToPoints(hand)); // {tag:'soft', value:[21, 31]};
```

Huh, we got the right value, but we know that for `Soft`, it doesn't make sense to allow the player a choice between 21 and 31 because 31 is always invalid. Even though the answer isn't wrong _per se_, it does allow the user to do the wrong thing later on, which isn't the greatest.

Let's add one more function, `normalize` that will check to see if the `Points` is `Soft` with a value over 21. If so, we convert to a `Hard` and throw out the value over 21. Otherwise we return the value (since it's possible for someone to get a `Hard` score over 21).

```ts

function normalize(p:Points): Points {
  if (p.tag === 'soft' && p.value[1] > 21){
    return {tag:'hard', value:p.value[0]}
  }
  return p;
}

// updated addPoints with normalize being used
function addPoints(a:Points, b:Points): Points {
  if (a.tag === 'hard' && b.tag === 'hard'){
    return normalize(addHardAndHard(a, b));
  }
  if (a.tag === 'hard' && b.tag === 'soft'){
    return normalize(addHardAndSoft(a, b));
  }
  if (a.tag === 'soft' && b.tag === 'hard'){
    return normalize(addHardAndSoft(b, a));
  }
  return normalize(addSoftAndSoft(a as Soft, b as Soft));
}

// Note: There's some minor refactoring that we could do here (for example, creating an internal function for handling the add logic and updating `addPoints` to use that function with normalize),
// but will leave that as an exercise to the reader :)
```

## Wrapping Up

In this post, we took a look at using tuples in TypeScript by tackling a portion of the game of Blackjack. Whether it's through using it in types (like we did for `Soft`) or for destructuring values (like we did in the various `addX` functions), they can be a handy way of grouping data together for short-term operations.


## Interested in knowing more?

If you've enjoyed the above, then you might be interested in my new course (launching Summer 2025) where we build out the game of Blackjack using these concepts in TypeScript. [Click here](mailto:cameron@thesoftwarementor.com?subject=Interested%20In%20Udemy%20Course&body=I%27m%20interested%20in%20your%20upcoming%20course%20on%20Blackjack%2C%20let%20me%20know%20when%20it%27s%20ready%21) if you're interested in getting an update for when the course goes live!