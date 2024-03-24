---
draft: false
date: 2024-03-26
authors:
  - cameronpresley
description: >
  Using Vertical Slicing To Minimize Dependencies and Deliver Value Faster
categories:
  - Leadership
  - Process
hide:
  - toc
---

# How Using Vertical Slicing Can Minimize Dependencies and Deliver Value Faster

_How do we break down this work?_

It's a good question and it can help set the tone for the project. Assuming the work is more than a bug fix, it's natural to look at a big project and break it down to smaller, more approachable pieces.

Depending on how you break down the work, you can dramatically change the timeline from when you can get feedback from your users and find issues much sooner.

In this post, let's look at a team breaking down a new feature for their popular application, TakeItEasy.

## A New Day - A New Feature

It's a new sprint and your team is tackling a highly requested feature for TakeItEasy, the ability to setup a User Profile. Everyone is clear on the business requirements as we need the ability to save and retrieve the following information so that we can personalize the application experience for the logged in user:

- Display Name
- Name
- Email Address
- Profile Picture

Going over the high level design with the engineers, it's discovered that there's not a way to save this data right now. In addition, we don't have a way to display this data for the user to enter or modify.

## Breaking Work Down as Horizontal Layers

Working with the team, the feature gets broken down as the following stories:

- Create the data storage
- Create the data access layer
- Create the User Profile screen

Once these stories are done, this feature is done and that seems easy enough. As you talk with the team though, a few things stand-out to you.

1. None of these stories are fully independent of each other. You can build out the User Profile screen, but without the Data Access Layer, it's incomplete. Same thing with the data access layer, it can't be fully complete until the data storage story is done.

1. It's difficult to demo the majority of the stories. Stakeholders don't care about data storage or the data access layer, but they do care about the user setting up their profile. With the current approach, it's not possible to demo any work until all three stories are done.

As you approach each story, they seem to be quite large:

1. For the Data Storage work, it's an upgrade script to modify the Users table with nullable columns.
1. For the data access story, it's updating logic to retrieve each of the additional fields and making sure to handle missing values from the database.
1. For the User Profile screen, it's creating a new page, update the routing, and adding multiple controls with validation logic for each of the new fields.

Is there a different way we can approach this work such that we can deliver something useful sooner?

## Breaking Down the Work as Vertical Slices

The main issue with the above approach is that there's a story for each _layer_ of the application (data, business rules, and user interface) and each of these layers are dependent upon each other. However, no one cares about any single layer, they care about all of it working together.

<figure>
<img src="https://images.unsplash.com/photo-1464219222984-216ebffaaf85?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Two People Eating Nachos">
<figcaption>
Seriously, could you imagine enjoying a plate of nachos by first eating all the chips, then the beans, then the salsa?
</figcaption>
<figcaption>
Photo by <a href="https://unsplash.com/@hero">Herson Rodriguez</a> on <a href="https://unsplash.com/photos/taco-on-plate-aZOqcEK2KuQ">Unsplash</a>
</figcaption>
</figure>

One way to solve this problem would be to have a single story _Implement User Profile_ that has all this work, but that sounds like more than a sprints worth of work. We know that that the more work in a story, the harder it is to give a fair estimate for what's needed.

Another approach to solve this problem is by changing the way we _slice_ the work by taking a bit of each layer into a story. This means that we'll have a little bit of database, little bit of data access, and little bit of the user interface.

If we take this approach, we would have the following stories for our User Profile feature.

**Feature: Implement User Profile**

- _Story: Implement Display Name_
- _Story: Implement Name_
- _Story: Implement Email_
- _Story: Implement Profile Picture_

Each story would have the following tasks:

- Add storage for field
- Update data access to store/retrieve field
- Update interface with control and validation logic

There are quite a few advantages with this approach.

First, instead of waiting for all the stories to get done before you can demo any functionality, you can demo after getting _one_ story completed. This is huge advantage because if things are looking well, you could could potentially go live with _one_ story instead of waiting for all three stories from before.

Second, these stories are independent of each other as the work to _Implement Display Name_ doesn't depend on anything from _Implement Email_. This increases the autonomy of the team and allows us to shift priorities easier as at the end of any one story, we can pick any of the remaining stories.

For example, let's say that after talking more with customers, we need a way for them to add their favorite dessert. Instead of the business bringing in the new requirement and pushing back the timeline, engineering can work on that functionality next and get that shipped sooner.

Third, it's much easier to explain to engineers and stakeholders for when a certain piece of functionality will be available. Going back to horizontal layering, it's not clear when a user would be able to set-up their email address. Now, it's clear when that work is coming up.

## Why The Horizontally Slicing?

I'm going to let you on a little secret. Most engineers are technically strong, but can be ignorant of the business domain that they're solving in. Unless you're taking time to coach them on the business (or if they've been working in the domain for a long period of time), engineers just don't know the business.

As such, it's difficult for engineers to speak in the _ubiquitous_ language of the business, it's much easier to speak in the technical details. This, in turn, leads to user stories that are more technical details in nature (modify table, build service, update pipeline) instead of user focused (can set display name, can set email address).

If you're an Engineer, you need to learn the business domain that you're working in. This will help you prevent problems from happening in your software because it _literally_ can't do that. In addition, this will help you see the bigger picture and build empathy with your users as you understand them better.

If you're in Product or Business, you need to work with your team to level up their business domain. This can be done by having them use the product like a user, giving them example tasks, and spending time to talk about the domain. If you can get the engineers to be hands-on, every hour you invest here is going to pay huge dividends when it comes time to pick up the next feature.

## Wrapping Up

The next time you and the team have a feature, try experimenting with vertically slicing your stories and see how that changes the dynamics of the team.

To get started, remember, focus on the user outcomes and make sure that each story can stand independently of one another.

If this post resonated with you, I'd like to hear from you! Feel free to drop me a line at <a href="mailto:coachingcorner@thesoftwarementor.com?subject=Vertical Slicing">CoachingCorner@TheSoftwareMentor.com</a>!
