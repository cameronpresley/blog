---
draft: false
date: 2020-07-14
authors: 
  - cameronpresley
description: >
  Designing the Logger

categories:
  - Learning Through Example

hide:
  - toc
---

# Mars Rover – Implementing Logger – Design

Welcome to the tenth installment of Learning Through Example – Mars Rover! At this point, we’ve wrapped up all the functionality for the `Rover`, so now it’s time to start implementing the logging requirements. Like always, we’ll first take at the requirements to ensure we’ve got a good idea of what’s needed. From there, we’ll talk about the different approaches for implementation we could take. Finally, we’ll decide on a rough approach for implementation

## What Do We Need?
If we look back at the original [requirements](./mars-rover-definition.md#problem-description) for logging, we find the following

> In order to help troubleshoot failures with the emulation, every time a command is received, both the command received, the rover’s location, and the rover’s orientation should be logged.

### Determining Intent From Vague Requirements

Yep, these requirements are clearly defined, but what’s the problem we’re trying to solve? Why do we care if this happens or not? After talking more with the Subject Matter Expert (SME), it seems like there are two main reasons for the logging requirement. First, they want a way to troubleshoot if something goes wrong in the emulation, and having this trace will be helpful in reproducing the error. Second, they want to have different runs be separated in the logging in the event they need to troubleshoot a specific run.

### Going from Vague to Concrete Requirements
Given the above intent, it sounds like an easy approach we can take is to log all of this information to a file with a specific name. In real production code, you would likely use a logging solution instead of implementing your own, but this will provide a good opportunity to learn some of the System.IO namespace in .NET.

With a rough implementation in mind, we have another discussion with our SME, and come up with the following requirements:

- When the application starts, the user will need to specify where to log the information to (known as the _path_)
- If the _path_ doesn’t exist, the user is informed of such and the application doesn’t continue
- If the _path_ isn’t accessible (maybe due to a permissions issue), then the user is informed of such and the application doesn’t continue
- If the _path_ is valid, then a text file will be created that contains the information generated by the emulator
- Every time the `Rover` receives a command, its `Location` and `Orientation` should be logged

## Software Design Guidelines
Now that we have requirements, how do we want to begin implementation? Do we want to add this logic to the Rover class? Or should we add a new component to handle logging?

### Adding Logging to Rover
So one approach to this problem is to widen the responsibilities for the `Rover`, add a `Log` method and update the existing methods to use this new method. The advantage of this approach is that the logging is in one place so it’s easy to make changes. Another advantage is that since the `Rover` component already exists, we can go ahead and add some new tests pretty quick.

Unfortunately, this approach has two major downsides. First, by widening the responsibilities, we’ll need to update all existing tests to deal with logging (which may not be a trivial change to make). Second, since the `Rover` handles the logging, we’ve muddled our easy-to-test business rules with a [_cross-cutting concern_](https://stackoverflow.com/questions/23700540/cross-cutting-concern-example#answer-25779679) and now the `Rover` would have a couple of different reasons to change. Bummer 🙁

### Writing a New Component
The advantage of writing a new component is that we can focus on making a `Logger` component that just knows how to log any message to storage, regardless of what uses this component. By taking this approach, we can have a “dumb” component (almost not worth testing) and keep the things that we care about (i.e. the business rules) easier to test.

The main downside of this approach is that we have yet another component to manage. In our particular case, that’s alright, but as the codebase becomes larger, this is something to keep in mind.

## Looking at Dependencies
With our rough approach in mind (creating a new component to handle logging), let’s take a look at what this new component is going to need to work as expected. Based on the requirements, the `Logger` will need to know where to log the information to (the path) and what to log (the message). These necessary pieces of information are known as dependencies because the `Logger` won’t work if these are not provided.

When it comes to injecting in a dependency, there are three main approaches, each providing benefits and drawbacks. Let’s take a closer look at these approaches.

### Constructor Injection
First and foremost, constructor injection makes a lot of sense _if the dependency doesn’t change throughout the lifetime of the object_. Let’s say that we have an object that knows how to retrieve records from a database. As part of its work, it will need access to a connection string to connect to the database in question.

```csharp
public class ItemRepository
{
  private readonly string _connectionString;
  
  // By adding the dependency here, there's no way you that
  // an ItemRepository could be created without specifying
  // a connection string.
  public ItemRepository(string connectionString)
  {
    _connectionString = connectionString;
  }
}

// Example usage
// If the connectionString isn't provided, then
// the code doesn't compile!
var itemRepository = new ItemRepository("Data Source=localhost;Initial Catalog=AdventureWorks;Integrated Security=True")
```

Generally speaking, an application doesn’t speak to multiple databases, so the odds of the connection string needing to change during the lifetime of this class is slim. Given that, it makes sense to inject this dependency at the constructor level.

One of the benefits of injecting dependencies at the constructor level is that you’re revealing your intent to other developers. In this case, you’re signaling others “Hey, if you’re going to use this class, you need to specify a connection string, otherwise this isn’t going to work!”

The main downside of this approach is that by adding more parameters to the constructor, you may end up with classes that have a ton of dependencies. However, if you find yourself in that situation, you might have [another problem](./establish-solid-single.md) going on.

### Method Injection
For this approach, method injection makes sense _if the dependency can change during the lifetime of the object_. Let’s say that we have a component that needs a way to send notifications and that the notification mechanism is based on user preferences. For example, if I’m making a purchase, then I want the order confirmation to be emailed to me whereas other customers might want their receipt texted to them.

```csharp
public class PurchaseWorkflow
{
  // By adding the NotificationStrategy here,
  // there's no way that a developer can call 
  // the Complete method without specifying 
  // a way to notify the customer.
  public void Complete(Order order, INotificationStrategy strategy)
  {
    string receiptDetails = CreateReceipt(order);
    strategy.SendNotification(order.Customer, receiptDetails);
  }
}

// Example Usage
var order = new Order("Cameron", 22.50);
var workflow = new PurchaseWorkflow();
// If a NotificationStrategy isn't passed in, this code won't compile.
workflow.Complete(order, new TextNotificationStrategy()); 
```

If we were to use constructor injection, that means that we would need to instantiate a whole new object just because the notification mechanism needed to change which seems a bit excessive for our use case.

Otherwise, method injection has the same main advantage of constructor injection (i.e. revealing design intent) and disadvantage (can lead to a bunch of necessary parameters to pass in)

### Property Injection
Unlike the other two approaches, property injection allows us to set the dependency as a property on the object and then start using the object. Unlike the other two approaches where you have to always specify the dependency, this approach allows you to set the dependency, use the class, then switch out the dependency without having to create a new instance (like constructor injection would force you to) and without having to specify it every time a method was called.

However, the main downside is that you as the developer need to remember to set this property otherwise the code will compile, but you’ll run into a runtime exception. It’s because of this limitation that I’ll avoid this injection technique and stick with either constructor or method level injections.

```csharp
public class PurchaseWorkflow
{
  // By having the notification be set as a property, 
  // developer can set this dependency once and then
  // only change it when needed.
  // However, there's nothing forcing a developer to 
  // set this property.
  public INotificationStrategy NotificationStrategy {get; set;}
  
  public void Complete(Order order)
  {
    string receiptDetails = CreateReceipt(order);
    NotificationStrategy.SendNotification(order.Customer, receiptDetails);
  }
}

// The Mistake
var order = new Order("Cameron", 22.50);
var workflow = new PurchaseWorkflow();
workflow.Complete(order); // This will cause a NullReferenceException to be thrown

// Proper Usage
var order = new Order("Cameron", 22.50);
var workflow = new PurchaseWorkflow();
// As long as you remember to set this property, things should work!
workflow.NotificationStrategy = new TextNotificationStrategy();
workflow.Complete(order);
```

## Designing the Logger
Now that we’ve looked at the various ways we can inject dependencies, we can start coming up with the rough design for `Logger`. Looking back at the requirements, we have two dependencies to worry about (the _path_ and the message to log).

Given that the _path_ is not going to change during a run of the emulator, we should leverage _constructor injection_ for this dependency. For the _message_, since that will be based on the `Rover`'s `Location` and `Orientation` which will change during the emulation, we should leverage _method injection_ for this dependency.

With all of this in place, we now have a much clearer idea of how the `Logger` component is going to look!

## Wrapping Up
In this post, we explored the requirements for logging and why the logging logic should be a separate component due it being a cross-cutting concern. From there, we explored at the three main ways to inject dependencies (constructor, method, and property). With this knowledge, we were able to make some smart decisions on how to inject where to log the information and what to log. In the next pose, we’ll build upon this design by creating the `Logger` component. From there, we were able to make decisions on how to inject the path of where to log and the message to log. In the next post, we’ll start implementing the logic for creating the `Logger` component.