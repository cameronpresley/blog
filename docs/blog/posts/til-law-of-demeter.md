---
draft: false
date: 2014-12-11
authors: 
  - cameronpresley
description: >
  Law of Demeter

categories:
  - TIL

hide:
  - toc
---

# Today I Learned: The Law of Demeter

Don’t pass in more information that you need. It sounds simple, but when working with messy legacy code, it’s easy to forget.

The impetus for this post came from a peer code review. During the review, I found this method:

```csharp
public IStrategy GetStrategy(Project project, bool isAffected)
{
  var type = project.Type;
  if (type == ProjectType.A && isAffected)
    return new ProjectAIsAffectedStrategy();
  if (type == ProjectType.B)
    return new ProjectBStrategy();
  // Similar if statements
}
```

At first glance, it looks pretty good. Logic was sound and it seemed to be returning a class implementing an interface similar to what we would expect for the Factory pattern. However, there’s a slight problem, can you spot it?

The issue is with the first parameter, Project. The method takes a Project, however, we’re only really depending on the Project’s Type property.

```csharp hl_lines="3"
public IStrategy GetStrategy(Project project, bool isAffected)
{
  var type = project.Type;
  if (type == ProjectType.A && isAffected)
    return new ProjectAIsAffectedStrategy();
  if (type == ProjectType.B)
    return new ProjectBStrategy();
  // Similar if statements
}
```

So why don’t we get rid of the dependency on the Project and instead replace it with the dependency on the ProjectType instead?

```csharp hl_lines="1"
public IStrategy GetStrategy(ProjectType type, bool isAffected)
{
  if (type == ProjectType.A &amp;&amp; isAffected)
    return new ProjectAIsAffectedStrategy();
  if (type == ProjectType.B)
    return new ProjectBStrategy();
  // Similar if statements
}
```

Instinctual, I knew this was the right call, but I couldn’t remember why I knew it was a good choice. After some digging, I remembered that this is a [Law of Demeter](http://en.wikipedia.org/wiki/Law_of_Demeter) violation, or better known as the Principle of Least Knowledge violation.

In general, this principle states that a method should have the least amount of information it needs to do it’s job. Other classic violations of this principle is when you use a class’s internals internals. For example,

```csharp
SomeClassA.SomePropertyB.WithSomeMethodC()
```

One of the reasons that I really like the Law of Demeter is that if you follow it, you create easier to test methods. Don’t believe me? Which is easier to create, the Project class (which may have many dependencies that would need to be stubbed) or the ProjectType enum (which by definition has zero dependencies)?

Another reason that following the Law of Demeter is good practice is that it forces your code to be explicit about what dependencies are required. For example, in the first implementation, the caller knew that the method needed a Project, but had no clue on how much of the Project it needed (does it need all of the properties set? Does it need further setup besides basic instantiation?). However, with the refactored version, now it’s much clearer that the method has a looser dependency on not Project, but just the ProjectType.

