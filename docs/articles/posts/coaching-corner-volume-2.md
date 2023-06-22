---
draft: false
date: 2023-06-22
authors:
  - cameronpresley
description: >
  Cameron's Coaching Corner - How Do I Balance Quality vs Shipping?
categories:
  - Coaching Corner
  - Career
hide:
  - toc
---

# Cameron's Coaching Corner Volume 2

Welcome to Cameron's Coaching Corner, where we answer questions from readers about leadership, career, and software engineering.

In this week's post, we look at how _Chase_ can balance writing the perfect code and shipping something.

!!! quote ""
    My question: As a young developer, I notice that sometimes I get paralyzed by options. I want to write the perfect piece of code. This helps me in writing good code but usually at the cost of efficiency. Especially when I am faced with multiple good options. Sometimes I want to KNOW I’m gonna write the right thing before I’m writing it when I my be better off with some trial and error

    1. Are these common problems that you see people face?
    2. What rules of thumb or other pieces of advice do you have to avoid writing nothing instead of something as a result of seeking the ideal?
    3. How important is planning vs trial and error ("failing fast" as they say) to good software development flow?

<!-- more -->

First, absolutely yes, this is a common occurrence among developers; it's a sign of your style ane current experience, as many developers ask themselves this question. I've worked with developers who were meticulous to a fault, and their code was clean; however, they never shipped because it was never "ready" in their eyes. Therefore, little was gained. 

On the other hand, I've worked with developers who worked at breakneck speed, burning down backlogs and delivering tons of functionality. However, the code would be brittle, and maintaining the work after the fact would be challenging due to the mountain of technical debt.

This topic resonates with me as I was that meticulous developer when I started my career. My early experience was with healthcare companies, where the focus was to get the solution right, even if it look longer. This focus made sense to me, so that I got accustomed to. However, this all changed when I joined a start-up where the focus was to get v1 out and start getting customers.

Upon joining, I met a developer that was quick to implement a solution but would be hard to maintain. However, they were delivering 5-7x more value than I was. To learn how to work at this pace (and honestly, get my rear in gear), I paired up with them. I consider this a pivotal point in my career because they taught me how they could knock out work quickly, and in return, I taught them how to make tweaks to their design that led to more maintainable and testable code. Like iron sharpening iron, we both became better for it.

Let's break down the next two parts - how do we get started, and what's the right mix of planning vs trying it out?

When I'm approaching a problem, I do spend some time planning what I need to do. It might not be long (maybe 10 minutes or less), but I do write down the needed steps. Remember, software is the automation of steps, so if you don't know the steps, how could you possibly automate them?

But what if you don't know how to solve the problem? At this point, I'd prototype and start experimenting. When it comes to R&D, the industry focuses a ton on the "D" (Development) but can forget that **R**esearch is a normal part of the job.

I start with a hypothesis and build the simplest thing that disproves or proves it. When possible, I eliminate or drastically reduce the amount of software to write. For example, I've used Powerpoint to build mock UIs and screen flows because it was something easy to share, and I didn't have to burn a lot of time creating custom CSS and an application over it.

With my hypothesis and plan of what to build, I'm going to take shortcuts and write some of the worst throwaway code imaginable because it's not going to production; it's to get validation of my approach. If my experiment works, then hooray! I can start refactoring and cleaning to get to something better than before. If it fails, then no problem. I can scrap the whole thing and try a different hypothesis.

Another way of thinking about this approach is that we're taking the largest risk/unknown and are building the simplest thing to learn or to mitigate the risk. As we rinse and repeat, we will find a spot where there aren't any major unknowns, and we can continue. Fun fact, this approach is known as [Spiral Driven Development](https://en.wikipedia.org/wiki/Spiral_model) based from the _Spiral Risk Model_.

At the end of the day, we are professionals, we are paid to solve problems, and if shipping software solves the problem, we should do that. At the same time, we need to do right by our client and provide a solution that not only works but is _reasonably_ stable as well. This back-and-forth between quality and speed is not only natural, but healthy.

----

_Do you have a question about leadership, career, or software engineering? Would you like a different perspective on these topics? Drop a line at [CoachingCorner@TheSoftwareMentor.com](mailto:CoachingCorner@TheSoftwareMentor.com) or you can fill out [this form](https://forms.gle/eTqzoUo5hFWrmVKK6)._ 

