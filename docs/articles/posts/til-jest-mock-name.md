---
draft: false
date: 2024-08-19
authors:
  - cameronpresley
description: >
  TIL - Jest and Mock Name

categories:
  - Today I Learned
  - TypeScript

hide:
  - toc
---

# Today I Learned - Leveraging Mock Names with Jest

I was working through the [Mars Rover kata](https://blog.thesoftwarementor.com/articles/2020/05/20/learning-through-example--mars-rover-kata/) the other day and found myself in a predicament when trying to test one of the functions, the `convertCommandToAction` function.

The idea behind the function is that based on the Command you pass in, it'll return the right function to call. The code looks something like this.

```ts
type Command = 'MoveForward' | 'MoveBackward' | 'TurnLeft' | 'TurnRight' | 'Quit'
type Action = (r:Rover):Rover;

const moveForward:Action = (r:Rover):Rover => {
  // business rules
}
const moveBackward:Action = (r:Rover): Rover => {
  // business rules
}
const turnLeft:Action = (r:Rover):Rover => {
  // business rules
}
const turnRight:Action = (r:Rover): Rover => {
  // business rules
}
const quit:Action = (r:Rover):Rover => {
  // business rules
}

// Function that I'm wanting to write tests against.
function convertCommandToAction(c:Command): Action {
  switch (c) {
    case 'MoveForward': return moveForward;
    case 'MoveBackward': return moveBackward;
    case 'TurnLeft': return turnLeft;
    case 'TurnRight': return turnRight;
    case 'Quit': return quit;
  }
}
```

I'm able to write tests across all the other functions easily enough, but for the `convertCommandToAction`, I needed some way to know which function is being returned.

Since I don't want the real functions to be used, my mind went to leveraging `Jest` and mocking out the module that the actions were defined in, yielding the following test setup.

```ts
import { Command } from "./models";
import { convertCommandToAction, convertStringToCommand } from "./parsers";

jest.mock("./actions", () => ({
  moveForward: jest.fn(),
  moveBackward: jest.fn(),
  turnLeft: jest.fn(),
  turnRight: jest.fn(),
  quit: jest.fn(),
}));

describe("When converting a Command to an Action", () => {
  it("and the command is MoveForward, then the right action is returned", () => {
    const result = convertCommandToAction("MoveForward");

    // What should my expect be?
    expect(result);
  });
});
```

One approach that I have used in the past is jest's ability [to test if a function is a mocked function](https://jestjs.io/docs/jest-object#jestismockfunctionfn), however, that approach doesn't work here because all of the functions are being mocked out. Meaning, that my test would pass, but if I returned `moveBackward` instead of `moveForward`, my test would still pass (but now for the wrong reason). I need a way to know _which_ function was being returned.

Doing some digging, I found that the `jest.fn()` has a way of setting a name for a mock by leveraging the [`mockName`](https://jestjs.io/docs/mock-function-api#mockfnmocknamename) function. This in turn allowed me to change my setup to look like this.

```ts

jest.mock("./actions", () => ({
  moveForward: jest.fn().mockName('moveForward'),
  moveBackward: jest.fn().mockName('moveBackward'),
  turnLeft: jest.fn().mockName('turnLeft'),
  turnRight: jest.fn().mockName('turnRight'),
  quit: jest.fn().mockName('quit'),
}));

```
*Note: It turns out that the `mockName` function is part of a [fluent interface](https://martinfowler.com/bliki/FluentInterface.html), which allows it to return a jest.Mock as the result of the mockName call*

With my setup updated, my tests can now check that the result has the right mockName.

```ts
describe("When converting a Command to an Action", () => {
  it("and the command is MoveForward, then the right action is returned", () => {

    // have to convert result as a jest.Mock to make TypeScript happy
    const result = convertCommandToAction("MoveForward") as unknown as Jest.Mock;

    expect(result.getMockName()).toBe("moveForward");
  });
});
```

## Wrapping Up

If you find yourself writing functions that return other function (i.e., leveraging functional programming concepts), then you check out using `mockName` for keeping track of which functions are being returned.
