---
draft: false
date: 2025-12-01
authors:
  - cameronpresley
description: >
  Reducing Bugs by Using the Model View Update Pattern

categories:
  - .NET
  - Functional Programming
  
hide:
  - toc
---

# Reducing Bugs by Using the Model View Update Pattern

_Note: This article is part of the [2025 C# Advent Calendar](https://csadvent.christmas/), so after you're done reading this, keep an eye out for the other cool articles coming out this month!_

For those who've followed me for a bit, you know that I'm a big believer that functional programming is a great way of approaching problems.

One thing I've mentioned in my [recent presentations](../../presentations.md#learning-functional-programming-through-construction-first-principles) is that we can take introductory concepts (pure functions, immutability, composition) and build _real world software_ with them.

In this post, I'm going to show you a pattern that I've recently ported to C#, the [Model View Update, also known as The Elm Architecture](https://guide.elm-lang.org/architecture/).

## Inspiration of the Pattern

Back in 2017, I came across a new functional language called [Elm](https://elm-lang.org/) that took a different approach for web development. At a high level, Elm argues that you can think of an application as four pieces.

1. The _Model_ - What data are we presenting to the user?
1. The _View_ - How should we format the model?

At this point, this seems very similar to other MV* patterns ([Model View Controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller), [Model View Presenter](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter), or [Model View ViewModel](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel)). 

The next two parts is what sets this pattern apart from the others.

1. The _Command_ - What things can the user do on the screen (button clicks, entering text, etc...)
1. The _Update_ function - Given a _Model_ and a _Command_, what does the new model look like?

To me, this is an interesting concept because when the user makes changes, the model is being directly manipulated (generally through two-way binding) and then you had to make sure that you didn't put your business rules directly in the UI code. (For those who come from WinForms, how many times did you find business code in the code-behind?).

With this approach, however, we've narrowed down what the UI can do (it can render a model and return a command, but can't directly manipulate the model). 

If you think that this approach isn't solid, you might be surprised to know that Elm inspired the creation of the following libraries in the JavaScript ecosystem:

- [ngrx](https://ngrx.io/) (Angular state management system)
- [redux](https://redux.js.org/) (React state management system)

I've recently been using this pattern for console applications and have been pleasantly surprised how well it's working out.

In this post, I'll walk you through how we can use this pattern to build out the "Hello World" equivalent application, manipulating a counter.

## Implementing the Pattern

### Defining the Command

Before we can model the `Command`, we need to think about what commands we want to support. In our example, let's say that we want the user to be able to do the following:

- Increment the counter by 2
- Decrement the counter by 1
- Reset the counter to 0
- Quit the application


In the Elm version (and it's equivalent TypeScript definition), a `Command` looks something like this:

```ts
type Command = {tag:'increment', value:2} | {tag:'decrement', value:1} | {tag:'reset'} | {tag:'quit'};
```

This takes advantage of algebraic data type  known as a [sum type](./typescript-discriminated-union.md), where the `Command` type has one of three different constructors (one called `increment`, another called `decrement`, one called `reset`, and finally, `quit`). 

Even though C# doesn't have sum types (at least [not yet](https://github.com/dotnet/csharplang/issues/9662)), we can mimic this behavior using an abstract class.

```csharp
// Abstract command that uses a string to
// denote which command it is
// (useful for casting later)
public abstract class Command<T> where T:Enum
{
  public abstract T Tag {get; }
}

```

### Defining Commands for Counter

With the `Command` class defined, let's start implementing the various commands our program can have.

First, we'll define an `enum` to keep track of the types of `Commands`. We could omit this and just use strings, but the value of the `enum` is that we can have C# generate the cases (though we still have to have a default case given the nature of enums).

```csharp
// Enum to help with exhaustive matching later
// on

public enum CommandType
{
  Increment,
  Decrement,
  Reset,
  Quit,
  Unknown
}
```

With the enum defined, we can start define the commands, some of which will have more information included (see the _IncrementCommand_ and _DecrementCommand_).

```csharp

public class IncrementCommand : Command<CommandType>
{
  public override CommandType Tag => CommandType.Increment;

  // Since some of the commands will have custom values and others not, 
  // we can inject those values through the constructor
  public int Value {get; init;}

  public IncrementCommand(int value)
  {
    Value = value;
  }
}

public class DecrementCommand : Command<CommandType>
{
  public override CommandType Tag => CommandType.Decrement;
  public int Value {get; init;}

  public DecrementCommand(int value)
  {
    Value = value;
  }
}

// In other cases, we don't need
// any other info, so we can inherit and implement the Tag property
public class ResetCommand : Command<CommandType>
{
  public override CommandType Tag => CommandType.Reset;
}

public class QuitCommand : Command<CommandType>
{
  public override CommandType Tag => CommandType.Quit;
}

public class UnknownCommand : Command<CommandType>
{
  public override CommandType Tag => CommandType.Unknown;
}
```

### Implementing the Update Function

Now that we have our various commands created, we can start building out the `Update` function. 

From our earlier description, we know that our `Update` function has to take in our model (a number) and a `Command` and then has to return a new model (a number).

```csharp
// This example is a static method, but let's say that the rules were more complicated, 
// we could inject those into a class and make this method non-static.

public static int Update(int number, Command<CommandType> c)
{
  // I'm leveraging the new switch syntax, 
  // but you can use the original syntax
  // without issues

  return c.tag switch => {
    CommandType.Increment => number + ((IncrementCommand)c).Value,
    CommandType.Decrement => number - ((DecrementCommand)c).Value,
    CommandType.Reset => 0,
    // In the case we're told to quit or we
    // get an unknown command, we'll return
    // the model back
    CommandType.Quit => number,
    CommandType.Unknown => number,
    // Since C# doesn't have exhaustive matching, we still require the default case here
    _ => number
  };
}
```

### Implementing the View Function

At this point, we could go ahead and start writing tests to verify that our model is being updated given the command, but our users are going to be interacting with the application, so let's build that out next.

From before, we know that the `View` function takes in the model (a number) and it will return a `Command`. Given that we need to interact with the user, this is an [impure function](https://en.wikipedia.org/wiki/Pure_function#Impure_functions) by design, so we shouldn't put our business rules in here.

```csharp

public static Command<CommandType> View(int model) {
  Console.WriteLine($"Counter: {model}");
  Console.WriteLine("(I)ncrement, (D)ecrement, (R)eset, or (Q)uit");

  return ConvertStringToCommand(Console.ReadLine());
}

// Even though this is called by the View
// function, this is a Pure function
// because it only depends upon a string
// for its logic
private static Command<CommandType> ConvertStringToCommand(string s) {
  return (s ?? "").Trim().ToLower() switch {
    "i" => new IncrementCommand(2), // will increment by 2
    "d" => new DecrementCommand(1), // will decrement by 1
    "r" => new ResetCommand(),
    "q" => new QuitCommand(),
    _ => new UnknownCommand()
  };
}

```

### Wiring Everything Together

Now that we have our Model (a number), the `View` function, an `Update` function, and our list of `Command`s, we can wire everything together.


```csharp

public static class Framework
{
  public static void Run<TModel, TCommandType>(
      Func<TModel, Command<TCommandType>> view,
      Func<TModel, Command<TCommandType>, TModel> update,
      TModel model)
  where TCommandType : Enum
  {
    // We need the Enum to have a Quit option
    // defined, otherwise, we won't know when
    // to quit the application.
    if (!Enum.IsDefined(typeof(TCommandType), "Quit"))
    {
      throw new InvalidOperationException("Command must have a Quit option");
    }
    var quitCommand = Enum.Parse(typeof(TCommandType), "Quit");
    
    // Getting our initial state
    var currentModel = model;
    Command<TCommandType> command;
    
    // While command isn't Quit
    do
    {
      // Clear the screen
      Console.Clear();
      // Get the command from when we render the view
      command = view(currentModel);
      // Get the new model from update
      currentModel = update(currentModel, command);
    } while (!command.Tag.Equals(quitCommand));
  }
}

```

## Final Version

With the `Framework.Run` function defined, we can invoke it via our `Program.cs` file.

You can find the working version below (or you can [clone a copy from GitHub](https://github.com/cameronpresley/csharp-elm-example))

```csharp title="Program.cs"

internal class Program
{
  private static void Main(string[] args)
  {
    var startCounter = 0;
    Framework.Run(View, CounterRules.Update, startCounter);
  }

  public static Command<CommandType> View(int model)
  {
    Console.WriteLine("Counter: " + model);
    Console.WriteLine("Please enter a command:");
    Console.WriteLine("(I)ncrement, (D)ecrement, (R)eset, (Q)uit");
    var input = Console.ReadLine() ?? "";
    return ConvertStringToCommand(input);
  }

  private static Command<CommandType> ConvertStringToCommand(string s) => (s ?? "").ToLower().Trim() switch
  {
    "i" => new IncrementCommand(2),
    "d" => new DecrementCommand(1),
    "r" => new ResetCommand(),
    "q" => new QuitCommand(),
    _ => new UnknownCommand(),
  };
}

```

```csharp title="CounterRules.cs"

public static class CounterRules
{
  public static int Update(int model, Command<CommandType> c)
  {
    return c.Tag switch
    {
      CommandType.Increment => model + (c as IncrementCommand)!.Value,
      CommandType.Decrement => model - (c as DecrementCommand)!.Value,
      CommandType.Reset => 0,
      CommandType.Quit => model,
      CommandType.Unknown => model,
      _ => model
    };
  }
}
```

```csharp title="Commands.cs"

public enum CommandType
{
  Increment,
  Decrement,
  Reset,
  Quit,
  Unknown
}

public class IncrementCommand : Command<CommandType>
{
  public override CommandType Tag => CommandType.Increment;
  public int Value { get; init; }
  public IncrementCommand(int value)
  {
    Value = value;
  }
}

public class DecrementCommand : Command<CommandType>
{
  public override CommandType Tag => CommandType.Decrement;
  public int Value { get; init; }
  public DecrementCommand(int value)
  {
    Value = value;
  }
}

public class ResetCommand : Command<CommandType>
{
  public override CommandType Tag => CommandType.Reset;
}

public sealed class QuitCommand : Command<CommandType>
{
  public override CommandType Tag => CommandType.Quit;
}

public sealed class UnknownCommand : Command<CommandType>
{
  public override CommandType Tag => CommandType.Unknown;
}

```

```csharp title="Framework.cs"

public abstract class Command<T> where T : Enum
{
  public abstract T Tag { get; }
}

public static class Framework
{
  public static void Run<TModel, TCommandType>(
      Func<TModel, Command<TCommandType>> view,
      Func<TModel, Command<TCommandType>, TModel> update,
      TModel model)
  where TCommandType : Enum
  {
    if (!Enum.IsDefined(typeof(TCommandType), "Quit"))
    {
      throw new InvalidOperationException("Command must have a Quit option");
    }
    var quitCommand = Enum.Parse(typeof(TCommandType), "Quit");
    var currentModel = model;
    Console.Clear();
    var command = view(currentModel);
    do
    {
      currentModel = update(currentModel, command);
      Console.Clear();
      command = view(currentModel);
    } while (!command.Tag.Equals(quitCommand));
  }
}

```

## Conclusion

In this post, we built out a basic application using the Model View Update pattern that was first introduced by the Elm language. We also implemented a basic sum type, `Command`, using an abstract class that was then constrained to particular `CommandTypes`.