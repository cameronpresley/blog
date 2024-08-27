---
draft: false
date: 2024-08-27
authors:
  - cameronpresley
description: >
  In this post, I'll walk you through how to use the `reduce` function from JavaScript and a look into a design pattern from Functional Programming, the Monoid.

categories:
  - TypeScript
  - Functional Programming

hide:
  - toc
---

# Functional Design Patterns - Reduce and Monoids

When learning about a loops, a common exercise is to take an array of elements and calculate some value based on them.  For example, let's say that we have an array of numbers and we want to find their sum. One approach would be the following:

```ts
const values = [1, 2, 3, 4, 5];
let total = 0;
for (const val in values) {
    total += val;
}
```

This code works and we'll get the right answer, however, there's a pattern sitting here. If you find yourself writing code that has this shape (some initial value and some logic in the loop), then you have a _reducer_ in disguise.

Let's convert this code to use the _[reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)_ function instead.

```ts
const values = [1, 2, 3, 4, 5];
const total = values.reduce((acc, curr) => acc + curr, 0);
```

The `reduce` function takes two parameters, the _reducer_ and the _initial value_. For the _initial value_, this is the value that the result should be if the array is empty. Since we're adding numbers together, zero makes the most sense.

The _reducer_, on the other hand, says that if you give me the accumulated result so far (called _acc_ in the example) and an element from the array (called _curr_ in the above example), what's the new accumulation?

Reduce is an extremely powerful tool (in fact, [I give a presentation where we rewrite some of C#'s LINQ operators as reduce](../../presentations.md#level-up-on-functional-programming-by-rebuilding-linq)).

But there's another pattern sitting here. If you find that the initial value and elements of the array have the same type, you most likely have a [monoid](https://en.wikipedia.org/wiki/Monoid).

## Intro to Monoids

The concept of Monoid comes from the field of [category theory](https://en.wikipedia.org/wiki/Category_theory) where a Monoid contains three things

1. A set of values (you can think about this as a type)
1. Some binary operation (e.g., a function that takes two inputs and returns a single output of said type)
1. Some identity element such that if you pass the id to the binary operation, you get the other element back.

There's a lot of theory sitting here, so let's put it in more concrete terms.

If we have a Monoid over the a type A, then the following must be true:

```ts
function operation<A>(x:A, y:A): A 
{
    // logic for operation
}
const identity: A = // some value of type A
operation(x, identity) === operation(identity, x) === x

operation(x, operation(y, z)) === operation(operation(x, y), z)
```

Here's how we would define such a thing in TypeScript.

```ts
export interface Monoid<A>{
    operation: (x:A, y:A)=> A;
    identity:A;
}
```

### Exploring Total

With more theory in place, let's apply it to our running total from before. It turns out that addition forms a Monoid over positive numbers with the following:

```ts
const additionOverNumber: Monoid<number> = {
    identity: 0,
    operation: (a:number, b:number) => a+b;
}
```

Wait a minute... This looks like what the `reduce` function needed from before! 

In the case where we have a Monoid, we have a way of reducing an array to a single value _for free_ because of the properties that Monoid gives us.

### Exploring Booleans

Thankfully, we're not limited to just numbers. For example, let's take a look at booleans with the `&&` and `||` operators.

In the case of `&&`, that's our operation, so now we need to find the identity element. In other words, what value must `id` be if the following statements are true?

```ts
const id: boolean = ...
id && true === true
id && false === false
```

Since `id` has to be a boolean, the answer is `true`. Therefore, we can define our Monoid like so

```ts
const AndOverBoolean: Monoid<boolean> = {
    identity: true,
    operation: (a:boolean, b:boolean) => a && b
}
```

With this monoid defined, let's put it to use. Let's say that we wanted to check if every number in a list is even. We could write the following:

```ts
const values = [1, 2, 3, 4, 5];

const areAllEven = values.map(x=>x%2===0).reduce(AndOverBoolean.operation, AndOverBoolean.identity);
```

Huh, that looks an awful lot like how we could have used _[every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every)_.

```ts

const values = [1, 2, 3, 4, 5];
const areAllEven = values.every(x=>x%2===0);
```

Let's take a look at the `||` monoid now. We have the operation, but we now we need to find the identity. In other words, what value must `id` be if the following statements are true?

```ts
const id: boolean = ...;
id || true === true
id || false === false
```

Since `id` has to be a boolean, the answer is `false`. Therefore, we can define our monoid as such.

```ts
const OrOverBoolean: Monoid<boolean> = {
    identity: false,
    operation: (x:boolean, y:boolean) => x || y
} 
```

With this monoid defined, let's put it to use. Let's say that we wanted to check if some number in a list is even. We could write the following:

```ts
const values = [1, 2, 3, 4, 5];

const areAllEven = values.map(x=>x%2===0).reduce(OrOverBoolean.operation, OrOverBoolean.identity);
```

Similar to the `AndOverBoolean`, this looks very similar to the code we would have written if we had leveraged _[some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)_.

```ts
const values = [1, 2, 3, 4, 5];

const isAnyEven = values.some(x => x%2 === 0);
```

## Wrapping Up

When working with arrays of items, it's common to need to reduce the list down to a single element. You can start with a for loop and then refactor to using the reduce function. If the types are all the same, then it's likely that you also have a monoid, which can give you stronger guarantees about your code.
