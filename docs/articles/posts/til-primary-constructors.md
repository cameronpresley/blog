---
draft: false
date: 2024-05-26
authors:
  - cameronpresley
description: >
  TIL - Primary Constructors

categories:
  - Today I Learned
  - C`#`

hide:
  - toc
---

# Today I Learned - Primary Constructors

I've recently found myself picking up C# again for a project and even though much of my knowledge applies, I recently found the following and it took me a minute to figure out what's up.

Let's say that we're working on the [Mars Rover kata](./mars-rover-intro.md) and we've decided to model the _Rover_ type as a class with three fields: _x, y, and direction_.

My normal approach to this problem would have been the following:

```csharp
public enum Direction
{
  North, South, East, West
}

public class Rover
{
  private int _x;
  private int _y;
  private Direction _direction;

  public Rover(int x, int y, Direction direction)
  {
    _x = x;
    _y = y;
    _direction = Direction;
  }

  public void Print()
  {
    Console.WriteLine($"Rover is at ({_x}, {_y}) facing {_direction}");
  }
}

// Example usage

var rover = new Rover(10, 20, Direction.North);
rover.Print(); // Rover is at (10, 20) facing North

```

However, in the code I was working with, I saw the `Rover` definition as this

```csharp
// note the params at the class line here
public class Rover(int x, int y, Direction direction)
{
  public void Print()
  {
    Console.WriteLine($"Rover is at ({x}, {y}) facing {direction}");
  }
}

// Example Usage
var rover = new Rover(10, 20, Direction.North);
rover.Print(); // Rover is at (10, 20) facing North
```

At first, I thought this was similar to the [record](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record) syntax for holding onto data

```csharp
public record Rover(int X, int Y, Direction Direction);
```

And it turns out, that it is! This feature is known as a [primary constructor](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/instance-constructors#primary-constructors) and when used with classes, it gives you some flexibility on how you want to access those inputs.

For example, in our second implementation of Rover, we're directly using `x`, `y`, and `direction` in  the `Print` method.

However, let's say that we didn't want to use those properties directly (or if we need to set some state based on those inputs), then we could do the following.

```csharp
public class Rover(int x, int y, Direction direction)
{
    private readonly bool _isFacingRightDirection = direction == Direction.North;
    public void Print()
    {
        if (_isFacingRightDirection)
        {
            Console.WriteLine("Rover is facing the correct direction!");
        }
        Console.WriteLine($"Rover is at ({x}, {y}) facing {direction}");
    }
}
```

After playing around this for a bit, I can see how this feature would be beneficial for classes that only store their constructor arguments for later usage.

Even though Records accomplish that better, you can't attach functionality to Records, but you can with classes, so it does provide better organization from that front.

That being said, I'm not 100% sure why we needed to add the primary constructor feature to the language as this now opens up multiple ways of setting up constructors. I'm all for giving developers choices, but this seems ripe for [bike shedding](https://en.wiktionary.org/wiki/bikeshedding) where teams have to decide which approach to stick with.
