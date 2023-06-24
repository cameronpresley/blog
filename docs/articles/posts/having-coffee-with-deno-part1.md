---
draft: false
date: 2023-06-26
authors:
  - cameronpresley
description: >
  Having Coffee With Deno
categories:
  - Typescript
hide:
  - toc
---

# Having Coffee with Deno - Inspiration

In a [previous post](../posts/building-relationships-with-intent.md#one-cup-of-coffee), I mention my strategy of building relationships through one-on-ones. One approach in the post was leveraging a Slack plugin, [Random Coffee](https://slack.com/apps/A5JR8MM6E-randomcoffees?tab=more_info), to automate scheduling these impromptu conversations.

<div style="
max-width: 50%;
height: auto;
">
<img src="https://media.giphy.com/media/icVkqVBTfuBDczxyBH/giphy.gif" alt="Dinosaur sitting in a coffee cup">
</div>

I wanted to leverage the same idea at my current company; however, we don't use Slack, so I can't just use that bot.

## High-Level Breakdown

Thinking more about it, the system wouldn't be too complicated as it has three moving parts:

- Get list of people
- Create random pairs
- Post message

To make it even easier, I could hardcode the list of people, and instead of posting the message to our message application, I could print it to the screen.

With these two choices made, I would need to build something that can shuffle a list and create pairs.

## Technology Choices

Even though we're hardcoding the list of names and printing a message to the screen, I know that the future state is to get the list of names dynamically, most likely through an API call of some sort. In addition, most messaging systems support using [webhooks](https://en.wikipedia.org/wiki/Webhook#Function) to create a message, so that would be the future state as well.

At this point, I know I need to use a language that is good at making HTTP calls. I also want this automation to be something that other people outside of me can maintain, so if I can use a language that we typically use, that make this more approachable.

In my case [TypeScript](https://www.typescriptlang.org/) fit the bill as we heavily use it in my space, the docs are solid, and it's straight-forward to make HTTP calls. I'm also a fan of functional programming which TypeScript supports nicely.

My major hurdle at this point is that I'd like to execute this single file of TypeScript and the only way I knew how to do that was by spinning up a Node application and using something like [ts-node](https://www.npmjs.com/package/ts-node) to execute the file.

Talking to a [colleague](https://www.linkedin.com/in/gpresland/), they recommended I check out [Deno](https://deno.com/runtime) as a possible solution. The more I learned about it, the more I thought that this would fit the bill perfectly. It supports TypeScript out of the box (no configuration needed) and it supports running a file by using `deno run`, no other tools needed.

This project is simple enough that I thought I could use Deno and if turned out to not be a good fit, I could always go back to Node.

With this figured out, we're going to create a Deno application using TypeScript as our language of choice.

## Getting Started With Deno

1. [Install Deno via these instructions](https://deno.com/manual@v1.34.3/getting_started/installation)
2. [Setup your dev environment](https://deno.com/manual@v1.34.3/getting_started/setup_your_environment) - I use VS Code, so adding the recommended extension was all that I needed.

### Trying Deno Out

Once installing Deno and configuring your environment, you can run the following script and verify everything is working correctly. It creates a new directory called `deno-coffee`, writes a new file and executes it via deno.

```bash
mkdir deno-coffee
cd deno-coffee
echo 'console.log("Hello World");' >> coffee.ts
deno run coffee.ts
```

At this point, we've got something working, so let's start building out the random coffee script.

## Let's Get Percolating

As mentioned before, we're going to hardcode a list of names and print to the screen, so let's build out the rough shape of the script:

```ts
const names = [
  "Batman",
  "Superman",
  "Green Lantern",
  "Wonder Woman",
  "Static Shock", // one of my favorite DC heroes!
  "The Flash",
  "Aquaman",
  "Martian Manhunter",
];
const pairs = createPairsFrom(shuffle(names));
const message = createMessage(pairs);
console.log(message);
```

This code won't compile as we haven't defined what `shuffle`, `createPairsFrom` or `createMessage` does, but we can tackle these one at a time.

### Let's Get Random

Since we don't want to have the same people meeting up every time, we need a way to shuffle the list of names. We could import a library to do this, but what's the fun in that?

In this case, we're going to implement the [Fisher-Yates Shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) (sounds like a dance move)

```ts
function shuffle(items: string[]): string[] {
  // create a copy so we don't mutate the original
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    // create an integer between 0 and i
    const j = Math.floor(Math.random() * i);
    // short-hand for swapping two elements around
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const words = ["apples", "bananas", "cantaloupes"];
console.log(shuffle(words)); // [ "bananas", "cantaloupes", "apples" ]
```

Excellent, we have a way to shuffle. One refactor we can make is to have `shuffle` be generic as we don't care what the type the elements of the array is, as long as we have an array.

Making this refactor gives us the following

```ts
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

Now, we can shuffle an array of anything without have to redo the work. Nice!

### Two of a Kind

Let's take a look at the next function, `createPairsFrom`. We know it's type signature is that it's going to take `string[]` and return back _something_, but what?

In the ideal world, our total list of names is even, so we always have equal pairs

```ts
{first: 'Batman', second: 'Superman'},
{first: 'Green Lantern', second: 'Wonder Woman'},
{first: 'Static Shock', second: 'The Flash'},
{first: 'Aquaman', second: 'Martian Manhunter'}
```

But what happens if `Martian Manhunter` is called away and isn't available? That would leave `Aquaman` without a pair to have coffee with (sad trombone noise).

In the case that we have an odd number of heros, the last pair, should instead be a _triple_ which would look like the following:

```ts
{first: 'Batman', second: 'Superman'},
{first: 'Green Lantern', second: 'Wonder Woman'},
{first: 'Static Shock', second: 'The Flash', third: 'Martian Manhunter'}
```

Given that we've been using the word `Pair` to represent this grouping, that means we have a domain term we can use. Which means that `createPairsFrom` has the following type signature.

```ts
function createPairsFrom(names: string[]): Pair[] {
  // logic
}
```

But what does the `Pair` type look like? We can model either using an optional property or by taking the discriminated union approach.

```ts
// Using an optional property
type Pair {
  first: string,
  second: string,
  third?: string
}

// Using Discriminated Unions
type Pair = {kind: 'double', first:string, second: string}
          | {kind: 'triple', first:string, second: string; third: string}
```

For right now, I'm thinking of going with the optional property and if we need to tweak later, we can.

Let's go ahead an implement `createPairsFrom`.

```ts
function createPairsFrom(names: string[]): Pair[] {
  const results = [];
  for (let i = 0; i <= names.length - 2; i += 2) {
    const pair: Pair = { first: names[i], second: names[i + 1] };
    results.push(pair);
  }
  if (names.length % 2 === 1) {
    // we have an odd length
    // Assign the left-over name to the third of the triple
    results[results.length - 1].third = names[names.length - 1];
  }
  return results;
}

// Example execution
console.log(createPairsFrom(["apples", "bananas", "cantaloupes", "dates"])); // [{first:"apples", second:"bananas"}, {first:"cantaloupes", second:"dates"}]
console.log(createPairsFrom(["ants", "birds", "cats"])); // [{first:"ants", second:"birds", third:"cats"}]
```

Similarly to `shuffle`, we can make this function generic as it doesn't matter what the array element types are, as long as we're given an array to work with.

Refactoring to generics give us the following:

```ts
type Pair<T> = { first: T; second: T; third?: T };

function createPairsFrom<T>(items: T[]): Pair<T>[] {
  // same function as before
}
```

### To the Presses!

For the last part, we need to implement `createMessage`. We know it has to have the following type signature:

```ts
function createMessage(pairs: Pair<string>[]): string {}
```

We know the following rules.

- When it's a double, we want the message to say `X meets with Y`
- When it's a triple, we want the message to say `X meets with Y and Z`

Based on this, it sounds like we need a way to map from `Pair` to the above string. So let's write that logic

```ts
function createMessage(pairs: Pair<string>[]): string {
  const mapper = (p: Pair<string>) =>
    `${p.first} meets with ${p.second}${p.third ? ` and ${p.third}` : ""}`;

  pairs.map(mapper);
}
```

From here, we can join the strings together using the `\n` (newline) character

```ts
function createMessage(pairs: Pair<string>[]): string {
  const mapper = (p: Pair<string>) =>
    `${p.first} meets with ${p.second}${p.third ? ` and ${p.third}` : ""}`;

  return pairs.map(mapper).join("\n");
}
```

## All Coming Together

With the implementation of `createMessage`, we can execute our script by running `deno run coffee.ts`

```bash
deno run coffee.ts

"Superman meets with Wonder Woman
Batman meets with The Flash
Martian Manhunter meets with Aquaman
Static Shock meets with Green Lantern"
```

From here, we have a working proof of concept of our idea. We could run this manually on Mondays and then post this to our messaging channel (though you might want to switch the names out). If you wanted to be super fancy, you could have this scheduled as a cron job or through Windows Task Scheduler.

The main thing to take away is that we've built something that we didn't have before and we can continue to refine and improve. If it turns out that no one likes the idea, guess what, we didn't have a ton of time invested in this. If it takes off, then that's great, we can spend more time making it better.

## Wrapping Up

In this post, we built the first version of our Random Coffee script using TypeScript and Deno. We focused on getting our tooling working and building out the business rules for shuffling and creating the pairs.

In the next post, we'll take a look at making this script smarter by having it retrieve a list of names dynamically from GitHub's API!
