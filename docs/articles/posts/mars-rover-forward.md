---
draft: false
date: 2020-06-09
authors:
  - cameronpresley
description: >
  Implementing Moving Forward for Rover

categories:
  - Learning Through Example

hide:
  - toc
---

# Mars Rover – Implementing Rover : Moving Forward

Welcome to the fifth installment of Learning Through Example – Mars Rover! In this post, we’ll pick up from where we left on with `Rover` and start digging into how to make it move forward! We’ll first examine what it means for the `Rover` to move forward by looking over the requirements in deeper detail. Once we have a better understanding, we’ll start driving out the functionality by focusing on a simple case and building more complexity. By the end of this post, we’ll have a `Rover` that will know how to move forward when facing any `Direction`!

## So What Does It Mean To Move Forward?

If we look back at the original [requirements](./mars-rover-definition.md#problem-description) for moving forward, we find this single line with regards to moving forward

> When the rover is told to move forward, then it will move one rover unit in the direction it’s facing

Super helpful, right? I don’t know about you, but this not nearly enough information for us to start our work because I’m not sure what that actually means!

In this case, we will have a more in-depth conversation with our Subject Matter Expert and we’ll find out that depending on the `Orientation` of the `Rover` the `Rover`‘s `Location` will change. Through additional conversations, we end up figuring out some more concrete business rules for when the `Rover` moves forward.

- Given the `Rover` is facing North, when it moves forward, then its `Y` value increases by 1
- Given the `Rover` is facing South, when it moves forward, then its `Y` value decreases by 1
- Given the `Rover` is facing East, when it moves forward, then its `X` value increases by 1
- Given the `Rover` is facing East, when it moves forward, then its `X` value decreases by 1

Great, we have enough information to get started so we can start demonstrating the software and get quicker feedback!

## Writing The First Test

Let’s begin writing our first test for the `Rover` moving forward! We’ll be leveraging the same naming guidelines mentioned in [part three](./mars-rover-testing.md) to help make the use cases standout in our tests

```csharp
[Test]
public void AndFacingNorthThenYIncreasesByOne()
{
  // Arrange
  var rover = new Rover() { Orientation = Direction.North};

  // Act
  rover.MoveForward();

  // Assert
  Assert.AreEqual(1, rover.Coordinate.Y);
}
```

So far, so good! The test matches the intent behind the name and a new developer can see that we’ve created a `Rover` facing `North`, called its `MoveForward` method and making sure that the `Y` property is 1.

If we try running the test, it will fail because `Rover` doesn’t have a `MoveForward` method, so let’s go ahead and write a simple implementation.

```csharp
public void MoveForward()
{
}
```

Even though there’s no business logic implemented, it’s enough code for our test to compile and if we run the test, the test fails because `Y` is not 1.

With that in mind, let’s go ahead and write the simplest thing that could work just to check our approach.

```csharp
public void MoveForward()
{
  Location.Y+=1;
}
```

Hmm, when we try to compile this code though, we get the following error

<figure markdown>
  ![Compiler error when trying to update the Location's Y property)](https://softwarementorblog.blob.core.windows.net/images/mars-rover-struct-problem.png)
  <figcaption>Compiler error when trying to update the Location's Y Property</figcaption>
</figure>

What’s going on here?

## When Things Go Off Track
The error is caused due to the interaction of `struct` and the `Location` property implementation. If you recall, `struct`s are value types which means when you assign them to a variable, the variable has its own _copy_ of the `struct`, not the _reference_.

```csharp
// Let's create a location
var location = new Coordinate {X = 0, Y = 0};

// And now let's have newLocation have the same value, NOTE: This isn't a reference to location!
var newLocation = location;

// And if we check if both are equal, they are!
Console.WriteLine(location.Equals(newLocation)); // True

// Now let's change location's X value
location.X = 200;

// That works just fine, but if we check what newLocation is, we see that it's stil (0, 0)
Console.WriteLine($"newLocation = ({newLocation.X}, {newLocation.Y})");

// Which means when we compare, they're not the same!
Console.WriteLine(location.Equals(newLocation)); // False
```

So what does that have to do with the `Location` property? Well, we’ve defined it as an auto-property which is syntactic sugar for telling the compiler to generate a backing field for the property and to implement default `get` and `set` logic.

```csharp
// Given this definition of Rover
public class Rover
{
  public Coordinate Location {get; set}
}

// This is syntactic sugar for the following
public class Rover
{
  private Coordinate _location;
  public Coordinate Location
  {
    get => _location;
    set => _location = value;
  }
}
```

So the problem arises from how `get` is working. It’s returning the backing field which is going to be stored as a variable for use. Recall from above that when we do that type of assignment, we’re working on a copy of the value. So if we try to make changes to the copy, the changes won’t make it back to the backing field which in turn won’t ever update the `Location` property!

## Getting Back On Track
So good job on the compiler letting us know that there’s a problem even if the message is a bit obscure! But how do we fix the problem? Well, to get the code to compile, instead of updating the `Y` property of `Location`, let’s go ahead and update the entire `Location` property instead.

```csharp
public void MoveForward()
{
  Location = new Coordinate { X = Location.X, Y = Location.Y + 1 };
}
```

And if we try to run our test, we find that it now passes, hooray!

## Refactoring The Code

For those keeping track at home, we’re doing a pretty good job of following Test Drive Development (TDD) principles in that we first _wrote a failing test_, then _wrote enough code to make it pass_. The third step is to _refactor our code_ (both production and test) to make it easier to work with or to make it more robust.

If we take a look at the `MoveForward` method, it’s pretty simple and there’s not much we can refactor there for now.

```csharp
public void MoveForward()
{
  Location = new Coordinate { X = Location.X, Y = Location.Y + 1 };
}
```

## Is Our State Correct?
So if our business code is pretty good, let’s take a look at our test and see what can be done.

```csharp
[Test]
public void AndFacingNorthThenYIncreasesByOne()
{
  // Arrange
  var rover = new Rover() { Orientation = Direction.North};

  // Act
  rover.MoveForward();

  // Assert
  Assert.AreEqual(1, rover.Coordinate.Y);
}
```

Looking at this code, one thing that stands out is that we’re checking that `Y` got updated, but we’re not verifying that `X` nor the `Orientation` didn’t change. In fact, if we change the implementation of `MoveForward` to set the X value to be 200 and change the `Orientation` to be `South`, the test would still pass and it clearly shouldn’t!

Thankfully, we can mediate this oversight by creating an `expectedLocation` which will have the expected `X` and `Y` values for the Rover. In addition, we’ll update one `Assert` to use this new value and add another `Assert` to verify the `Orientation`

```csharp
[Test]
public void AndFacingNorthThenYIncreasesByOne()
{
  // Arrange
  var rover = new Rover {Orientation = Direction.North};

  // Act
  rover.MoveForward();

  // Assert
  var expectedLocation = new Coordinate { X = 0, Y = 1};
  Assert.AreEqual(expectedLocation, rover.Location);
  Assert.AreEqual(Direction.North, rover.Orientation);
}
```

Nice! We’re now much more explicit about our expectations of `Rover` should be at this _exact_ `Location` and should have this _exact_ `Orientation`, otherwise, fail the test.

## Are There Hidden Assumptions?
While looking at this test, there’s one more subtle issue with code, can you spot it?

We’re making an assumption about what the initial `Location` for the `Rover`! What if the `Rover` started off at (5, 5) instead of (0, 0)? This test would fail, but not for the right reason (an error in the production code), but due to fragility in the way the test was written.

If we wanted to harden this test, we have two approaches

### Setting the Location

We could change our `Arrange` step to explicitly set the initial location of `Rover` to be (0, 0). This would guarantee the initial setup and if the default `Location` were to ever change, our test would still pass.

```csharp hl_lines="8"
[Test]
public void AndFacingNorthThenYIncreasesByOne()
{
  // Arrange
  var rover = new Rover
  {
    Orientation = Direction.North,
    Location = new Coordinate {X = 0, Y = 0},
  };

  // Act
  rover.MoveForward();

  // Assert
  var expectedLocation = new Coordinate { X = 0, Y = 1};
  Assert.AreEqual(expectedLocation, rover.Location);
  Assert.AreEqual(Direction.North, rover.Orientation);
}
```

### Capturing the Initial Location

When we look at this test and the code we’re testing, the key thing that we’re wanting to test is that the right value was modified correctly (in this case either by +1 or -1). Given that, we could update our `Arrange` step to capture what the initial `Location` was and then update our `Assert` step to know about the location.

```csharp hl_lines="6 12"
[Test]
public void AndFacingNorthThenYIncreasesByOne()
{
  // Arrange
  var rover = new Rover {Orientation = Direction.North};
  var initialLocation = rover.Location; // capturing the initial location

  // Act
  rover.MoveForward();

  // Assert
  var expectedLocation = new Coordinate { X = initialLocation.X, Y = initialLocation.Y+1};
  Assert.AreEqual(expectedLocation, rover.Location);
  Assert.AreEqual(Direction.North, rover.Orientation);
}
```

Given the two approaches, I like the idea of capturing the initial location, so that’s what I’m going to go with.

# Writing Additional Tests
Now that we have a passing test for `Rover` and moving forward, let’s go ahead and implement another piece of functionality by writing a test for when the `Rover` is facing `South`

### Red/Green/Refactor for Rover Facing South

```csharp
[Test]
public void AndFacingSouthThenYDecreasesByOne()
{
  // Arrange
  var rover = new Rover {Orientation = Direction.South};
  var initialLocation = rover.Location; // capturing the inital location

  // Act
  rover.MoveForward();

  // Assert
  var expectedLocation = new Coordinate { X = initialLocation.X, Y = initialLocation.Y-1};
  Assert.AreEqual(expectedLocation, rover.Location);
  Assert.AreEqual(Direction.South, rover.Orientation);
}
```

And write enough code to make it pass!

```csharp
public void MoveForward()
{
  if (Orientation == Direction.North) {
    Location = new Coordinate { X = Location.X, Y = Location.Y + 1 };
  }
  else {
    Location = new Coordinate { X = Location.X, Y = Location.Y - 1};
  }
}
```

Now that we have a passing test suite again, is there anything we want to refactor? Are there any patterns starting to emerge?

From the business code, `MoveForward` seems pretty straightforward and I’m not sure what refactor I could do there that would make a lot of sense right now.

If we take a look at the test code, I’m noticing that our two tests so far look almost like carbon copies of each other. In fact, if we take a closer look, it seems like the only differences between the two tests are the `Rover`‘s `Orientation` and the `expectedLocation`. I’m really tempted to refactor this code to be a bit more [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) and remove some duplication. However, I’ve only seen two examples so far and before I refactor to a pattern, I actually want the pattern to manifest first so I know what the pattern is.

Let’s keep writing some more tests and see what pattern emerges!

### Red/Green/Refactor for Rover Facing East

Now that the `Rover` can move forward when facing `North` or `South`, let’s go ahead and write a test for when the `Rover` faces East.

```csharp
  [Test]
  public void AndFacingEastThenXIncreasesByOne()
  {
    // Arrange
    var rover = new Rover {Orientation = Direction.East};
    var initialLocation = rover.Location;

    // Act
    rover.MoveForward();

    // Assert
    var expectedLocation = new Coordinate { X = initialLocation.X+1, Y = initialLocation.Y};
    Assert.AreEqual(expectedLocation, rover.Location);
    Assert.AreEqual(Direction.East, rover.Orientation);
  }
```

With the test in place, let’s write enough code to make it pass.

```csharp
public void MoveForward()
{
  if (Orientation == Direction.North) {
    Location = new Coordinate { X = Location.X, Y = Location.Y + 1 };
  }
  if (Orientation == Direction.South) {
    Location = new Coordinate { X = Location.X, Y = Location.Y - 1};
  }
  if (Direction == Direction.East) {
    Location = new Coordinate {X = Location.X + 1, Y = Location.Y};
  }
}
```

With this passing test, let’s take a look at possible refactoring opportunities.

#### Refactoring Coordinate

If we look at the production code, I’m getting really tired of having to write `Location = new Coordinate {X=Location.X..., Y=Location.Y...}` because I know I’m going to have to write this similar logic for the last remaining test for moving forward and probably something similar for moving backward.

Looking at the way we’ve been modifying `Coordinate`, it seems like we’re every modifying `X` or `Y` by a set amount, so what if we wrote some methods that could adjust either `X` or `Y`?

If we take a look at `Coordinate`, it seems like we have a struct with the two properties in mention, so let’s add a method called `AdjustXBy` that will return a new `Coordinate` with `X` adjusted by that value and keep `Y` the same

```csharp hl_lines="6 7 8 9 10"
public struct Coordinate
{
  public int X {get; set;}
  public int Y {get; set;}

  public Coordinate AdjustXBy(int adjustment)
  {
    return new Coordinate {X = X+adjustment, Y=Y};
  }
```

With this change in place, let’s go ahead and update our `MoveForward` method to use this new code!

```csharp hl_lines="10"
public void MoveForward()
{
  if (Orientation == Direction.North) {
    Location = new Coordinate { X = Location.X, Y = Location.Y + 1 };
  }
  if (Orientation == Direction.South) {
    Location = new Coordinate { X = Location.X, Y = Location.Y - 1};
  }
  if (Direction == Direction.East) {
    Location = Location.AdjustXBy(1);
  }
}
```

Even in this small example, this addition is already more concise of our intent than the other two cases. After doing a quick verification that the test still passes (otherwise the refactor isn’t a refactor), let’s go ahead and add a new method to `Coordinate` called `AdjustYBy` that is similar to `AdjustXBy`

```csharp
  public Coordinate AdjustYBy(int adjustment)
  {
    return new Coordinate {X=X, Y=Y+adjustment};
  }
```

And let’s go ahead and update `MoveForward` to take advantage of this new functionality

```csharp hl_lines="4 7"
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
}
```

After making that much change to the production code, we’ll go ahead and run our test suite again and it seems like the change is working as expected, nice!

#### Refactoring Test Code

Now that we’ve refactored the business rules and our test suite is passing correctly, we can take a look at refactoring our test code. With the addition of the `East` test, the tests are definitely following a pattern and I should be able to extract out that logic to a [single test and then pass in different parameters](https://github.com/nunit/docs/wiki/TestCaseData) (even though the link is to NUnit, most test frameworks support this concept).

```csharp hl_lines="5 12"
  [Test]
  public void AndFacingNorthThenYIncreasesByOne()
  {
    // Arrange
    var rover = new Rover {Orientation = Direction.North};
    var initialLocation = rover.Location; // capturing the inital location

    // Act
    rover.MoveForward();

    // Assert
    var expectedLocation = new Coordinate { X = initialLocation.X, Y = initialLocation.Y+1};
    Assert.AreEqual(expectedLocation, rover.Location);
    Assert.AreEqual(Direction.North, rover.Orientation);
  }
```

```csharp hl_lines="5 12"
[Test]
public void AndFacingSouthThenYDecreasesByOne()
{
  // Arrange
  var rover = new Rover {Orientation = Direction.South};
  var initialLocation = rover.Location; // capturing the inital location

  // Act
  rover.MoveForward();

  // Assert
  var expectedLocation = new Coordinate { X = initialLocation.X, Y = initialLocation.Y-1};
  Assert.AreEqual(expectedLocation, rover.Location);
  Assert.AreEqual(Direction.South, rover.Orientation);
}
```

```csharp hl_lines="5 12"
[Test]
public void AndFacingEastThenXIncreasesByOne()
{
  // Arrange
  var rover = new Rover {Orientation = Direction.East};
  var initialLocation = rover.Location;

  // Act
  rover.MoveForward();

  // Assert
  var expectedLocation = new Coordinate { X = initialLocation.X+1, Y = initialLocation.Y};
  Assert.AreEqual(expectedLocation, rover.Location);
  Assert.AreEqual(Direction.East, rover.Orientation);
}
```

Given the differences between the tests, we would need to extract the starting `Direction` and the `expectedLocation` to be parameters. However, the `expectedLocation` is based on the initialLocation which is currently based on whatever the `Rover` defaults to.

Based on that chain, if we wanted to do this refactor, we would have to pass in a `Rover` as the parameter and I really don’t like that idea because if `Rover` grows to be bigger, then creating a `Rover` becomes more involved and I don’t want to inflict that onto my test. In addition, one thing that is nice about our tests is that they’re easy to read and to follow their logic which has a ton of value given that developers spend more time reading code than writing code.

All of that to say, that even though the tests look similar, I’m going to pass on refactoring to a single unified test because I’d be trading readability for removing duplication and these tests are small enough that I don’t think it’s that much technical debt to take on.

### Red/Green/Refactor for Rover Facing West

With the latest test, we’re 3/4 of the way through implementing `MoveForward`, so let’s go ahead and write another failing test for when the `Rover` faces `West`.

```csharp
[Test]
public void AndFacingWestThenXDecreasesByOne()
{
  // Arrange
  var rover = new Rover {Orientation = Direction.West};
  var initialLocation = rover.Location;

  // Act
  rover.MoveForward();

  // Assert
  var expectedLocation = new Coordinate { X = initialLocation.X-1, Y = initialLocation.Y};
  Assert.AreEqual(expectedLocation, rover.Location);
  Assert.AreEqual(Direction.West, rover.Orientation);
}
```

With the test in places, let’s write enough code to make the test pass by taking advantage of `Coordinate.AdjustXBy`

```csharp
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
```

And with this latest addition, not only do we have a passing test suite, but we’ve also covered the business rules for when the `Rover` moves forward, completing this part of the kata, nice!

As a recap, here’s what `Rover` and `WhenMovingForward` looks like

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
}
```

```csharp
[TestFixture]
public class WhenMovingForward()
{
  [Test]
  public void AndFacingNorthThenYIncreasesByOne()
  {
    // Arrange
    var rover = new Rover {Orientation = Direction.North};
    var initialLocation = rover.Location;

    // Act
    rover.MoveForward();

    // Assert
    var expectedLocation = new Coordinate { X = initialLocation.X, Y = initialLocation.Y+1};
    Assert.AreEqual(expectedLocation, rover.Location);
    Assert.AreEqual(Direction.North, rover.Orientation);
  }

  [Test]
  public void AndFacingSouthThenYDecreasesByOne()
  {
    // Arrange
    var rover = new Rover {Orientation = Direction.South};
    var initialLocation = rover.Location;

    // Act
    rover.MoveForward();

    // Assert
    var expectedLocation = new Coordinate { X = initialLocation.X, Y = initialLocation.Y-1};
    Assert.AreEqual(expectedLocation, rover.Location);
    Assert.AreEqual(Direction.South, rover.Orientation);
  }

  [Test]
  public void AndFacingEastThenXIncreasesByOne()
  {
    // Arrange
    var rover = new Rover {Orientation = Direction.East};
    var initialLocation = rover.Location;

    // Act
    rover.MoveForward();

    // Assert
    var expectedLocation = new Coordinate { X = initialLocation.X+1, Y = initialLocation.Y};
    Assert.AreEqual(expectedLocation, rover.Location);
    Assert.AreEqual(Direction.East, rover.Orientation);
  }


  [Test]
  public void AndFacingWestThenXDecreasesByOne()
  {
    // Arrange
    var rover = new Rover {Orientation = Direction.West};
    var initialLocation = rover.Location;

    // Act
    rover.MoveForward();

    // Assert
    var expectedLocation = new Coordinate { X = initialLocation.X-1, Y = initialLocation.Y};
    Assert.AreEqual(expectedLocation, rover.Location);
    Assert.AreEqual(Direction.West, rover.Orientation);
  }
}
```

## Wrapping Up

With this final test in place, we have the core functionality for when the `Rover` moves forward. In addition, we’ve written enough tests and functionality now that if requirements were to change, we have a pretty good guess on what the work involved would be. In the next part of the kata, we’ll start implementing a new piece of functionality!