---
draft: false
date: 2013-11-11
authors: 
  - cameronpresley
description: >
  Exploring Single Responsibility Principle

categories:
  - basics
  - solid

hide:
  - toc
---

# Beginner Basics: Establishing a SOLID Foundation – The Single Responsibility Principle

Welcome to the first installment of Establishing a SOLID Foundation series. In this post, we’ll be exploring the first part of SOLID, the Single Responsibility Principle and how following this principle can lead to great design choices.

## So what is the Single Responsibility Principle?

Before diving into code, let’s take a look at a real life example. Let’s say that we open a new restaurant. Clearly, we need to hire a fantastic head chef to prepare the food. Between these two candidates, which one seems to be the better fit?

- Chef A – spends their time on creating new dishes and preparing the best food possible
- Chef B – spends their time on taking orders, preparing food, and busing tables

_Well that’s easy_, you say, _we should hire Chef A because he’s focusing on cooking. We can hire other people to take orders and clean tables_. It’s pretty obvious that Chef A is the better choice because of the focusing on a single job. So if this is what happens in real life, why is that we see code that is doing way too many things?

For example here’s an example of what the Chef B(efore) class might look like

```ruby
class Chef
  def initialize
    @position = 0
    @order = nil
    @orderReady = false
  end

  def CookFood(order, tableNumber)
    if order == "chicken with broccoli"
      CookChickenWithBroccoli()
      DeliverFood(order, tableNumber)
    end
  end

  def CookChickenWithBroccoli
    @orderReady = true
  end

  def DeliverFood(order, tableNumber)
    GoToTable(tableNumber)
    GiveFood(order)
  end

  def GoToTable(tableNumber)
    @position = tableNumber
  end

  def GiveFood(order)
    puts "Food delivered"
  end

  def BusTables(tableNumber)
    GoToTable(tableNumber);
    CleanTable(tableNumber)
  end

  def CleanTable(tableNumber)
    puts "Table # " + tableNumber.to_s + " cleaned"
  end

  def TakeOrders(tableNumber)
    GoToTable(tableNumber)
    order = AskForOrder()
    return order
  end

  def AskForOrder()
    return "chicken with broccoli"
  end
end
```

with an example implementation usage:

```ruby
tableNumber = 3
chef = Chef.new()
order = chef.TakeOrders(tableNumber)
chef.CookFood(order, tableNumber)
chef.BusTables(tableNumber)
```
As you can tell in the Chef example, there are a lot of methods that need to be defined in order to get the different pieces of main functionality working. If any of these main pieces needed to be changed, we would have to modify the Chef class.

Because of the dependencies, another way to describe the SRP is that the class should only have one reason to change. In this case, the Chef class has three reasons for changing. (Fun fact: when dealing with classes that have a lot of reasons to change, it can be a sign that the class is following the [God-Object](http://en.wikipedia.org/wiki/God_object) anti-pattern.)

## I don’t know, what’s in it for me?
Now that you have a good understanding of the SRP, you might be asking what are some of the benefits of cleaning up your design.

First, classes that only do one job have less dependencies to worry about. Looking back at our code example, it’s clear that the Chef class would have to change if we needed to change the business rules for taking orders, cleaning tables, or for cooking food.

Next, by following the SRP, it’s easier for a team to solve issues. For example. let’s say that you had to fix an error in cleaning the tables and someone else on your team was assigned to update the taking an order scenario. Using the Chef B class definition, the two of you would have to make different changes to the same class.

Finally, by following the SRP, we’re more closely following the idea behind object-oriented design. By definition, we should take complex problems and break them down into their individual actors. Since we define that each class can only have one responsibility, we are ensuring that the problem is being broken down to its smallest pieces.

## Ok, ok, you’ve convinced me, how do I take a busy class and make it simple?
Fortunately, if you have a class that has is doing too many things, there’s a really simple fix. Just create more objects that contain the different pieces.

Using our Chef example, I’m going to separate the responsibilities into two new classes. First, I’m going to move all the methods involved in taking orders to a new Waiter class.

```ruby
class Waiter
  def initialize
    @position = 0
  end

  def DeliverFood(order, tableNumber)
    GoToTable(tableNumber)
    GiveFood(order)
  end

  def GoToTable(tableNumber)
    @position = tableNumber
  end

  def GiveFood(order)
    puts "Food delivered"
  end

  def TakeOrders(tableNumber)
    GoToTable(tableNumber)
    order = AskForOrder()
    return order
  end

  def AskForOrder()
    return "chicken with broccoli"
  end
end
```

Next, I’m going to extract every method needed to bus tables into our new Busboy class:

```ruby
class Busboy
  def initialize
    @position = 0
  end

  def BusTables(tableNumber)
    GoToTable(tableNumber);
    CleanTable(tableNumber)
  end

  def GoToTable(tableNumber)
    @position = tableNumber
  end

  def CleanTable(tableNumber)
    puts "Table # " + tableNumber.to_s + " cleaned"
  end
end
```

Now that we’ve broken up the responsibilities, the next step is to look at some common functionality that classes might share. For example, it looks like the Waiter and Busboy class both use @position and the GoToTable method, so why don’t we create a new class called BaseService

```ruby
class BaseService
  def initialize
    @position = 0
  end
  def GoToTable(tableNumber)
    @position = tableNumber
  end
end
```

and allow both the Waiter and Busboy classes to inherit?

```ruby
class Waiter < BaseService
  def initialize
    super
  end

  def DeliverFood(order, tableNumber)
    GoToTable(tableNumber)
    GiveFood(order)
  end

  def GiveFood(order)
    puts "Food delivered"
  end

  def TakeOrders(tableNumber)
    GoToTable(tableNumber)
    order = AskForOrder()
    return order
  end

  def AskForOrder()
    return "chicken with broccoli"
  end
end

class Busboy < BaseService
  def initialize
    super
  end

  def BusTables(tableNumber)
    GoToTable(tableNumber);
    CleanTable(tableNumber)
  end

  def CleanTable(tableNumber)
    puts "Table # " + tableNumber.to_s + " cleaned"
  end
end
```

Great, we’ve finished refactoring the overly-obsessive Chef from having control on everything in the restaurant to just keep his attention on cooking great food.

```ruby
class Chef
  def initialize
    @orderReady = false
  end

  def CookFood(order, tableNumber)
    if order == "chicken with broccoli"
      CookChickenWithBroccoli()
    end
  end

  def CookChickenWithBroccoli
    @orderReady = true
  end
end
```

Wow, after separating the concerns, our chef class has been massively condensed down to focus on just cooking food, but how do all of these individual classes interact with one another? Does it look like the classes are now focusing on performing one job well?

```ruby
tableNumber = 3
chef = Chef.new()
waiter = Waiter.new()
busboy = Busboy.new()
order = waiter.TakeOrders(tableNumber)
chef.CookFood(order, tableNumber)
waiter.DeliverFood(order, tableNumber)
busboy.BusTables(tableNumber)
```

Something to keep in mind when separating responsibilities is that a single responsibility does not equal a single method. If the methods are all related to performing the same task, then it’s not a violation of the SRP.

## TL;DR
In short, the Single Responsibility Principle (SRP) reinforces the idea that every class should have one job and should do that job well. By following this principle, you’re much more likely to create more readable and maintainable code. When you run across classes that are doing too much, the best solution is to extract the extra functionality into another class. After extraction, don’t forget to refactor and reorganize as needed.

## Establishing a SOLID Foundation Series

- [Introduction](../posts/establish-solid-intro.md)
- [The Single Responsibility Principle (SRP)](../posts/establish-solid-single.md)
- [The Open/Closed Principle (OCP)](../posts/establish-solid-open.md)
- [The Liskov Substitution Principle (LSP)](../posts/establish-solid-liskov.md)
- [The Interface Segregation Principle (ISP)](../posts/establish-solid-interface.md)
- [The Dependency Inversion Principle (DIP)](../posts/establish-solid-dependency.md)