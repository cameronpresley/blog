---
draft: false
date: 2023-06-13
authors:
  - cameronpresley
description: >
  Five Minutes at Five Guys - When Metrics Conflict with UX
categories:
  - Process
hide:
  - toc
---

# Five Minutes at Five Guys - When Metrics Conflict with UX

In a [recent post](../posts/pitfall-of-single-data.md), I spoke about the flaw of using a single metric to tell the story and how [Goodhart's Law](https://en.wikipedia.org/wiki/Goodhart%27s_law#Generalization) tells us that once we start measuring a metric, it stops being a useful metric.

Let's look at a real-world example with the popular fast food chain, Five Guys.

## All I Wanted Was a Burger

Five Guys is known for making good burgers and delivering a mountain of piping hot fries as part of your order. Seriously, an order of small fries is a mountain of spuds. Five Guys make their fries to order, so they're not sitting around under a heat lamp.

![Yo Dawg, I heard you wanted fries, so I put fries in your fries](https://softwarementorblog.blob.core.windows.net/images/five-guys/fries-with-fries.jpg){width="500"}

This approach works great when ordering in person, but what happens if you order online? The process is essentially the same, the crew works on the burgers, but they won't start the fries until you're at the restaurant, so they're always guaranteeing that you get fresh made fries.

At this point, it's clear that receiving a mountain of hot, cooked-to-order fries is part of the experience and what customers expect, right?

<!-- more -->

## In the Name Of Progress

I recently ordered Five Guys online, and after placing the order, I got a link to a new feature, the ability to let the restaurant know when you're on the way over.

_Oh, that's cool. I bet it gives the kitchen a better time of when to start cooking the burger, so that it's not sitting around._

From a process perspective, I see this making sense as Lean Manufacturing tells us to minimize inventory (in this case, the amount of food waiting to be picked up) and it helps prioritize the kitchen.

Curious, I click the button to let them know I'm on the way and start heading over there.

## Crash Course In Restaurant Metrics

After arriving, I notice that the interface has changed, and I now have an option of letting them know I'm there.

_Hmmm, interesting. I'm not sure what this does, but I'm here, so I'll click it._

I click the button and start heading inside. And this is where the story gets interesting.

It's a slow day, so I'm talking to one of the cooks as the fries are being made and we start chatting about the new system.

For those who've never worked fast food you might be surprised to know that employees and managers are graded on various metrics. For example, how long does it take an order to get made? Or how long is someone waiting in the drive-through?

For Five Guys, they have a metric for online orders and time. In this case, a customer should not wait more than five minutes from when they arrive to when they have received their food.

As a customer, I like the sound of this as it means I'm not waiting around all day, and the food will be hot, though I have no clue how realistic this metric is.

But here's the question - how do you determine someone's arrival time? For in-person orders, this is easy as it's the time the order is placed. But what about online pick-up orders?

It turns out that once you click the _I'm Here_ button, that starts the timer. And herein lies the issue. There's nothing in the interface that tells me that I should click on that button once I'm inside, only when I'm here.

So when I clicked the button while sitting in my car, it put the kitchen in a weird spot because they don't see anyone there to pick up the food. Should they start cooking the fries in the hopes that I show up? Or should they wait until I'm physically there? What if I had clicked the button by mistake? What if there was a software bug?

## When Metrics Conflict With User Experience, Which Should Win?

There's no good answer because there's waste in this process, whether it's product (e.g., cold fries that would need to be replaced) or time (e.g., me waiting or the kitchen cooking again).

There's another motivation at stake here as well, bonuses. Remember the metrics that I mentioned before? Managers (and sometimes employees) receive bonuses for achieving performance goals. But what happens when the company has implemented a vague process (like the above)? It rewards the wrong behavior (getting the food out) instead of keeping the experience good (receiving hot fries).

Here's one more wrinkle. Now that I know the button controls when the fries start cooking, why shouldn't I hit the button when I'm five minutes away? That way when, I show up, the fries are done, and I have zero minutes of wait. This, in turn now changes consumer behavior, which feeds back into the process.

## Revisiting the Feature

Let's revisit this new piece of functionality, letting the kitchen know when you're on the way and when you arrive. Is it helpful? Did it make my experience any better? Am I more likely to order from there again?

Honestly, not really. I already enjoy the food, but I don't think letting the kitchen know when I'm on the way helps them very much (remember, I already get an estimated time from when I placed the order). The ability to let them know when I'm here doesn't make the process any faster for me, and it causes confusion for the kitchen.

For those who have social anxiety or other issues speaking with others, I could see how something like this might be helpful. We could change the approach by adding a kiosk in the restaurant where they could enter their order number or email address which lets the kitchen know that they're here to pick up their food.

## Wrapping Up

So what's the lesson learned here? It's reasonable to use metrics to give you a _general_ idea of your business and process. However, when we start implementing processes to improve metrics, we need to keep in mind the customer experience and really ask _Does this truly help our customers? Or does this just make the numbers happy?_