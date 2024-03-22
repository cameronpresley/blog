---
draft: false
date: 2024-03-11
authors:
  - cameronpresley
description: >
  How to Vertical Slice Stories
categories:
  - Leadership
  - Process
hide:
  - toc
---

# Easy as Cake - Why Vertical Slicing Can Help You Be More Effective

## Breaking Work Down as Horizontal Layers

It's a new sprint and your team is tackling a highly requested feature for your product, the ability to setup a User Profile. Everyone is clear on the business requirements as we need the ability to save and retrieve the following information so that we can personalize the application experience for the logged in user:

- Display Name
- Name
- Email Address
- Profile Picture

Going over the high level design with the engineers, it's discovered that there's not a way to save this data right now. In addition, we don't have a way to display this data for the user to enter or modify.

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

## Introducing Vertical Slicing

The main issue with the above approach is that there's a story for each _layer_ of the application (data, business rules, and user interface) and each of these layers are dependent upon each other. However, no one cares about any single layer, they care about all of it working together.

One way to solve this problem would be to have a single story _Implement User Profile_ that has all this work, but that sounds like more than a sprints worth of work to me.

Another way to solve this problem is by taking a little bit of each layer and putting that into the story. If we take that approach, we would have the following stories for our User Profile feature.

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

First, instead of waiting for all the stories to get done before you can demo any functionality, you can demo after getting *one* story completed. This decreases the time in getting feedback and improves your shipping speed.

Second, these stories are independent of each other as the work to  _Implement Display Name_ doesn't depend on anything from _Implement Email_. This increases the autonomy of the team and allows us to shift priorities easier as at the end of any one story, we can pick any of the remaining stories.



##

When it comes to product development, a common piece of advice is to prefer vertical slicing over horizontal layering. The idea is

## Step 1: Does It Even Need to Be a Meeting?

<figure>
<img src="https://images.unsplash.com/photo-1536080805739-84e0c1c2dc2f?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="man looking out window">
<figcaption>
Photo by <a href="https://unsplash.com/@brunocervera">BRUNO CERVERA</a> on <a href="https://unsplash.com/photos/man-in-black-suit-looking-out-from-window-d0hamBoKG90">Unsplash</a>

</figcaption>
</figure>
