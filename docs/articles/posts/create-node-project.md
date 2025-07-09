---
draft: false
date: 2025-07-10
authors:
  - cameronpresley
description: >
  Creating a Node Project with TypeScript and Jest From Scratch

categories:
  - TypeScript

hide:
  - toc
---

# Creating a Node Project With TypeScript and Jest From Scratch

When teaching engineers about Node, I like to start with the bare bone basics and build from there. Though there is value in using tools to auto-scaffold a project ([Vite](https://vite.dev/) for React applications, for example), there's also value in understanding how everything hangs together.

In this post, I'm going to show you how to create a Node project from scratch that has TypeScript configured, Jest configured, and a basic test suite in place.

Let's get started!

_Note: Do you prefer learning via video? You can find [this on YouTube](https://youtu.be/mphKoDUiZVg?si=jJt1ZN-qZURXysgd)

## Step 0 - Dependencies

For this project, the only tool you'll need is the Long Term Support (LTS) version of Node (as of this post, that's v22, but these instructions should hold regardless). If you're working with different Node applications, then I _highly_ recommend using a tool to help you juggle the different versions of Node you might need (Your options are [nvm](https://github.com/nvm-sh/nvm) if you're on Mac/Linux or [Node Version Manager for Windows](https://github.com/coreybutler/nvm-windows) if you're on Windows).

## Step 1 - Creating the Directory Layout

A standard project will have a layout like the following:

```
projectName
    \__src # source code for project is here
        \__ index.ts
        \__ index.spec.ts
    \__ package.json
    \__ package.lock.json
    \__ README.md
```

So let's go ahead and create that. You can do this manually or by running the following in your favorite terminal.

```sh
mkdir <projectName> && cd projectName
mkdir src
```

## Step 2 - Setting up Node

With the structure in the right place, let's go ahead and create a Node application. The hallmark sign of a Node app is the `package.json` file as this has three main piece of info.

1. What's the name of the application and who created it
1. What scripts can I execute?
1. What tools does it need to run?

You can always manually create a `package.json` file, however, you can generate a standard one by using `npm init --yes`. 

_Tip: By specifying the `--yes` flag, this will generate a file with default settings that you can tweak as needed._

## Step 3 - Setting up TypeScript

At this point, we have an application, but there's no code or functionality. Given that we're going to be using TypeScript, we'll need to install some libraries.


### Installing Libraries

In the project folder, we're going to install both `typescript` and a way to execute it, `ts-node`.

```sh
npm install --save-dev typescript ts-node
```

_Note: With Node v24, you can execute TypeScript natively, but there are some [limitations](https://nodejs.org/api/typescript.html#type-stripping). For me, I still like using ts-node for running the application locally._

### Setting up TypeScript

Once the libraries have been installed, we need to create a `tsconfig.json` file. This essentially tells TypeScript how to compile our TypeScript to JavaScript and how much error checking we want during our compilation.

You can always create this file manually, but luckily, `tsc` (the TypeScript compiler) can generate this for you.

In the project folder, we can run the following

```sh
npx tsc --init
```

### Writing Our First TypeScript File

At this point, we have TypeScript configured, but we still don't have any code. This is when I'll write a simple `index.ts` file that leverages TypeScript and then try to run it with `ts-node`.

In the `src` folder, let's create an `index.ts` file write the following code. 

```ts

export function add(a:number, b:number): number {
  return a+b;
}

console.log("add(2,2) =", add(2,2));

```

This uses TypeScript features (notice the type annotations), which if we try to run this with `node`, we'll get an error.

### Using ts-node To Run File

Let's make sure everything is working by using `ts-node`.

Back in the terminal, run the following:

```sh
npx ts-node src/index.ts
```

If everything works correctly, you should see the following in the terminal window.

```sh
add(2,2) = 4
```

### Adding Our First NPM Script

We're able to run our file, but as you could imagine, it's going to get annoying to always type out `npx ts-node src/index.ts`. Also, this kills discoverability as you have to document this somewhere (like a README.md) or it'll become a thing that someone "just needs to know".

Let's improve this by adding a script to our `package.json` file.

Back in [setting up node](#step-2---setting-up-node), I mentioned that one of the cool things about `package.json` is that you can define custom scripts.

A common script to have defined is `start`, so let's update our `package.json` with that script.

```json
{
  // some code here
  "scripts: {
    "start": "ts-node src/index.ts"
    // other scripts here
  },
}
```

With this change, let's head back to our terminal and try it out.

```sh
npm run start
```

If everything was setup correctly, we should see the same output as before.


## Step 4 - Setting up Jest

At this junction, we can execute TypeScript and made life easier by defining a `start` script. The next step is that we need to set up our testing framework.

While there are quite a few options out there, a common one is [jest](https://jestjs.io/) so that's what we'll be using in this article.

Since jest is a _JavaScript_ testing library and our code is in TypeScript, we'll need a way to translate our TypeScript to JavaScript. The jest docs mention a few ways of doing this (using a tool like Babel for example). However, I've found using `ts-jest` to be an easier setup and still get the same outcomes.

### Installing Libraries

With our tools selected, let's go ahead and install them.

```sh
npm install --save-dev jest ts-jest @types/jest
```

_Note: You might have seen that we're also installing "@types/jest". This does't provide any functionality, however, it does gives us the types that jest uses. Because of that, our code editor can understand @types/jest and give us auto-complete and Intellisense when writing our tests_

### Configuring Jest

So we have the tools installed, but need to configure them. Generally, you'll need a `jest.config.js` file which you can hand-write.

Or we can have _ts-jest_ generate that for us :)

```sh
npx ts-jest config:init
```

If this step works, you should have a `jest.config.js` file in the project directory.

Let's write our first test!

### Writing Our First Test

Jest finds tests based on file names. So as long as your test file ends with either `.spec.ts`, `.spec.js`, `.test.ts`, or `.test.js`, jest will pick it up.

So let's create a new file in the `src` folder called `index.spec.ts` and add the following:

```ts
import { add } from "./index"
// describe is container for one or more tests
describe("index", () => {
  // it - denotes this is a test
  it("does add work", () => {
    const result = add(2,2);

    expect(result).toBe(4);
  })
})

```

With our test written, we can run it in the terminal with the following:

```sh
npx jest
```

### Adding a Test NPM Script

Just like when we added a custom `start` script to our `package.json` file, we can do a similar thing here with our tests. 

In `package.json`, update the `scripts` section to look like:

```json
{
  // other code
  "script": {
    "start": "ts-node src/index.ts",
    "test": "jest"
  },
  // other code
}
```

With this change, we can run our test suite by using `npm run test` in the terminal.

Congrats, just like that, you have a working Node application with TypeScript and Jest for testing!

## Next Steps

With the scaffolding in place, you're in a solid spot to start growing things out. For example, you could...

- Start setting up a Continuous Integration pipeline
- Fine-tune your `tsconfig.json` to enable more settings (like turning off the ability to use any)
- Fine-tune your `jest.config.js` (like having your mocks auto-rest)
- Start writing application code!

