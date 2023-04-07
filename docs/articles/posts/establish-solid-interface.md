---
draft: false
date: 2013-12-12
authors: 
  - cameronpresley
description: >
  Exploration of Interface Segregation Principle

categories:
  - Basics
  - SOLID

hide:
  - toc
---

# Beginner Basics: Establishing a SOLID Foundation – The Interface Segregation Principle

Welcome to the fourth installment of Establishing a SOLID Foundation series. In this post, we’ll be exploring the fourth part of SOLID, the Interface Segregation Principle and how by following this principle, you will write more robust code.

## What is the Interface Segregation Principle?
The Interface Segregation Principle (ISP) tell us that clients should not be forced to use an interface that defines methods that it does not use. But what does this mean? Let’s say that we have the following ContactManager class and a ContactFinder class.

```csharp
public class ContactManager
{
     private List _names;

     public ContactManager()
     {
          _names = new List();
          _names.Add("Cameron");
          _names.Add("Geoff");
          _names.Add("Phillip");
     }

     public void PrintNames()
     {
          foreach (var name in _names)
              Console.WriteLine(name);
     }

     public void SetNames(List names)
     {
          foreach (var name in names)
               _names.Add(name);
     }

    public bool DoesNameExist(string name)
    {
         var results = _names.IndexOf(name);
         if (results != -1)
              return true;

         return false;
     }
}

public class ContactFinder
{
     private ContactManager _manager;

     public ContactFinder(ContactManager manager)
     {
         _manager = manager;
     }

     public void FindContacts(List names)
     {
          foreach (var name in names)
          {
               if (_manager.DoesNameExist(name))
                    Console.WriteLine("Found " + name);
               else
                    Console.WriteLine("Couldn't find " + name);
          }
      }
}
```

So far, so good, the ContactManager is responsible for holding onto the list of names and some basic methods and the ContactFinder is responsible for determining which contacts are in our list.

However, there is a problem with this example code. We have this ContactManager class that has a lot methods defined, but the only method that’s required is the DoesNameExist method.

Another concept ISP tells in a roundabout fashion is that objects should depend on interfaces, not concrete classes. This allows us to switch out dependencies much easier when we code to the interface.

## What’s the big deal, I don’t see what the issue is

The big issue that comes up is that it’s hard to figure out what methods that the ContactFinder actually needs. We say that it needs a ContactManager which would lead us to assume that it needs all of those methods. However, that’s not the case. So by violating ISP, it’s easy to make the wrong design decision.

Another issue arises when it comes to creating the interface for the dependency. If we assume that all methods for the ContactManager is required, then any class that implements that interface has to also implement those unneeded methods. How many times have you seen an object implement an interface with a lot of methods that did nothing or just threw exceptions?

```csharp
public interface BloatedInterface
{
     void SetContent();
     bool IsContentSet();
     void RemoveContent(string content);
     void AddContent(string content);
     void ImportantMethod();
}

public class BloatedObject : BloatedInterface
{
     public void SetContent()
     {
     }
     public bool IsContentSet()
     {
          throw new NotImplementedException();
     }
     public void RemoveContent(string content)
     {
          throw new NotImplementedException();
     }
     public void AddContent(string content)
     {
          throw new NotImplementedException();
     }
     public void ImportantMethod()
     {
     }
}
```

## Fixing the issue

_Alright, alright_, I hear you say, _you’ve convinced me, how do I fix this problem?_ The steps are simple:

1. First, you need to identify which methods the client needs
1. Next, you need to create an interface that contains the methods that the client uses
1. After creating the interface, have the dependency implement the interface
1. Finally, change the signature client so that it uses the interface instead of the concrete class

Using our code base, first, we look at the ContactFinder class and see what methods from ContactManager that it uses.

So far, it looks like it only needs the DoesNameExist method. So let’s create an interface, called IContactSearcher that contains the single method.

```csharp
public interface IContactSearcher
{
     bool DoesNameExist(string name);
}
```

Now that we’ve extracted the interface, it’s time to have the ContactManager class implement the interface:

```csharp
public class ContactManager : IContactSearcher
{
     private List _names;

     public ContactManager()
     {
          _names = new List();
          _names.Add("Cameron");
          _names.Add("Geoff");
          _names.Add("Phillip");
     }

     public void PrintNames()
     {
          foreach (var name in _names)
          Console.WriteLine(name);
     }

     public void SetNames(List names)
     {
          foreach (var name in names)
               _names.Add(name);
     }

     public bool DoesNameExist(string name)
     {
          var results = _names.IndexOf(name);
          if (results != -1)
               return true;

          return false;
     }
}
```

Finally, we update the references in ContactFinder to use the IContactSearcher interface instead of the concrete class ContactManager.

```csharp
public class ContactFinder
{
     private IContactSearcher _searcher;

     public ContactFinder(IContactSearcher searcher)
     {
         _searcher = searcher;
     }

     public void FindContacts(List names)
     {
          foreach (var name in names)
          {
               if (_searcher.DoesNameExist(name))
                    Console.WriteLine("Found " + name);
               else
                    Console.WriteLine("Couldn't find " + name);
          }
     }
}
```

With this last step, we’ve now resolved the ISP violation.

## TL;DR

In summary, the Interface Segregation Principle (ISP) tells us that we should interfaces instead of concrete classes for our dependencies and that we should use the smallest interface for our client to work. If we don’t follow these rules, then it’s easy to create bloated interfaces that clutter up readability. In order to resolve violations, we need to determine what methods our client require and code an interface to contains those methods. Finally, we have our class implement those methods and pass it to the client. By following the ISP, we reduce the complexity required by our code and reduce the coupling between client and dependency. As always, don’t forget to refactor as you go along.

## Establishing a SOLID Foundation Series

- [Introduction](../posts/establish-solid-intro.md)
- [The Single Responsibility Principle (SRP)](../posts/establish-solid-single.md)
- [The Open/Closed Principle (OCP)](../posts/establish-solid-open.md)
- [The Liskov Substitution Principle (LSP)](../posts/establish-solid-liskov.md)
- [The Interface Segregation Principle (ISP)](../posts/establish-solid-interface.md)
- [The Dependency Inversion Principle (DIP)](../posts/establish-solid-dependency.md)