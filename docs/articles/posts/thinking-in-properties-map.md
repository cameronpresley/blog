---
draft: false
date: 2024-04-09
authors:
  - cameronpresley
description:
  Using Map with Property Based Thinking

categories:
  - TypeScript
  - Functional Programming

hide:
  - toc
---

# Exploring Map with Property Based Thinking

When thinking about software, it's natural to think about the things that it can do (its features like generating reports or adding an item to a cart).

But what about the _properties_ that those actions have? Those things that are always true?

In this post, let's take a look at a fundamental tool of functional programming, the `map` function.

All the code examples in this post will be using TypeScript, but the lessons hold for other languages with `Map` (or `Select` if you're coming from .NET).

## Examining Map

In JavaScript/TypeScript, `map` is a function for arrays that allow us to transform an array of values into an array of different values.

For example, let's say that we have an array of names and we want to ensure that each name is capitalized, we can write the following:

```ts
const capitalize = (name:string): string => {
  return n[0].toUpperCase() + n.substring(1);
}
const names = ["alice","bob","charlotte"];

const properNames = names.map(capitalize);

```

In our example, as long as we have a [pure function](https://blog.thesoftwarementor.com/articles/2023/05/29/the-humble-function---foundation-to-functional-programming/#pure-functions) that takes a string and returns a new type, then `map` will work.

## What Does Map Guarantee?

Map is a cool function because it has a lot of properties that we get for free.

1. Maintains Length - If you call `map` on an array of 3 elements, then you'll get a new array with 3 elements. If you call `map` on an empty array, you'll get an empty array.

1. Maintains Type - If you call `map` on array of type `T` with a function that goes from `T` to `U`, then _every_ element in the new array is of type `U`.

1. Maintains Order - If you call `map` on array with one function, then call `map` with a function that "undoes" the original map, then you end up with the original array.

## Writing Property Based Tests

To prove these properties, we can write a set of unit tests. However, it would be hard to write a single test that that covers a single property.

Most tests are _example based_ in the sense that for a specific input, we get a specific output. _Property based_ tests, on the other hand, uses random data and ensures that a property holds for all inputs. If it finds an input where the property fails, the test fails and you know which input caused the issue.

Most languages have a tool for writing property-based tests, so we'll be using [fast-check](https://fast-check.dev/) for writing property based tests and [jest](https://jestjs.io/) for our test runner

### Checking Length Property

```ts
import fc from "fast-check";

describe("map", () => {
  it("maintains length", () => {
    // This is known as the identify function
    // as it returns whatever input it received
    const identity = <T>(a: T): T => a;

    // Fast Check assert that the following holds for all arrays of integers
    fc.assert(
      // data is the array of numbers
      fc.property(fc.array(fc.integer()), (data): void => {
        // We call the map function with the identify function
        const result = data.map(identity);

        // We make sure that our result has the same length
        expect(result).toHaveLength(data.length);
      })
    );
  });
```

If we run this test, we'll end up passing. But what is the value of `data`?

By adding a `console.log` in the test, we'll see the following values printed when we run the test (there are quite a few, so we'll examine the first few).

```sh
console.log
    [
       2125251991,  1334674146,
      -1531633149,   332890473,
       1313556939,   907640912,
        887735692, -1979633703,
       -259341001,  2015321027
    ]

  console.log
    [ 1307879257 ]

  console.log
    []

  # quite a few more...

```

### Checking Type Property

We've proven that the length property is being followed, so let's look at how we can ensure that `result` has the right type.

To keep things simple, we're going to start with a `string[]` and map them to their lengths, yielding `number[]`.

If `map` is working, then the result should be all `number`s.

We can leverage [`typeof`](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html) to check the type of each element in the array.

```ts

// An additional test in the describe block

it("maintains type", () => {
  const getLength = (s:string)=>s.length;
  fc.assert(
    // asserting with an array of strings
    fc.property(fc.array(fc.string()), (data): void => {
      // mapping to lengths of strings
      const result = data.map(getLength);

      // checking that all values are numbers
      const isAllValid = result.every((x) => typeof x === "number");
      expect(isAllValid).toBeTruthy();
    })
  );
});

```

Like before, we can add a `console.log` to the test to see what strings are being generated

```sh
console.log
  [ 'ptpJTR`G4', 's >xmpXI', 'H++%;a3Y', 'OFD|+X8', 'gp' ]

console.log
  [ 'Rq', '', 'V&+)Zy2VD8' ]


console.log
  [ 'o%}', '$o', 'w7C', 'O+!e', 'NS$:4\\9aq', 'xPbb}=F7h', 'z' ]

console.log
  [ '' ]

console.log
  [ 'apply', '' ]

console.log
  []
## And many more entries...
```

### Checking Order Property

For our third property, we need to ensure that the order of the array is being maintained.

To make this happen, we can use our `identity` function from before and check that our result is the same as the input. If so, then we know that the order is being maintained.

```ts
it("maintains order", () => {
  const identity = <T>(a: T) => a;

  fc.assert(
    fc.property(fc.array(fc.string()), (data): void => {
      const result = data.map(identity);

      expect(result).toEqual(data);
    })
  );
});
```

And with that, we've verified that our third property holds!

## So What, Why Properties?

When I think about the code I write, I'm thinking about the way it works, the way it _should_ work, and the ways it _shouldn't_ work. I find example based tests to help understand a business flow because of it's concrete values while property based tests help me understand the general guarantees of the code.

I find that once I start thinking in properties, my code became cleaner because there's logic that I no longer had to write. In our `map` example, we don't have to write checks for if we have null or undefined because `map` _always_ returns an array (empty in the worse case). There's also no need to write error handling because as long as the mapping function is pure, `map` will _always_ return an array.

For those looking to learn more about functional programming, you'll find that properties help describe the higher level constructs (functors, monoids, and monads) and what to look for.

Finding properties can be a challenge, however, Scott Wlaschin (of FSharpForFunAndProfit) has a [great post talking about design patterns](https://fsharpforfunandprofit.com/posts/property-based-testing-2/) that I've found to be immensely helpful.