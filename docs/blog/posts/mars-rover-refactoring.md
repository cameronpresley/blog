---
draft: false
date: 2020-06-30
authors: 
  - cameronpresley
description: >
  Refactoring the Rover

categories:
  - learning through example

hide:
  - toc
---

# Mars Rover – Implementing Rover – Refactoring Rover

Welcome to the eighth installment of Learning Through Example – Mars Rover! In this post, we’re going to examine the `Rover` class and see what refactoring we can do based on some patterns we’re seeing with `MoveForward`, `MoveBackward`, and `TurnLeft`. After looking at the characteristics, we’ll explore a couple of different approaches with their pros and cons. Finally, we’ll make the refactor, using our test suite to make sure we didn’t regress in functionality.

## What’s The Problem

If we look at the definition for `Rover`, it becomes clear that we have some major code duplication going on with regards to its `MoveForward`, `MoveBackward`, and `TurnLeft` methods.

```csharp hl_lines="14 17 20 23 30 33 36 39 46 49 52 55"
public class Rover
{
  public Direction Orientation {get; set;}
  public Coordinate Location {get; set;}
  
  public Rover()
  {
    Orientation = Direction.North;
    Location = new Coordinate {X=0, Y=0};
  }
  
  public void MoveForward()
  {
    if (Orientation == Direction.North) {
      Location = Location.AdjustYBy(1);
    }
    if (Orientation == Direction.South) {
      Location = Location.AdjustYBy(-1);
    }
    if (Orientation == Direction.East) {
      Location = Location.AdjustXBy(1);
    }
    if (Orientation == Direction.West) {
      Location = Location.AdustXBy(-1);
    }
  }
  
  public void MoveBackward()
  {
    if (Orientation == Direction.North) {
      Location = Location.AdjustYBy(-1);
    }
    if (Orientation == Direction.South) {
      Location = Location.AdjustYBy(1);
    }
    if (Orientation == Direction.East) {
      Location = Location.AdjustXBy(-1);
    }
    if (Orientation == Direction.West) {
      Location = Location.AdjustXBy(1);
    }
  }
  
  public void TurnLeft()
  {
    if (Orientation == Direction.North) {
      Orientation = Direction.West;
    }
    else if (Orientation == Direction.West) {
      Orientation = Direction.South;
    }
    else if (Orientation == Direction.South) {
      Orientation = Direction.East;
    }
    else if (Orientation == Direction.East) {
      Orientation = Direction.North;
    }
  }
}
```

Based on the implementations, it seems like knowing what `Direction` the `Rover` is facing is a key rule to determine what update the `Rover` needs to do. The big pain point with this block of statements is that if we added a new `Direction` (like NorthEast), then we’d have to update these statements in _multiple places_ even though all of these instances are referring to the same concept (i.e is the `Rover` facing this `Direction`). The other, more nuanced issue is that if we added a new `Direction`, there’s nothing forcing us to update _all of these places_ because of our use of `if/else`.

## How To Resolve?

From what we’re seeing, the primary issue are the duplicated `if/else` statements, so one of our primary design goals should be to have that logic in one place (instead of three different places). From there, we’d also like to have a way for the compiler to force us to handle the different `Directions` that the `Rover` is facing.

### Isolating the if/else

In order to isolate the `if/else`, let’s go ahead and extract the logic to a new private method

```csharp
private xxx Execute(xxxx)
{
  if (Orientation == Direction.North) {
    //
  }
  else if (Orientation == Direction.South) {
    // 
  }
  else if (Orientation == Direction.East) {
    //
  }
  else if (Orientation == Direction.West) {
    //
  }
}
```

We’ve now got the `if/else` isolated, but there are some questions on what the return type of this method should be or what parameters it will take. In order to answer those questions, let’s take a look at a couple of different approaches.

### Using a Functional Approach

Now that we have a method that can operate given the `Rover`'s `Orientation`, one approach we could do is to modify this method to take in an Action for every possible `Orientation`. Then based on the `Orientation`, the appropriate `Action` is called.

```csharp
private void Execute(Action ifNorth, Action ifSouth, Action ifEast, Action ifWest)
{
  if (Orientation == Direction.North) {
    ifNorth();
  }
  else if (Orientation == Direction.South) {
    ifSouth();
  }
  else if (Orientation == Direction.East) {
    ifEast();
  }
  else if (Orientation == Direction.West) {
    ifWest();
  }
}
```

With this implementation, `TurnLeft` would look like

```csharp
public void TurnLeft()
{
  Action ifNorth = () => Orientation = Direction.West;
  Action ifWest = () => Orientation = Direction.South;
  Action ifSouth = () => Orientation = Direction.East;
  Action ifEast = () => Orientation = Direction.North;

  Execute(ifNorth, ifSouth, ifEast, ifWest);
}
```

And `MoveForward` would look like

```csharp
public void MoveForward()
{
  Action ifNorth = () => Location=Location.AdjustYBy(1);
  Action ifSouth = () => Location=Location.AdjustYBy(-1);
  Action ifEast = () => Location=Location.AdjustXBy(1);
  Action ifWest = () => Location=Location.AdjustXBy(-1);
  
  Execute(ifNorth, ifSouth, ifEast, ifWest);
}
```

#### Advantages

The primary advantage of this approach is that in order to call `Execute`, you have to pass a parameter for the different directions. If you fail to do so, the code will fail to compile, which forces developers to handle the various use cases.

Furthermore, if there’s a bug in any of the `Actions`, then for troubleshooting, we’d need to know what method caused the problem and what the rover’s `Orientation` was and we can quickly figure out what the problem is.

#### Drawbacks
When using this approach, one thing to keep in mind is if we need to support additional `Direction`s in the future. The `Execute` method is already taking in four parameters and keeping them in the right order is difficult enough. What about five, six, or ten directions to support? The function signature would quickly become unwieldy.

In addition, the other downside to this approach is that if any of the `Action`s were to become much more complicated, it would start cluttering up the respective `Move` or `Turn` methods.

### Using an Object-Oriented Approach
Now that we have a method that can operate given the Rover‘s Orientation, another approach is to introduce the Strategy pattern where we would need to create the following types

- `IMovementStrategy` – an interface that lists the different kinds of movements that can be done (currently `MoveForward`, `MoveBackward`, and `TurnLeft`)
- `NorthMovementStrategy` – a new class that implements the `IMovementStrategy` and is responsible for the various business rules when moving and facing `North`
- `GetMovementStrategy` – a method in `Rover` that for the current `Orientation`, returns the right implementation of `IMovementStrategy`
- Update the existing move methods to use `GetMovementStrategy`

First, let’s take a look at the `IMovementStrategy` definition

```csharp
internal IMovementStrategy()
{
  Coordinate MoveForward(Coordinate coordinate);
  Coordinate MoveBackward(Coordinate coordinate);
  Direction TurnLeft();
}
```

The key takeaway for this type is that if we need to add an additional movement (like `TurnRight`), we’ll need to update this interface. Taking a closer look, we’ve defined the signatures for all of the methods to return a value (either a `Location` or a `Direction`). We have to make this change because no `Strategy` will have access to the `Rover` itself, so it’ll need to return the correct value for `Rover` to hold onto.

Next, let’s take a look at an example implementation for when the `Orientation` is `North`

```csharp
internal class NorthMovementStrategy : IMovementStrategy
{
  public Coordinate MoveForward(Coordinate coordinate)
  {
    return coordinate.AdjustYBy(1);
  }
  public Coordinate MoveBackward(Coordinate coordinate)
  {
    return coordinate.AdjustYBy(-1);
  }
  public Direction TurnLeft()
  {
    return Direction.West;
  }
}
```

If you look closer, we’ve essentially moved the business rules for the three methods from the existing business rules. We would repeat this process for the other `Direction`s (yielding a `SouthMovementStrategy`, an `EastMovementStrategy`, and a `WestMovementStrategy`)

Now that we have the various strategies in place, we can create the `GetMovementStrategy` method

```csharp
private IMovementStrategy GetStrategy()
{
  if (Orientation == Direction.North) {
   return new NorthMovementStrategy();
  }
  else if (Orientation == Direction.South) {
    return new SouthMovementStrategy();
  }
  else if (Orientation == Direction.East) {
    return new EastMovementStrategy();
  }
  else if (Orientation == Direction.West) {
    return new WestMovementStrategy();
  }
}
```

Which then would allow us to refactor `TurnLeft` as the following

```csharp
public void TurnLeft()
{
  var movementStrategy = GetMovementStrategy();
  Orientation = movementStrategy.TurnLeft();
}
```

And `MoveForward` as

```csharp
public void MoveForward()
{
  var movementStrategy = GetMovementStrategy();
  Location = movementStrategy.MoveForward(Location);
}
```


#### Advantages

When using this approach, we can easily extend functionality when new `Direction`s are added. For example, if we added `NorthEast`, then we would create a new `MovementStrategy`, have it implement the interface and fill in business rules (also allowing us to easily add tests as we go). From there, we would update the `GetMovementStrategy` method to return the new strategy. By adding new functionality by primarily writing new code and making very little modifications to existing code, we can adhere to the Open/Closed Principle from SOLID design.

#### Drawbacks
The major drawback of this approach is that we had to create a lot of boilerplate code to make everything hang. One interface, four implementations, and a factory method for creating the appropriate strategy for a given `Orientation`.

The other, more subtle, drawback is that one must be aware of the pivot point of change. For example, we originally made this refactor based on strategies of what to do when faced in a given `Direction`. This made sense as an easy refactor. However, we’ve now made it easy to support a new `Direction` when added, but if we were to add a new `Command` instead, we would update the `IMovementStrategy` with the new method which would break all implementations. Once that happens, we have no choice but to implement the whole feature at once.

Personally, I’m a proponent of delivering value in small chunks and verify that we’re building the right thing, but in this case, this approach doesn’t make that easy.

### Start the Refactor

Given the above options, I’m going to choose the more functional approach mostly because the business rules in my case are one-liners. If they were more complex, then I’d lean heavily more towards the `Strategy` pattern.

With that in mind, I’m going to go ahead and define the general `Execute` method as such

```csharp
private void Execute(Action ifNorth, Action ifSouth, Action ifEast, Action ifWest)
{
  if (Orientation == Direction.North) {
    ifNorth();
  }
  else if (Orientation == Direction.South) {
    ifSouth();
  }
  else if (Orientation == Direction.East) {
    ifEast();
  }
  else if (Orientation == Direction.West) {
    ifWest();
  }
}
```

Once that’s in place, I can go ahead and refactor `TurnLeft` to use the `Execute` method.

```csharp
public void TurnLeft()
{
  Action ifNorth = () => Orienation = Direction.West;
  Action ifWest = () => Orientation = Direction.South;
  Action ifSouth = () => Orientation = Direction.East;
  Action ifEast = () => Orientation = Direction.North;

  Execute(ifNorth, ifSouth, ifEast, ifWest);
}
```

Now that I’ve updated `TurnLeft`, I can run the tests to make sure I didn’t break functionality. This is where the power of automated tests come to play. I can have higher confidence that my refactor didn’t break anything because of the test suite.

After verifying  that the tests pass for `TurnLeft`, I’ll continue refactoring `MoveForward`

```csharp
public void MoveForward()
{
  Action ifNorth = () => Location=Location.AdjustYBy(1);
  Action ifSouth = () => Location=Location.AdjustYBy(-1);
  Action ifEast = () => Location=Location.AdjustXBy(1);
  Action ifWest = () => Location=Location.AdjustXBy(-1);
  
  Execute(ifNorth, ifSouth, ifEast, ifWest);
}
```

and `MoveBackward` using the same technique

```csharp
public void MoveForward()
{
  Action ifNorth = () => Location=Location.AdjustYBy(1);
  Action ifSouth = () => Location=Location.AdjustYBy(-1);
  Action ifEast = () => Location=Location.AdjustXBy(1);
  Action ifWest = () => Location=Location.AdjustXBy(-1);
  
  Execute(ifNorth, ifSouth, ifEast, ifWest);
}

public void MoveBackward()
{
  Action ifNorth = () => Location=Location.AdjustYBy(-1);
  Action ifSouth = () => Location=Location.AdjustYBy(1);
  Action ifEast = () => Location=Location.AdjustXBy(-1);
  Action ifWest = () => Location=Location.AdjustXBy(1);
  
  Execute(ifNorth, ifSouth, ifEast, ifWest);
}
```

## One Final Touch

So at this point, we’ve successfully refactored `MoveForward`, `MoveBackward`, and `TurnLeft` to use `Execute` instead of their own logic, but the more I look at `Execute`, the more I want to convert the `if/else` into a `switch` statement because a `switch` is going to force us to implement the different `Direction`s whereas the `if/else` pattern did not. So let’s go ahead and make that change.

```csharp
public void Execute(Action ifNorth, Action ifSouth, Action ifEast, Action ifWest)
{
  switch(Orientation)
  {
    case Direction.North: ifNorth(); break;
    case Direction.South: ifSouth(); break;
    case Direction.East: ifEast(); break;
    case Direction.West: ifWest(); break;
  }
}
```

And we can verify that our refactored worked like a top!

## Wrapping Up

At this point, we’ve made some good changes to the `Rover` with how the various methods work by examining the duplication (the `if/else`), extracting the duplication to a single area, and the compared the functional approach and the OOP approach via the Strategy pattern. In the next post, we’ll take on implementing `TurnRight` and see how our new refactor works in practice when adding new functionality!