---
draft: false
date: 2014-01-07
authors: 
  - cameronpresley
description: >
  Exploration of Dependency Inversion Principle

categories:
  - Basics
  - SOLID

hide:
  - toc
---

# Beginner Basics: Establishing a SOLID Foundation – The Dependency Inversion Principle

Welcome to the final installment of Establishing a SOLID Foundation series. In this post, we’ll be exploring the fifth part of SOLID, the Dependency Inversion Principle.

## What is the Dependency Inversion Principle?

When working with object-oriented languages, we take large problems and break them down into smaller pieces. These smaller pieces in turn are broken down into even smaller, more manageable pieces to work on. As part of the breaking down process, we inherently have to introduce dependencies between the larger pieces and the smaller pieces.

How we weave these dependencies together is the difference between easily changing behavior and spending the next week pulling your hair out.

When working with classes, dependencies are usually introduced by constructing them in the class that they’re used in. For example, let’s say that we’ve been asked to write an utility that emulates an calculator but it also keeps a transaction log for record keeping purposes.

```ruby
class Logger
  def log (content)
    File.open("C:\\temp\\results.txt", 'a') {|f| f.write(content)}
  end
end

class Calculator
  def initialize
      @logger = Logger.new()
  end
  def add (a, b)
      log(a, b, "+")
      return a + b
  end
  def sub (a, b)
      log(a, b, "-")
      return a - b
  end
  def mult (a, b)
      log(a,b,"*")
      return a * b
  end
  def div (a, b)
      log(a,b,"/")
      return a.to_f / b
  end

  def log(a, b, sym)
      text = a.to_s + " " + sym + " " + b.to_s + " = "
      if sym == "+"
            text += (a + b).to_s
      elsif sym == "-"
            text += (a-b).to_s
      elsif sym == "*"
            text += (a*b).to_s
      else
            text += (a.to_f/b).to_s
      end
      text += "\n"
      @logger.log(text)
  end
end

# Usage
calc = Calculator.new()
puts calc.add(4,3)
puts calc.sub(2,1)
puts calc.mult(100,2)
puts calc.div(5,2)
```

So far so good, we have two classes (Logger and Calculator) that is responsible for logging and the calculations. Even though this is a small amount of code (~50 lines for both classes), there are three dependencies in the code. The first dependency that I notice is that Calculator depends on Logger. We can see this by looking at the initialize method for Calculator (as hinted above):

```ruby
class Calculator
  def initialize
    @logger = Logger.new("C:\\temp\\results.txt")
  end
end
```

The second dependency is a bit trickier to find, but in the Logger class’ log method, we use a hard coded file path.

```ruby
class Logger
  def log (content)
      File.open("C:\\temp\\results.txt", 'a') {|f| f.write(content)}
  end
end
```

The third dependency is probably the hardest to find, but in the the Logger class’ log method, we are also depending on the file system for the machine by using Ruby’s File class. _But wait a minute_, I hear you say, _why is the File class considered a dependency, that’s a part of the Ruby language?_ I agree with you, but it’s still a dependency in the code and something that we should keep in mind.

From these three dependencies, we’re going to focus on resolving the first two. We could make resolve the dependency on the file system, but it would take so much effort for so little gain.

## Why don’t we resolve the file dependency issue?

One thing that I keep in mind when identifying which dependencies to invert is to focus on inverting dependencies outside of the framework. In this case, we’re going to ignore the file system dependency because I, the programmer, depend on Ruby to behave correctly. If Ruby stops working, then a broken file system is the least of my worries. Therefore, it’s not worth the effort to resolve.

### Making the Calculator and Logger more flexible

In order to resolve these DIP violations, we need to expose ways to drop in these dependencies. There are two ways of doing this. We can either:

- Expose the dependency via the constructor
- Expose the dependency via a public property

Using the Calculator example, we can expose the logger dependency via the constructor and we can expose the filePath dependency by exposing it as a property.

For the Calculator class, I’m going to first change the initialize method so that it takes a logger instead of constructing it’s own.

```ruby
class Calculator
  def initialize(logger)
    @logger = logger
  end
end
```

Next, I will construct the logger in the usage and pass the logger as part of the constructor.

```ruby
# Usage
logger = Logger.new()
calc = Calculator.new(logger)
```

A quick run of our program tells us that everything is still working correctly.

Now that we’ve finished up exposing the logger dependency, it’s time to expose the file path. First, I’m going to add a public property on the Logger class call filePath and use that property in the log method

```ruby
class Logger
  def log (content)
      File.open(filePath, 'a') {|f| f.write(content)}
  end
  attr_accessor :filePath
end
```

Now that we’ve introduced a seam for the file path dependency, we use that seam in the program and assign the property```ruby

```ruby
# Usage
logger = Logger.new()
logger.filePath = "C:\\temp\\results.txt"
calc = Calculator.new(logger)
```

## Multiple ways of solving the issue, which one is best?

When using the constructor method, it’s very clear to see what dependencies the class has, just look at the constructor. However, adding a new dependency to the constructor may cause other code to fail because the signature of the constructor has changed. This in turn can lead to cascading changes where multiple places of code need to be updated to pass in the dependency.

On the other hand, using the property method, the change is less invasive because the property can be set independently of the when the object was constructed. However, it’s harder to see the dependencies for the class because now the properties are containing the dependencies. Also, it’s very easy to forget to set a property before using the object.

Both of these methods are valid, but when I’m working with DIP, I prefer to expose the dependencies via the constructor because if my class starts to gain more and more dependencies, then it’s a sign that my class is doing too much and violating the Single Responsibility Principle (SRP). You can say that DIP is the canary in the coal mine for SRP.

## TL;DR
In summary, the Dependency Inversion Principle (DIP) tells us that we should we should have the outside world pass in our dependencies. If we don’t follow this rule, then we will not. In order to resolve violations, we need to determine what dependencies we have and modify our constructor to accept those dependencies. If our constructor becomes too large, then our class might be violating the Single Responsibility Principle. By following the DIP, we expose the dependencies our classes require and allows for greater decoupling. As always, don’t forget to refactor as you go along.

## Establishing a SOLID Foundation Series

- [Introduction](../posts/establish-solid-intro.md)
- [The Single Responsibility Principle (SRP)](../posts/establish-solid-single.md)
- [The Open/Closed Principle (OCP)](../posts/establish-solid-open.md)
- [The Liskov Substitution Principle (LSP)](../posts/establish-solid-liskov.md)
- [The Interface Segregation Principle (ISP)](../posts/establish-solid-interface.md)
- [The Dependency Inversion Principle (DIP)](../posts/establish-solid-dependency.md)