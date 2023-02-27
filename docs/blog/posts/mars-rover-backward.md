---
draft: false
date: 2020-06-16
authors: 
  - cameronpresley
description: >
  Implementing Moving Backward for Rover

categories:
  - learning through example

hide:
  - toc
---

# Mars Rover – Implementing Rover : Moving Backward

Welcome to the sixth installment of Learning Through Example – Mars Rover! In this post, we’ll pick up from where we left off with `Rover` and start implementing the rules for the `Rover` to move backward!

Just like last time, we’ll first examine what it means for the `Rover` to move backward by looking over the requirements in deeper detail. Once we have a better understanding, we’ll start driving out the functionality by focusing on a simple case and building more complexity. By the end of this post, we’ll have a `Rover` that will know how to move backward when facing any `Direction`!

## So What Does It Mean To Move Backward?

If we look back at the original [requirements](./mars-rover-definition.md#problem-description) for moving backward, we find this single line with regards to moving backward

> When the rover is told to move backward, then it will move rover unit away from the direction it’s facing

Hmm, based on our previous experience with implementing `MoveForward`, I have a good idea of the requirements and after double-checking with our Subject Matter Expert, we confirm that our assumption is correct and derive the following requirements.

- Given the `Rover` is facing North, when it moves forward, then its `Y` value decreases by 1
- Given the `Rover` is facing South, when it moves forward, then its `Y` value increases by 1
- Given the `Rover` is facing East, when it moves forward, then its `X` value decreases by 1
- Given the `Rover` is facing East, when it moves forward, then its `X` value increases by 1

Great, we have enough information to get started so we can start demonstrating the software and get quicker feedback!

## Red/Green/Refactor For Rover Facing North

Given the lessons learned when writing tests for when implementing move forward, we can write the following test.

```csharp
[Test]
public void AndFacingNorthThenYDecreasesByOne()
{
  var rover = new Rover { Orientation = Direction.North };
  var initialLocation = rover.Location;

  rover.MoveBackward();

  var expectedLocation = new Coordinate(initialLocation.X, initialLocation.Y - 1);
  Assert.AreEqual(expectedLocation, rover.Location);
  Assert.AreEqual(Direction.North, rover.Orientation);
}
```

Now let’s write just enough code to pass.

```csharp
public void MoveBackward()
{
  Location=Location.AdjustYBy(-1);
}
```

Not too shabby, we’ve got enough code in place to make everything pass so let’s take a look at refactoring. From the business rules, `MoveBackward` is too simple to need a refactor, though I have a suspicion about what the final look of the method will look like. From the test code, the test is pretty straightforward and looks a ton like the tests we wrote for `MoveForward`.

With all of that in mind, let’s go ahead and commit these changes and go to the next requirement!

## Red/Green/Refactor For Rover Facing South

Once again, we can write a failing test for when the `Rover` faces `South`

```csharp
[Test]
public void AndFacingSouthThenYIncreasesByOne()
{
  var rover = new Rover { Orientation = Direction.South };
  var initialLocation = rover.Location;

  rover.MoveBackward();

  var expectedLocation = new Coordinate(initialLocation.X, initialLocation.Y + 1);
  Assert.AreEqual(expectedLocation, rover.Location);
  Assert.AreEqual(Direction.South, rover.Orientation);
}
```

And now enough code to make it pass

```csharp
public void MoveBackward()
{
  if (Orientation == Direction.North) {
    Location=Location.AdjustYBy(-1);
  }
  Location = Location.AdjustYBy(1);
}
```

Once again, now that we have passing tests, is there anything we want to refactor? The business rules look to be simple enough so I don’t feel the need to refactor those. When we look at the test code, the test seems straightforward and I’m not sure what I’d simplify.

Time to commit these changes and on to the next requirement.

## Red/Green/Refactor For Rover Facing East

Third verse same as the first, we can write a failing test for when the Rover faces East

```csharp
[Test]
public void AndFacingEastThenXDecreasesByOne()
{
  var rover = new Rover { Orientation = Direction.East };
  var initialLocation = rover.Location;

  rover.MoveBackward();

  var expectedLocation = new Coordinate(initialLocation.X - 1, initialLocation.Y);
  Assert.AreEqual(expectedLocation, rover.Location);
  Assert.AreEqual(Direction.East, rover.Orientation);
}
```

And now enough code to make it pass

```csharp
public void MoveBackward()
{
  if (Orientation == Direction.North) {
    Location=Location.AdjustYBy(-1);
  }
  if (Orientation == Direction.South) {
    Location = Location.AdjustYBy(1);
  }
  Location = Location.AdjustXBy(-1);
}
```

With everything passing again, we can pause to rethink about refactoring but so far so good from my perspective. There are maybe some superficial changes that could be made, but I can’t make a strong enough argument to implement them.

Time to commit and tackle the last requirement!

## Red/Green/Refactor for Rover Facing West

Let’s go ahead and write the final test for when the `Rover` faces West

```csharp
[Test]
public void AndFacingWestThenXIncreasesByOne()
{
  var rover = new Rover { Orientation = Direction.West };
  var initialLocation = rover.Location;

  rover.MoveBackward();

  var expectedLocation = new Coordinate(initialLocation.X + 1, initialLocation.Y);
  Assert.AreEqual(expectedLocation, rover.Location);
  Assert.AreEqual(Direction.West, rover.Orientation);
}
```

And now enough code to make it pass

```csharp
public void MoveBackward()
{
  if (Orientation == Direction.North) {
    Location=Location.AdjustYBy(-1);
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
```

## How Does Rover Look?

With the final test in place, let’s take a look at `Rover` looks like!

```csharp
public class Rover
{
  public Direction Orientation {get; set;}
  public Coordinate Location {get; set;}
  
  public Rover()
  {
    Orientation = Direction.North;
    Location = new Coordinate(){X=0, Y=0};
  }
  
  public void MoveForward()
  {
    if (Orientation == Direction.North) {
      Location = Location.AdjustYBy(1);
    }
    if (Orientation == Direction.South) {
      Location = Location.AdjustYBy(-1);
    }
    if (Direciton == Direction.East) {
      Location = Location.AdjustXBy(1);
    }
    if (Orientation == Direction.West) {
      Location = Location.AdjustXBy(-1);
    }
  }
  
  public void MoveBackward()
  {
    if (Orientation == Direction.North) {
      Location=Location.AdjustYBy(-1);
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
}
```

Overall, `Rover` is looking to be in a good spot, however, one thing that stands out is that `MoveForward` and `MoveBackward` look similar due to their matching `if` statements. When I see duplication like this, I start thinking about how possible refactoring techniques to reduce the duplication. However, it can be tough to see a pattern before it establishes.

## When to Refactor

When it comes to refactoring to a pattern, I like to have three or more examples so I have a better idea of what use cases need to be supported. A common mistake I see developers make is that they start implementing a pattern before really understanding the problem. My approach is to refactor to a pattern when it makes sense and not before.

Circling back to this duplicated ifs, I’ve got a hunch that `TurnLeft` and `TurnRight` will follow a similar approach but I’m curious to know what they’re going to look like and I don’t want to refactor too early. So taking my own advice, I’m going to go ahead and skip refactoring `MoveForward` and `MoveBackward` until I at implement `TurnLeft` as that may change my approach.

## Wrapping Up

Just like that, we now have a `Rover` that knows how to both `MoveForward` and `MoveBackward`! Like before, we first started by examining the requirements and coming up with our various test cases. From there, we were able to drive out the functionality by using red-green-refactor and building our software with tests. In the next post, we’ll take a look at implementing the logic for turning left!