---
draft: false
date: 2013-11-18
authors: 
  - cameronpresley
description: >
  Exploration of Open/Closed Principle

categories:
  - Basics
  - SOLID

hide:
  - toc
---

# Beginner Basics: Establishing a SOLID Foundation - The Open/Closed Principle

Welcome to the second installment of Establishing a SOLID Foundation series. In this post, we’ll be exploring the second part of SOLID, the Open/Closed Principle and how following this principle can lead to great design choices.

So what is the Open/Closed Principle?
In order to set the context for discussion, let’s revisit our last example of the Chef class:

```ruby
class Chef
  def CookFood(order, tableNumber)
    if order == "chicken with broccoli"
      CookChickenWithBroccoli()
    end
  end
    
  def CookChickenWithBroccoli
    puts "Cooked chicken with broccoli"
  end
end
```

So it looks like this Chef is pretty simple, it only has one public method of CookFood and he can only cook ChickenWithBroccoli. However, a Chef that can only cook one thing isn’t very useful. So how about we add some more menu items?

```ruby

class Chef
  def CookFood (order)
    if order == "chicken with broccoli"
      CookChickenWithBroccoli()
    elsif order == "steak with potatoes"
      CookSteakWithPotatoes()
    elsif order == "pork with apples"
      CookPorkWithApples()
    else
      puts "Don't know how to cook " + order
    end
  end
    
  def CookChickenWithBroccoli
    puts "Cooked chicken with broccoli"
  end
    
  def CookSteakWithPotatoes
    puts "Cooked steak with potatoes"
  end
    
  def CookPorkWithApples
    puts "Cooked pork with apples"
  end
end

```

So our new Chef can cook more food, but the code base expanded quite a bit. In order to add more menu choices, we need to add an additional if check in CookFood and to define a new method for CookFood to call. This might not sound like a lot of work because each of these Cook* methods just print something to the screen. However, what if the steps to create each food item were much more complex?

```ruby
def CookChickenWithBroccoli
  CookChicken()
  CookBroccoli()
end
    
def CookChicken
  print "Cooked chicken "
end
    
def CookBroccoli
  puts "with broccoli"
end
```

Also, what if we modified how the CookChickenWithBroccoli method worked? We would need to modify the Chef class, but that doesn’t make sense. In the real world, we would modify the recipe and the Chef would then follow the new recipe. This concept that we would have to modify an unrelated object in order to add new functionality is the inspiration for the Open/Closed Principle.

In short, the Open/Closed Principle means that an object should be **Open** for extension, but **Closed** for modification. This principle relies on the idea that new functionality is added by creating new classes, not by modifying pre-existing classes’ behavior. By doing this, we’re decreasing the chances of breaking current functionality and increasing code stability.

## This sounds good, but is it worth the additional design time?

Now that we’ve discussed the Open/Closed Principle, you might be wondering what some of the benefits are of cleaning up this design.

First, classes that follow the Open/Closed Principle are small and focused in nature playing off the idea of the Single Responsibility Principle. Looking back at our Chef class, it’s very clear that by adding new functionality, Chef is going to be handling way too many things.

Next, by following OCP, there won’t be multiple classes modified just to add new functionality. There’s nothing like a change set containing tons of modified files to make even the most experienced developer shudder in fear.

By definition of OCP, we won’t be modifying a lot of files (ideally only one file should be modified) and we’re adding new classes. Since we’re adding in these new classes, we inherently have the opportunity to bake in testing.

## Alright, I get it OCP is awesome, but how do I refactor the Chef class?

In order to fix the violation, we’re going to take each menu item and make them into their own class

```ruby
class ChickenWithBroccoli
  def initialize
    @name = "Chicken with Broccoli"
  end
    
  def Cook
    CookChicken()
    CookBroccoli()
  end
    
  def CookChicken
    print "Cooked chicken "
  end
    
  def CookBroccoli
    puts "with broccoli"
  end
end

class SteakWithPotatoes
  def initialize
    @name = "Steak with Potatoes"
  end
    
  def Cook
    CookSteak()
    CookPotatoes()
  end
    
  def CookSteak
    print "Cooked steak "
  end
    
  def CookPotatoes
    puts "with potatoes"
  end
end

class PorkWithApples
  def initialize
    @name = "Pork with Apples"
  end
    
  def Cook
    CookPork()
    CookApples()
  end
    
  def CookPork
    print "Cooked pork "
  end
    
  def CookApples
    puts "with apples"
  end
 end
```

Now that we have these different classes, we need to come up with some way for our Chef to interact with them. So why don’t we organize these menu items into a Recipes class?

```ruby
class Recipes
  def initialize
      @recipes = {}
      @recipes[:chicken] = ChickenWithBroccoli.new()
      @recipes[:steak] = SteakWithPotatoes.new()
      @recipes[:pork] = PorkWithApples.new()
  end
  
  def MakeOrder(order)
      recipe = nil
      if order == "chicken with broccoli"
          recipe = @recipes[:chicken]
      elsif order == "steak with potatoes"
          recipe = @recipes[:steak]
      elsif order == "pork with apples"
          recipe = @recipes[:pork]
      end
      if recipe == nil
          puts "Can't cook " + order
      else
          recipe.Cook()
      end
  end
end
```

Now we have this Recipes class that contains all of the menu items for our Chef to use. When adding new menu items to Recipes, all we have to add is the class in the initialize method and add an additional if check in the MakeOrder method. _But hold on_, I hear you say, _This is the same as what we had with the Chef at the beginning, why is this design better?_ Before, we would have to modify the Chef in order to add more menu items which doesn’t really make sense, now we’ve moved that logic to Recipes which makes sense that it needs to be modified if a new menu item is added.

On the topic of our Chef, after cleaning up to use the Recipes class, our Chef is simpler and relies on Recipes for the menu items, not itself:

```ruby
class Chef
  def initialize
    @recipes = Recipes.new()
  end

  def CookFood (order)
    @recipes.MakeOrder(order)
  end
end
```

Now that we’ve fixed the violation, let’s go ahead and refactor some. Looking at the menu choices, it’s pretty clear that we can abstract the behavior to a base class called MenuItem for them all to share (_Note: By defining Cook by raising an exception, I’m forcing all classes to provide their own implementation_).

```ruby
class MenuItem
  def initialize(name)
      @name = name
  end
  
  def Cook
      raise "This should be overridden in child class"
  end
end

```

Also, as part of this refactoring, we’re going to move some of the strings into constants as part of the RecipeNames module so that the Chef and Recipes can communicate with one another:

```ruby
module RecipeNames
  ChickenWithBroccoli = "Chicken with Broccoli"
  SteakWithPotatoes = "Steak with Potatoes"
  PorkWithApples = "Pork with Apples"
end
```

With these additions, let’s update the menu choices to use the module and the MenuItem base class:

```ruby
class ChickenWithBroccoli < MenuItem
  def initialize
      super(RecipeNames::ChickenWithBroccoli)
  end
  
  def Cook
      CookChicken()
      CookBroccoli()
  end
  
  def CookChicken
      print "Cooked chicken "
  end
  
  def CookBroccoli
      puts "with broccoli"
  end
end

class SteakWithPotatoes < MenuItem
  def initialize
      super(RecipeNames::SteakWithPotatoes)
  end
  
  def Cook
      CookSteak()
      CookPotatoes()
  end
  
  def CookSteak
      print "Cooked steak "
  end
  
  def CookPotatoes
      puts "with potatoes"
  end
end

class PorkWithApples < MenuItem
  def initialize
      super(RecipeNames::PorkWithApples)
  end
  
  def Cook
      CookPork()
      CookApples()
  end
  
  def CookPork
      print "Cooked pork "
  end
  
  def CookApples
      puts "with apples"
  end
 end
```

With these changes, we need to update the Recipes class to use the RecipeNames module:

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

With this current layout, if we needed to add another menu item (let’s say Fish and Chips), we would need to:

1. Create a new class that extends MenuItem called FishAndChips
1. Add another string constant to RecipeNames
1. Add another line in the Recipes initialize method to add it to the array

## TL;DR
In short, the Open/Closed Principle (OCP) reinforces the idea that every class should be open for extension and closed to modifications. By following this principle, you’re much more likely to create separated code that allows you to increase functionality and decrease the odds of breaking current functionality. If you run across a class that is doing way too much, use the Single Responsibility Principle to separate the classes and then use a new object that serves as the middle man. In our case, the Recipes class was the middle man between the Chef and the different menu items. As always, don’t forget to refactor and reorganize your code as needed.

## Establishing a SOLID Foundation Series

- [Introduction](../posts/establish-solid-intro.md)
- [The Single Responsibility Principle (SRP)](../posts/establish-solid-single.md)
- [The Open/Closed Principle (OCP)](../posts/establish-solid-open.md)
- [The Liskov Substitution Principle (LSP)](../posts/establish-solid-liskov.md)
- [The Interface Segregation Principle (ISP)](../posts/establish-solid-interface.md)
- [The Dependency Inversion Principle (DIP)](../posts/establish-solid-dependency.md)