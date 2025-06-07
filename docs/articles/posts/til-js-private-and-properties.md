---
draft: false
date: 2025-06-10
authors:
  - cameronpresley
description: >
  TIL - JavaScript private fields and properties

categories:
  - Today I Learned
  - TypeScript

hide:
  - toc
---

# Today I Learned - JavaScript Private Fields and Properties

One of my favorite times of year has started, intern season! I always enjoy getting a new group of people who are excited to learn something new and are naturally curious about everything!

As such, one of the first coding katas we complete is [Mars Rover]() as it's a great exercise to introduce union types, records, functions, and some of the basic array operators (map and reduce). It also provides a solid introduction to automated testing practices (Arrange/Act/Assert, naming conventions, test cases). Finally, you can solve it multiple ways and depending on the approach, lends itself to refactoring and cleaning up.

Now my preferred approach to the kata is to leverage functional programming (FP) techniques, however, it wouldn't be correct to only show that approach, so I tackled it using more object-oriented (OO) instead.

One of the things that we run into pretty quickly is that we're going to need a `Rover` class that will have the different methods for moving and turning. Since the `Rover` will need to keep track of its `X`, `Y`, and `Direction`, I ended up with the following:

```ts
type Direction = "North" | "South" | "East" | "West";
class Rover {
  constructor(private x:number, private y:number, private direction:Direction){}
  // moveForward, moveBackward, turnLeft, and turnRight definitions below...
}
```

This approach works just fine as it allows the caller to give us a starting point, but they can't manipulate `X`, `Y`, or `Direction` directly, they have to use one of the methods (i.e., we have encapsulation).

## The Problem

However, we run into a slight problem once we get to the user interface. We would like to be able to display the Rover's location and direction, however, we don't have a way of accessing that data since we marked those as private.

In other words, we can't do the following:

```ts
const rover = new Rover(0, 0, 'North');
console.log(`Rover is at (${r.x}, ${r.y}) facing ${r.direction}`)
```

One way to fix this problem is to remove the `private` modifier and allow the values to be public, however, this would mean that the state of my object could be manipulated either through it's methods (i.e., `moveForward`) or through global access `rover.X = 100`. 

What I'd like to do instead is to have a way to get the value to the outside world, but not allow them to modify it.

In languages like C#, we would leverage a public get/private set on properties, which would look something like this:

```cs

public class Rover 
{
  public int X {get; private set;}
  public int Y {get; private set;}
  public Direction Direction {get; private set;}
  public Rover (int x, int y, Direction direction)
  {
    X = x;
    Y = y;
    Direction = direction;
  }
}
```

Let's take a look at how we can build the same idea in TypeScript (and by extension, JavaScript)

## Introducing Fields

Introducing fields are simple enough, we just define them in the class like so:

```ts
class Rover {
  private x:number;
  private y:number;
  private direction:Direction;
}
```

However, if you're working in JavaScript, the `private` keyword doesn't exist. However, JavaScript still allows you to mark something as [private by prefixing `#` to the name.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties)

```js
class Rover {
  #x;
  #y;
  #direction;
}
```

With these fields in place, we now update our constructor to explicitly set the values.

In TypeScript
```ts
constructor(x:number, y:number, direction:Direction){
  this.x = x;
  this.y = y;
  this.direction = direction;
}
```

In JavaScript
```js
constructor(x, y, direction){
  this.#x = x;
  this.#y = y;
  this.#direction = direction;
}
```

At this point, we can update the various methods (`moveForward`, `moveBackward`, `turnLeft`, `turnRight`) to use the fields.

## Introducing Properties

With out fields in use, we can now expose their values by defining the get (colloquially known as the getter) for the fields.

In TypeScript

```ts
get x(): number {
  return this.x;
}
get y(): number {
  return this.y;
}
get direction(): Direction {
  return this.direction;
}
```

In JavaScript
```js
get x() {
  return this.#x;
}
get y() {
  return this.#y;
}
get direction() {
  return this.#direction;
}
```

With our properties in place, the following code will work now

```ts
const rover = new Rover(4, 2, 'North');
console.log(`Rover is at (${rover.X}, ${rover.Y}) facing ${rover.Direction})`);
// prints "Rover is at (4, 2) facing North

// But this doesn't work
rover.X = 100; // can't access X

```

## Closing Thoughts

When working with data that requires different access levels, think about leveraging private fields and then providing access through public properties.
