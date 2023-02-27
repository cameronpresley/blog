---
draft: false
date: 2015-01-16
authors: 
  - cameronpresley
description: >
  Learning Chain of Responsibility

categories:
  - Today I Learned

hide:
  - toc
---

# Today I Learned – The Chain of Responsibility Design Pattern

> There is nothing new in the world except the history you do not know.
> – Harry S. Truman

The more experience I gain problem solving, the more this holds true. For this post, I’m going to first discuss the problem that I was trying to solve. Next, I’ll show what my first solution was, followed by the shortcomings of this solution. Thirdly, we’ll iterate over a better solution to the problem. This in turn, will provide the motivation for what the Chain of Responsibility is and how to implement. Finally, I’ll wrap up with what the benefits were of using this design. .

## Problem I was trying to solve

As part of the process of installing our software, there are scripts that will update the database from it’s current version to the latest version. As it stands, it needs to be able to upgrade a database from any version to the current version.

### Previous Solution

The first thing that comes to me is that I need to apply database scripts in a sequential way. For example, if the database’s current version is 1.0 and the latest version is 3.0, it would need to apply the script to upgrade the database from 1.0 to 2.0 and then apply the script to upgrade the database from 2.0 to 3.0.

For the first implementation, there were only two versions, 1.0 and 2.0. Since I didn’t want to build in a lot of functionality if it wasn’t needed yet, I created a helper method that returns the correct updater for a given version. In the below code, if the version does not exist, I assume the database does not exist and return the class that will create the database. Otherwise if the version is 1.0, I return a class that is responsible for the upgrading a database from 1.0 to 2.0. If the version is 2.0, I return a class that doesn’t do anything (i.e. there’s no upgrades to be done).

```csharp
public IDatabaseUpdater GetDatabaseUpdater(string version)
{
  if (string.IsNullOrWhiteSpace(version))
    return new DatabaseCreator();
  if (version == "1.0")
    return new Database100To200Updater();
  if (version == "2.0")
    return new CurrentVersionUpdater();
  throw new ArgumentException("The version " + version + " is not supported for database upgrades.");
}
```

### Problem with solution

This solution worked well when there only three possible actions (create a new database, apply the single script, or do nothing). However, we are now going to be shipping version 3.0 and there will need to be a new class that is responsible for upgrading the 2.0 to 3.0. In order to add this functionality, I’d have to do the following:

1. Create the Database200To300Updater class that contained the logic for updating the database from 2.0 to 3.0.
1. Modify the Database100To200Updater class to also use the Database200To300Updater in order to perform the next part of the upgrade.
1. Add additional logic to the above method so that if the database is 2.0 to return the Database200To300Updater class.

After making the modifications, the method now looks like:

```csharp hl_lines="6 8"
public IDatabaseUpdater GetDatabaseUpdater(string version)
{
  if (string.IsNullOrWhiteSpace(version))
    return new DatabaseCreator();
  if (version == "1.0")
    return new Database100To200Updater(new Database200To300Updater());
  if (version == "2.0")
    return new Database200To300Updater();
  if (version == "3.0")
    return new CurrentVersionUpdater();

  throw new ArgumentException("The version " + version + " is not supported for database upgrades.");
}
```


So far, so good, we now have the logic to be able to apply scripts in order, however, now that we’ve added version 3.0, I start to wonder what I would do if we added more versions? After some thought, it would look identical to the previous steps (see below for what would happen if we added version 4.0).

```csharp hl_lines="6 8"
public IDatabaseUpdater GetDatabaseUpdater(string version)
{
  if (string.IsNullOrWhiteSpace(version))
    return new DatabaseCreator();
  if (version == "1.0")
    return new Database100To200Updater(new Database200To300Updater(new Database300To400Updater()));
  if (version == "2.0")
    return new Database200To300Updater(new Database300To400Updater());
  if (version == "3.0")
    return new Database300To400Updater();
  if (version == "4.0")
    return new CurrentVersionUpdater();
  throw new ArgumentException("The version " + version + " is not supported for database upgrades.");
}
```

If we create some variables to hold onto these classes, and reorder the if statements, we can write this helper method as:

```csharp hl_lines="8 9 10"
public IDatabaseUpdater GetDatabaseUpdater(string version)
{
  if (string.IsNullOrWhiteSpace(version))
    return new DatabaseCreator();
  if (version == "4.0")
    return new CurrentVersionUpdater();
  var database300Updater = new Database300To400Updater();
  var database200Updater = new Database200To300Updater(database300To400Updater);
  var database100Updater = new Database100To200Updater(database200To300Updater);

  if (version == "1.0")
    return database100Updater;
  if (version == "2.0")
    return new database200Updater;
  if (version == "3.0")
    return new database300Updater;

  throw new ArgumentException("The version " + version + " is not supported for database upgrades.");
}
```

### Motivation for the Chain of Responsibility
What I find interesting in this design is that I’ve now chained these updater classes together so that if the version 1.0 is returned, it will also use the 2.0 updater, which in turn calls the 3.0 updater. It was at this point, that I remembered a design pattern that followed this structure.

In this design pattern, you essentially have Handlers (in my case updaters) that check to see if they can handle the request. If so, they do and that stops the chain. However, if they can’t handle the request, they pass it to their Successor (which was also a Handler) to handle the request. The design pattern I was thinking about is the [Chain of Responsibility pattern](https://refactoring.guru/design-patterns/chain-of-responsibility).

In order to implement this pattern, you need to have an IHandler interface that exposes a Handle method and either a method or property to set the Successor. The method is the action to take (in our case Update) and the Successor represents the next Handler in the chain if the request could not be handled. The second component is referred to as ConcreteHandlers and they are just the implementors of the interface. One way to implement this is like the following:

```csharp
public interface IHandler
{
  IHandler Successor { get; set; }
  void Update(int version);
}

public class ConcreteHandlerA : IHandler
{
  public IHandler Successor { get; set; }

  public void Update(int version)
  {
    if (CanTheRequestBeHandled) {
      // handle the request
    }
    else {
      Successor.Update(version);
    }
  }
}
```

The main difference between the pattern and what I need is that instead of doing if (canHandle)/else call Successor, what I’m really looking for is to run the upgrade script if the version we’re upgrading to is higher than our current version and then always call the successor. Given this change, here’s what that new implementation looks like:

```csharp hl_lines="11"
public class ConcreteHandlerA : IHandler
{
  public Successor { get; set; }
  public void Update(int version)
  {
    if (CanTheRequestBeHandled) {
      // handle the request
    }
    Successor.Update(version);
  }
}
```

## Implementing the Chain of Responsibility

Now that I know the pattern to use and how it works, I need to update the IDatabaseUpdater interface to follow the IHandler interface. Next, I will need to modify the concrete handlers to use the new interface correctly.

### Implementing the Handler

First, we will update our IDatabaseUpdater interface to follow the IHandler look:

#### Before

```csharp
public interface IDatabaseUpdater
{
  void Update(int version);
}
```

#### After
```csharp
public interface IDatabaseUpdateHandler
{
  void Update(int version);
  IDatabaseUpdateHandler Successor { get; set; }
}
```

### Implementing the Concrete Handler
Second, we will need to update our concrete handlers to implement the interface correctly and to update their UpdateMethod to follow the design. In my case, the concrete handlers perform similar logic, so one of the classes is used for an example.

#### Before
```csharp
public class Database100To200Updater : IDatabaseUpdater
{
  private Database200To300Updater _successor;
  public Database100To200Updater(Database200To300Updater successor)
  {
    if (successor == null)
      throw new ArgumentNullException("successor");
    _successor = successor;
  }

  public void Update()
  {
    Console.WriteLine("Updating the database to version 2.0");
    _successor.Update();
  }
}
```

#### After
Thanks to the public property, I was able to remove the private member and that in turn allowed me to remove the constructor.
```csharp
public class Database100To200Updater : IDatabaseUpdateHandler
{
  public void Update(int version)
  {
    if (version >= 2)
      Console.WriteLine("Updating the database to version 2.0");
    if (Successor != null)
      Successor.Update(version);
  }

  public IDatabaseUpdateHandler Successor { get; set;}
}
```

### Updating the Helper Method

Now that we’ve updated the interface and implementors, it’s time to update the helper method to take advantage of the new design.

```csharp
public IDatabaseUpdateHandler GetDatabaseUpdater(string version)
{
  if (string.IsNullOrWhiteSpace(version))
    return new DatabaseCreator();

  var database300To400 = new Database300To400Updater();
  var database200To300 = new Database200To300Updater();
  var database100To200 = new Database100To200Updater();

  database100To200.Successor = database200To300;
  database200To300.Successor = database300To400;

  return database100To200;
}
```

## Chain of Responsibility is great, here’s why

What I really like about the chain of responsibility pattern is that I was able to connect my upgrade classes together in a consistent fashion. Another reason why I like this pattern is that it forces me to have the logic to determine whether I should run the update or not inside the individual classes instead of the helper method. This produces more readable code which then lends itself to easier maintainability.