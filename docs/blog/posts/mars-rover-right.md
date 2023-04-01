---
draft: false
date: 2020-07-07
authors: 
  - cameronpresley
description: >
  Implementing Turn Right for Rover

categories:
  - Learning Through Example

hide:
  - toc
---

# Mars Rover – Implementing Rover – Turn Right

Welcome to the ninth installment of Learning Through Example – Mars Rover! In this post, we’re going to start driving out the functionality for the Rover and the business rules for turning right! First, we’ll take a look at the requirements to make sure we have an idea of what’s needed. From there, we’ll start implementing the requirements. By the end of this post, we’ll have a Rover that can do perform all of the commands!

## Turning in Place By Turning Right
If we look back at the original [requirements](./mars-rover-definition.md#problem-description) for turning right, we find this single line as the requirement

> When the rover is told to turn right, it will rotate 90 degrees to the right, but not change its location

Given this requirement, we’re able to double-check with our Subject Matter Expert that the `Rover` is essentially rotating in place which yields the following requirements.

- Given the `Rover` is facing `North`, when it turns right, then the `Rover` should be facing `East` at the same `Coordinate`
- Given the `Rover` is facing `East`, when it turns right, then the `Rover` should be facing `South` at the same `Coordinate`
- Given the `Rover` is facing `South`, when it turns right, then the `Rover` should be facing `West` at the same `Coordinate`
- Given the `Rover` is facing `West`, when it turns right, then the `Rover` should be facing `North` at the same `Coordinate`

So far, the requirements are very similar to when we were implementing `TurnLeft`, so let’s see if we can leverage the same setup!

### Red/Green/Refactor For Rover Facing North
Given what we learned when we were implementing the rules for `TurnLeft`, I’m going to go ahead and copy the test and add the single case for when `Rover` faces `North`

```csharp
[Test]
[TestCase(Direction.North, Direction.East, TestName = "AndFacingNorthThenTheRoverFacesEast")]
public void RoverTurningRight(Direction start, Direction expected)
{
  var rover = new Rover { Orientation = start };
  var initialLocation = rover.Location;

  rover.TurnRight();

  Assert.AreEqual(expected, rover.Orientation);
  Assert.AreEqual(initialLocation, rover.Location);
}
```

Since `TurnRight` doesn’t exist, this test will fail so let’s go ahead and write enough code to make it pass. For the implementation, I’m going to go ahead and take advantage of the pattern that we found last time, yielding the following

```csharp
public void TurnRight()
{
  Action ifNorth = () => Orientation = Direction.East;
  Action ifSouth = () => {};
  Action ifEast = () => {};
  Action ifWest = () => {};
  
  Execute(ifNorth, ifSouth, ifEast, ifWest);
}
```

One thing to note is to take a look at how we defined `ifSouth`, `ifEast`, and `ifWest`. Since we’re still wanting to implement one requirement at a time, I’ve defined them to do nothing so that if `Execute` is called, nothing will happen. Alternatively, I could have defined them to throw an exception, but I believe that’s a bit much since we’ll be implementing the functionality soon!

With that implementation, our test passes, so it’s time to go on to the next requirement!

### Rapid Test Creation with TestCase
With a parameterized unit test in place, adding a new test is as simple as adding a new `TestCase` attribute.

```csharp hl_lines="3"
[Test]
[TestCase(Direction.North, Direction.East, TestName = "AndFacingNorthThenTheRoverFacesEast")]
[TestCase(Direction.East, Direction.South, TestName = "AndFacingEastThenTheRoverFacesSouth")]
public void RoverTurningRight(Direction start, Direction expected)
{
  var rover = new Rover { Orientation = start };
  var initialLocation = rover.Location;

  rover.TurnRight();

  Assert.AreEqual(expected, rover.Orientation);
  Assert.AreEqual(initialLocation, rover.Location);
}
```  

And updating `ifEast` action in the `TurnRight` method

```csharp hl_lines="5"
public void TurnRight()
{
  Action ifNorth = () => Orientation = Direction.East;
  Action ifSouth = () => {};
  Action ifEast = () => Orientation = Direction.South;
  Action ifWest = () => {};
  
  Execute(ifNorth, ifSouth, ifEast, ifWest);
}
```

Now that we’ve proven how easy it is to make this change, let’s go ahead and knock out the final two test cases

```csharp hl_lines="4 5"
[Test]
[TestCase(Direction.North, Direction.East, TestName = "AndFacingNorthThenTheRoverFacesEast")]
[TestCase(Direction.East, Direction.South, TestName = "AndFacingEastThenTheRoverFacesSouth")]
[TestCase(Direction.South, Direction.West, TestName = "AndFacingSouthThenTheRoverFacesWest")]
[TestCase(Direction.West, Direction.North, TestName = "AndFacingWestThenTheRoverFacesNorth")]
public void RoverTurningRight(Direction start, Direction expected)
{
  var rover = new Rover { Orientation = start };
  var initialLocation = rover.Location;

  rover.TurnRight();

  Assert.AreEqual(expected, rover.Orientation);
  Assert.AreEqual(initialLocation, rover.Location);
}
```

And implement the code to make those cases pass

```csharp hl_lines="4 6"
public void TurnRight()
{
  Action ifNorth = () => Orientation = Direction.East;
  Action ifSouth = () => Orientation = Direction.West;
  Action ifEast = () => Orientation = Direction.South;
  Action ifWest = () => Orientation = Direction.North;
  
  Execute(ifNorth, ifSouth, ifEast, ifWest);
}
```

Goodness, that was a pretty quick implementation of `TurnRight`! Thanks to our previous refactoring in `Rover` and leveraging parameterized testing, we were able to implement this new feature with a minimal amount of code and the code we did write was focused on the new functionality, not boilerplate.

With that being said, here’s our final version of `Rover`!

```csharp
public class Rover
{
  public Direction Orientation { get; set; }
  public Coordinate Location { get; set; }

  public Rover()
  {
    Orientation = Direction.North;
    Location = new Coordinate();
  }

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

  public void TurnLeft()
  {
    Action ifNorth = () => Orientation = Direction.West;
    Action ifWest = () => Orientation = Direction.South;
    Action ifSouth = () => Orientation = Direction.East;
    Action ifEast = () => Orientation = Direction.North;
    
    Execute(ifNorth, ifSouth, ifEast, ifWest);
  }

  public void TurnRight()
  {
    Action ifNorth = () => Orientation = Direction.East;
    Action ifEast = () => Orientation = Direction.South;
    Action ifSouth = () => Orientation = Direction.West;
    Action ifWest = () => Orientation = Direction.North;

    Execute(ifNorth, ifSouth, ifEast, ifWest);
  }
  
  private void Execute(Action ifNorth, Action ifSouth, Action ifEast, Action ifWest)
  {
    switch(Orientation)
    {
      case Direction.North: ifNorth(); break;
      case Direction.South: ifSouth(); break;
      case Direction.East: ifEast(); break;
      case Direction.West: ifWest(); break;
    }
  }
}
```

## Wrapping Up

With the completion of `TurnRight`, the Rover has finally been implemented with all required pieces of functionality. Through this process, we learned how to write good unit tests, how to refactor unit tests to use parameterized unit testing, and reducing repetition through a SOLID refactor of `if/else` all of which culminating in `TurnRight` being a simple piece of functionality to include. In the next post, we will start working on implementing our logger!