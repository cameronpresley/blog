---
draft: false
date: 2024-02-14
authors:
  - cameronpresley
description: >
  Functional Primer - Intro to Declarative Programming
categories:
  - Functional Programming
  - TypeScript
hide:
  - toc
---

# Functional Primer - An Intro to Declarative Programming

When learning functional programming, you'll typically hear that functional is more _declarative_ while other approaches are more _imperative_, but why does that mean?

When we say something is imperative, we mean that we're telling the computer exactly what to do.

For example, let's look at the following code that helps us find the even numbers in an array.

```ts
// assume that input is a number array
const evens: number[] = [];
for (let i = 0; i < input.length; i++) {
  if (input[i] % 2 === 0) {
    evens.push(input[i]);
  }
}
```

In this example, we're telling the computer to run a loop for the length of the array, test each element, and if true, push that element onto the `evens` array.

Compare this to a more declarative approach using the built-in `filter` function.

```ts
const evens = input.filter((x) => x % 2 === 0);
```

Instead of telling the computer each command to run, we're instead stating what we want (e.g. give me the numbers where x%2 === 0) and not specifying _how_ to get us those values. I don't care if it's with a loop, recursion, or carrier pigeons. I'm trusting that `filter` is going to do the most efficient thing to give me the answer.

This shift in thinking ("give me what I want" vs "do what I say") is what
