---
draft: false
date: 2013-11-29
authors: 
  - cameronpresley
description: >
  Exploration of Liskov Substitution Principle

categories:
  - Basics
  - SOLID

hide:
  - toc
---

# Beginner Basics: Establishing a SOLID Foundation – The Liskov Substitution Principle

Welcome to the third installment of Establishing a SOLID Foundation series. In this post, we’ll be exploring the third part of SOLID, the Liskov Substitution Principle and how following this principle can lead to loose coupling of your code.

## So what is the Liskov Substitution Principle?
Before diving into the Liskov Substitution Principle (LSP), let’s look at a code example demonstrating the violation.

Let’s say that we have a Rectangle class:

```ruby
# A Rectangle can have height and width
# set to any value
class Rectangle
  def height=(height)
      @height = height
  end
  def width=(width)
      @width = width
  end
  def height
      @height
  end
  def width
      @width
  end
  def area
      height * width
  end
end
```

If we run the following implementation, it’s pretty clear that it works like we would expect:

```ruby
rect = Rectangle.new
rect.height = 5
rect.height = 6
puts rect.area # => 30
```

Seems pretty simple, we have a Rectangle class with two public properties, height and width and the class behaves the way we would expect.

Now let’s add a new class, called Square. Since all Squares are also Rectangles, it makes sense that the Square class should inherit from the Rectangle class. However, since Squares have to maintain the same height and width, we need to add some additional logic for that:

```ruby
# A Square must maintain the same height and width
class Square < Rectangle
  def height=(height)
      @height = height
      @width = height
  end
  def width=(width)
      @width = width
      @height = width
  end
end
```

Using a Square instead of a Rectangle and running the same input, we get the following output:

```ruby
square = Square.new
square.height = 10
square.width = 5
puts square.area # => 25
```

Hold up, why is the area 25? If I read this code, then the height should be 10 and the width should be 5, giving an area of 50. This is no longer the case because of the domain constraint caused by the Square class. By using a Square where the code expected a Rectangle, we get different behavior then we would expect. This is the heart of the Liskov Substitution Principle.

In short, the Liskov Substitution Principle states that if we have an object (Rectangle) in our code and it works correctly, then we should be able to use any sub-type (Square) without the results being modified.

The most common example of LSP violations are when the “is-a” phrase from Object-Oriented Design break down. In the Rectangle-Square example, we say that a Square “is-a” Rectangle which is true. However, when we covert that relationship to code and use inheritance, the relationship does not hold up.

I don’t know, this sounds confusing, what’s the point?
To me, the Liskov Substitution Principle is the hardest part of SOLID to understand. It’s [heavy on the theoretical](http://en.wikipedia.org/wiki/Liskov_substitution_principle#Principle) and it’s not blatantly obvious when a violation has occurred until testing.

However, there are plenty of benefits of following LSP.

First, following LSP reduces the tight coupling involved in your code. Let’s look back at our Recipes class from the [Open/Closed Principle post](establish-solid-open.md) and examine the MakeOrder method:

```ruby
class Recipes
     def initialize
          @recipes = {}
          @recipes[RecipeNames::ChickenWithBroccoli] = ChickenWithBroccoli.new()
          @recipes[RecipeNames::SteakWithPotatoes] = SteakWithPotatoes.new()
          @recipes[RecipeNames::PorkWithApples] = PorkWithApples.new()
     end
     def MakeOrder(order)
          recipe = @recipes[order]
          if recipe == nil
               puts "Can't cook " + order
          else
               recipe.Cook()
          end
     end
end
```

In this class, you see that we load different recipes and when one’s requested, we call the Cook method. We don’t have to do any set-up, special handling, or other logic, we just trust that the Cook method for whatever recipe we choose works as expected. By following this design, code will be easier to read and to maintain.

Going back to our Square/Rectangle example, if we wanted a method that would return a new Square or Rectangle, it would have to look something like this:

```ruby
def CreateShape(classType, height, width)
     shape = nil
     if classType == "Rectangle"
          shape = Rectangle.new
          shape.height = height
          shape.width = width
     else
          shape = Square.new
          shape.height = height
     end
     return shape
end
```

This code works, but there is one major problem. When someone is looking at this code, they’re going to get confused of why the Rectangle and Square are setup differently.

For example, when I see that the Square’s height is being set, but not the width, my first thought is that this is a bug. Then, I’d have to look into the Square’s class definition and then I’d see the logic of where setting the height also sets the width.

Long story short, by identifying and resolving LSP violations, we can make the code easier to read and maintain.

## So it looks like LSP is pretty useful, but how do I fix violations?
Now that we’ve talked about spotting LSP violations and why it’s important to follow LSP, let’s discuss how to fix the violations.

To be honest, fixing a LSP violation is not easy. Since the nature of the problem is caused by a broken abstraction, discarding the abstraction is the best option. However, if you absolutely need to use the abstraction, then one solution is to remove the method that causes the violation.

In the Square/Rectangle example, we would remove the setters for height and width from our Rectangle class because that is how the violation can occur. After removing the setters, we need to modify the initialize method of Square to only take one parameter, size, and send that twice to the Rectangle class. Now, our classes look something like this:

```ruby
# A Rectangle can have height and width
# set to any value
class Rectangle
  def initialize(height, width)
      @height = height
      @width = width
  end
  def height
      @height
  end
  def width
      @width
  end
  def area
      height * width
  end
end

# A Square must maintain the same height and width
class Square < Rectangle
  def initialize(size)
      super(size, size)
  end
end

```

With sample implementation and output

```ruby
rect = Rectangle.new(10, 5)
puts rect.area # => 50

square = Square.new(5)
puts square.area # => 25
```

## TL;DR
In short, the Liskov Substitution Principle (LSP) enforces the idea that if a class has a sub-type (through inheritance or interfaces), then by passing the sub-type, the program should still produce the same results. If you run across a class that violates LSP, then you know that your abstraction is not complete and you can either

- Remove the offending methods/properties or
- Abandon the abstraction

As always, don’t forget to refactor and reorganize your code as needed.

## Establishing a SOLID Foundation Series

- [Introduction](../posts/establish-solid-intro.md)
- [The Single Responsibility Principle (SRP)](../posts/establish-solid-single.md)
- [The Open/Closed Principle (OCP)](../posts/establish-solid-open.md)
- [The Liskov Substitution Principle (LSP)](../posts/establish-solid-liskov.md)
- [The Interface Segregation Principle (ISP)](../posts/establish-solid-interface.md)
- [The Dependency Inversion Principle (DIP)](../posts/establish-solid-dependency.md)