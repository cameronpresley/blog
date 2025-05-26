---
draft: false
date: 2025-05-27
authors:
  - cameronpresley
description: >
  Implementing Model View Update in TypeScript

categories:
  - TypeScript
  - Functional Programming

hide:
  - toc
---

# Simplifying Console Logic with the Model-View-Update

When I first started dabbling in Functional Programming, a new front-end language called [Elm](https://elm-lang.org/) had been released and it was generating a lot of buzz about how it simplified web development by introducing four parts (i.e., The Elm Architecture" (TEA)) that provided a mental model when creating web pages. This way of thinking was so powerful that it inspired popular libraries like [Redux](https://redux.js.org/understanding/history-and-design/prior-art#elm) and [ngrx](https://ngrx.io/docs) which took this architecture mainstream.

## Spilling the TEA

At a high level, the architecture has four parts:

1. Model -> What are we rendering?
1. View -> How do we want to render it?
1. Update -> Given the current model and a Command, what's the new model?
1. Command -> What did the user do?

To help make this a bit more clear, let's define some types for these parts and see how they would work together

```ts
type Model = any;
type View = (m:Model)=>Promise<Command>;
type Update = (m:Model, c:Command)=>Model;
type Command = "firstOption" | "secondOption" ... | 'quit';

async function main(model:Model, view:View, update:Update): Promise<void>{
  const command = await view(model);
  if (command === 'quit'){
    return;
  }
  const newModel = update(model, command);
  return main(newModel);
}
```

With some types in play, let's go ahead and build out a small application, a counter (the "Hello World" for Elm).

## Building a Counter

First, we need to figure out what the model will be. Since we're only keeping tracking of a number, we can define our model as a number.

```ts
type Model = number;
```

Next, we need to define what the user can do. In this case, they can either _increment_, _decrement_, or _quit_ so let's set the command up.

```ts
type Command = 'increment' | 'decrement' | 'quit';
```

Now that we have `Command`, we can work on the `update` function. Given the type signature from before, we know its going to look like this:

```ts
function update(model:Model, command:Command): Model {
  // logic
}
```

We can leverage a `switch` and put in our business rules

```ts
function update(model:Model, command:Command): Model {
  switch(command){
    case 'increment': return model+1;
    case 'decrement': return model-1;
    case 'quit': return model;
  }
}

```

Finally, we need to define our `view` function. Like before, we can get the skeleton for the function based on the types from earlier.

```ts
async function view(model:Model): Promise<Command>{

}
```

Let's update the function with our rendering logic

```ts
async function view(model:Model): Promise<Command>{
  console.log("Counter:", model);
  console.log("Choose to (i)ncrement, (d)ecrement, or (q)uit");
}
```

We've got our render up and running, however, we need to get input from the user. Since we're working within Node, we could use [readline](https://nodejs.org/api/readline.html), however, I've recently been using [@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts) and find it to be a nice abstraction to use. So let's use that package.

```ts
import {input} from "@inquirer/prompts";

async function getChoice(): Promise<Command>{
  console.log("Choose to (i)ncrement, (d)ecrement, or (q)uit");
  const validChoices = ["i", "d", "q"];
  const validator = (s:string) => validChoices.include(s?.trim().toLowerCase());
  const selection = await input({message:message, validate:validator});
  if (selection === "i") {
    return "increment";
  } else if (selection === "d"){
    return "decrement";
  } else {
    return "terminate"
  }
}
// Let's change the view function to use getChoice

async function view(model:Model): Promise<Command>{
  console.log("Counter:", model);
  return getChoice();
}

```

With these pieces defined, we can use the `main` function from before.

```ts

async function main(model:Model, view:View, update:Update): Promise<void>{
  const command = await view(model);
  if (command === 'quit'){
    return;
  }
  const newModel = update(model, command);
  return main(newModel);
}

// Invoking Main
main(10, view, update);

```

## Starting Back at Zero

Now that we have increment and decrement working, it would be nice to be able to reset the counter without having to restart the application, so let's see how bad that would be.

First, we need to add a new choice to `Command` (called _reset_). This will force us to update the rest of the code that's working with `Command`.

```ts
type Command = "increment" | "decrement" | "reset" | "quit";
```

Next, we need to update the `update` function so it knows how to handle a `reset` command. In our case, we need to set the model back to zero.

```ts
function update(model:Model, command:Command): Model {
  switch(command){
    case 'increment': return model+1;
    case 'decrement': return model-1;
    case 'reset': return 0;
    case 'quit': return model;
  }
}
```

At this point, the application knows how to handle the new `Command`, however, we need to update our `view` function to allow the user to select reset.

```ts

async function view(model:Model): Promise<Command>{
  console.log("Counter:", model);
  return getChoice();
}

async function getChoice(): Promise<Command>{
  // updating the console.log
  console.log("Choose to (i)ncrement, (d)ecrement, (r)eset, or (q)uit"); 
  const validChoices = ["i", "d", "r", "q"];
  const validator = (s:string) => validChoices.include(s?.trim().toLowerCase());
  const selection = await input({message:message, validate:validator});
  if (selection === "i") {
    return "increment";
  } else if (selection === "d"){
    return "decrement";
  } else if (selection === "r"){
    return "reset";
  } else {
    return "terminate"
  }
}

```

## What's Next?

Now that we have have a working version, you could start implementing some fun functionality. For example, how would you allow someone to set how much to increment or decrement by? What if you needed to keep track of previous values (i.e., maintaining history)? I highly encourage you trying this out with a simple kata (for example, how about giving [Mars Rover](../posts/mars-rover-definition.md#problem-description) a try?)

## Full Working Solution

```ts
import {input} from "@inquirer/prompts";

type Model = number;
type Command = "increment" | "decrement" | "reset" | "quit";
type View = (model:Model) => Promise<Command>;
type Update = (model:Model, command:Command) => Model;

function update(model:Model, command:Command): Model {
  switch(command){
    case "increment": return model+1;
    case "decrement": return model-1;
    case "reset": return 0;
    case "quit": return model;
  }
}

function view(model:Model): Promise<Command>{
  console.log(`Counter:${model}`);
  return getChoice();
}

async function getChoice(): Promise<Command>{
  console.log("Choose to (i)ncrement, (d)ecrement, (r)eset, or (q)uit"); 
  const validChoices = ["i", "d", "r", "q"];
  const validator = (s:string) => validChoices.include(s?.trim().toLowerCase());
  const selection = await input({message:message, validate:validator});
  if (selection === "i") {
    return "increment";
  } else if (selection === "d"){
    return "decrement";
  } else if (selection === "r"){
    return "reset";
  } else {
    return "terminate"
  }
}

async function main(model:Model, view:View, update:Update): Promise<void>{
  const command = await view(model);
  if (command === 'quit'){
    return;
  }
  const newModel = update(model, command);
  return main(newModel, view, update);
}

main(10, view, update);

```