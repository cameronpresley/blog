---
draft: false
date: 2020-05-20
authors:
  - cameronpresley
description: >
  Intro to Mars Rover Kata

categories:
  - Learning Through Example

hide:
  - toc
---

# Mars Rover - Defining the Problem

In this installment, we’ll be looking at the problem description for Mars Rover. After becoming more familiar with the problem, we’ll start by identifying the terminology that we should be using when talking about the problem by defining a ubiquitous language. From there, I’ll show you how to break down the problem into various concepts and how to find the relationships between the various pieces. By the end of this post, you should feel comfortable exploring a new domain, understanding the terminology used, and defining relationships.

## Problem Description

Congratulations and welcome to the S.P.A.C.E¹ Institute, good to have you aboard! Our big focus for the year is to develop a rover that can navigate the surface of Mars! While the engineers are working on the design and building of the rover, we can focus on building the navigation module and start iterating on its design. With that in mind, here are a couple of assumptions we’re going to make for this version.

1. The rover will be traveling on a two-dimensional plane that should be modeled as a coordinate (X, Y)
1. The rover is guaranteed to be able to travel in a chosen direction (no worries about obstacles or other landmarks)

Given the above assumptions, here are the business rules that the emulation will need to follow

- When the emulation starts, the rover will always be at (0, 0) and facing North
- There are a series of commands that the rover can receive that can change its location or direction
    - When the rover is told to move forward, then it will move one rover unit in the direction it’s facing
    - When the rover is told to move backward, then it will move rover unit away from the direction it’s facing
    - When the rover is told to turn left, it will rotate 90 degrees to the left, but not change its location
    - When the rover is told to turn right, it will rotate 90 degrees to the right, but not change its location
    - When the emulation is told to quit, the rover will stop receiving commands
- For the emulation, valid directions include North, East, South, and West
- In order to help troubleshoot failures with the emulation, every time a command is received, both the command received, the rover’s location, and the rover’s orientation should be logged.

¹ Simple Programming Application Checks Expertise

---

## Identifying the Domain

When building software, I want to understand the various business terms that are being used to describe the problem so that when I’m talking to subject matter experts (SMEs), I’m using the same terminology as they are. For those who are familiar with _[Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)_, this practice of using the same terminology is known as defining a [ubiquitous language](https://martinfowler.com/bliki/UbiquitousLanguage.html) and the goal is to make sure that when someone says _Command_, then we are all referring to the same concept. If you’ve ever worked in a codebase where something was called one thing, but the business referred to it as something different, then you are familiar with the pain of having to map between the two concepts.

### Find The Nouns

When working to define the ubiquitous language, a common approach is to find the nouns that are being used in the description as this can create the foundation of your classes (if following Object-Oriented principles) or your types (if following Functional Programming principles).

Looking over the description again, these nouns stood out to me:

<figure markdown>
  ![Identifies domain (Rover, Command, Location, Direction, and Orientation)](./images/domain-models.jpg)
  <figcaption>Domain models: Rover, Command, Location, Direction, and Orientation</figcaption>
</figure>

### Find The Relationships

Once the nouns have been found, I’ll pivot to finding out how these different concepts are related to each other. One approach to finding these relationships is using “has-a” and “is-a” relationships. At a high level, if two things are related through “has-a”, then those concepts should be composed together. If two concepts have an “is-a” relationship, then I know that the concepts should be interchangeable for one another.

To help identify these relationships, I would work with the SME to understand what each of these concepts means and how they relate to each other. Since it’ll be a bit hard to simulate a conversation, here’s the information that we would learn from our SME.

- A _Rover_ has a _Location_ and an _Orientation_
- _Orientation_ is the _Direction_ that a _Rover_ is facing
- _Location_ is the coordinates that the _Rover_ is located at
- A _Command_ is something that a _Rover_ receives from the User
- A _Direction_ can be North, East, South, or West
- A _Command_ can be Move Forward, Move Backward, Turn Left,  Turn Right, or Quit

With this new understanding, our concepts and relationships would look something like this:

<figure markdown>
  ![Domain model for Mars Rover](./images/simple-domain-model-relationships.png)
  <figcaption>Domain model relationships where Rover has a Location and an Orientation. Orientation is a Direction and Command is not related to anything.</figcaption>
</figure>

## Wrapping Up

In this post, we explored the problem description for the Mars Rover kata and built up our understanding of the various concepts by exploring the nouns. After finding the nouns, we leveraged “has-a” and “is-a” thinking to come up with a rough idea of how the various concepts related to one another. In the next post, we’ll be focusing on how to model these concepts in code!