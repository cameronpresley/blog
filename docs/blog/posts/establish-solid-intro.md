---
draft: false
date: 2013-11-04
authors: 
  - cameronpresley
description: >
  Intro to SOLID Design Principles

categories:
  - Basics
  - SOLID

hide:
  - toc
---

If you’ve been working at any dev shop worth its salt, it’s a safe bet that you’ve heard someone mention writing SOLID code or that something isn’t SOLID. Well, what exactly do they mean by SOLID?

As part of this Beginner Basics series, we’re going to first look at what does SOLID mean and why is it so important. For the next five weeks, we’ll explore a different aspect of SOLID by in terms of which principle does each letter represent, some code samples that follow the principle and code samples that break the principle. . As this series progresses, I’ll be adding the code samples to my public Bitbucket account for you to clone (You do know how to use Mercurial and Bitbucket, right?)

## What is SOLID?

In a nutshell, SOLID is a mnemonic created by Michael Feathers to help developers remember the five principles of great code construction introduced by Robert C. Martin (“Uncle Bob”). By following these principles, it’s much more likely that the code designed will be easier to maintain and to extend. As such, SOLID code follow these principles:

**(S)**ingle Responsibly Principle – Every class should do just one thing and do it well
**(O)**pen/Closed Principle – Code should be open for extension, but closed for modifications
**(L)**iskov Substitution Principle – Make sure that two classes that are interchangeable have the same behavior
**(I)**nterface Segregation Principle – Better to use multiple specific interfaces then to use a single general interface
**(D)**ependency Inversion Principle – Code should depend on abstractions, not on concrete classes

## What’s so important about being SOLID?
When building software, its paramount that you have a solid foundation. A common analogy for building software is that it’s like building a house. If the foundation is weak, then code starts becoming stiff, changes become much harder to make and the next thing you know the shower is draining into the kitchen. If your code isn’t SOLID, then it’s going to be harder to add new features/modifications, more difficult to support, and easier to introduce features bugs. As a developer, you should strive to write code that is bug free, easily maintainable, and simple to expand. By following SOLID principles, we can carry out these goals and our code can be SOLID.

## Next Steps
Stay tuned for the next part of the series when we begin exploring the first part of SOLID, the Single Responsibility Principle. Until then, stay sharp, keep learning, and code on.

## Establishing a SOLID Foundation Series

- [Introduction](../posts/establish-solid-intro.md)
- [The Single Responsibility Principle (SRP)](../posts/establish-solid-single.md)
- [The Open/Closed Principle (OCP)](../posts/establish-solid-open.md)
- [The Liskov Substition Principle (LSP)](../posts/establish-solid-liskov.md)
- [The Interface Segregation Principle (ISP)](../posts/establish-solid-interface.md)
- [The Dependency Inversion Principle (DIP)](../posts/establish-solid-dependency.md)

