---
draft: false
date: 2023-07-18
authors:
  - cameronpresley
description: >
  Scaling Effectiveness with Docs
categories:
  - Process
hide:
  - toc
---

# Scaling Effectiveness with Docs

As a leader, I'm always looking for ways to help my team to be more efficient. To me, an efficient team is self-sufficient, able to find the information needed to solve their problems.

I've found that having up-to-date documentation is critical for a team because it scales out knowledge in asynchronously, removing the need for manual knowledge transfers.

For example, my team has a wiki that contains information for onboarding into our space, how to complete certain processes (requesting time off, resetting a password), how to run our Agile activities, and our support guidebook. At any point, if someone on the team doesn't know how to do something, they can consult the wiki and find the necessary information.

## Docs. Why Did It Have to Be Docs?

I enjoy up-to-date documentation, but the main problem with them is that they captured the state of the world when they were written, but they don't react to changes. If the process for resetting your password changes, the documentation doesn't auto-update. So unless you're spending time reviewing the docs, they'll grow stale and be worthless, or even worse, mislead others to do the wrong things.

A good mental model for documentation is to think of them as a garden. When planted, it looks great, and everyone enjoys the environment. Over time, weeds will grow, and plants will become overgrown, causing the garden to be less attractive. Eventually, people will stop visiting, and the garden will go into disrepair. To prevent this, we must take care of the garden, removing the weeds and trimming the plants.

<figure markdown>
  ![Outdoor green space](https://images.unsplash.com/photo-1601654253194-260e0b6984f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1999&q=80)
  <figcaption>Photo by Robin Wersich via <a href="https://unsplash.com/photos/Q0IrpWQIMR4">Unsplash.com</a></figcaption>
</figure>

_Alright, I get it, documentation is important, but my team has commitments, so how do we carve out time to review?_

## Cameron Learns About Document Control

I started my career in healthcare, and one of my first jobs was writing software for a medical diagnostic device. We were ISO 9001 certified, and the device was considered a Class II from the FDA. Long story short, this meant that we have to provide documentation for our device and software and also show that we were keeping things up to date.

To comply, we would find docs that hadn't been updated in a specific time period (like 90 days) and review them. If everything checked out, we'd bump up the review date. Otherwise, we'd make the necessary changes and revalidate the document.

At the time, all of our files were in Word, so it wasn't the easiest to search them (I recall that we had Outlook reminders, but this was many moons ago).

By baking this into our process, this helped make our work more visible, which in turn, gave us a better idea of the team's capacity for that sprint.

Thankfully, we have better technology than Word for sharing information, so how can we take this approach and bring it up to the modern day?

## Modern Take on an Old Classic

First, I think that having your docs in source control is a great idea. If you're using tools like Git, you already have a way of leaving comments and keeping track of approvals through pull requests.

To make the most of Git, you should keep your changes in plaintext as it's easy to see the differences. and I enjoy using [Markdown](https://www.markdownguide.org/) and tools like [Mkdocs](https://www.mkdocs.org/) make this workflow possible.

With this figured out, our next step is to know when the file was last reviewed. We can do that by adding a new line to the bottom of each file, _Last Reviewed On: YYYY/MM/DD_. To come up with the initial date, we could use the last time the file was modified (thanks `git log`!).

At this point, we have a way to see the last time the file was reviewed, next step is to write a script that can find files that haven't been reviewed in the last 90 days. At a high level, we'd do the following:

1. Get the latest for the doc repository.
1. Get all the markdown files for the repository.
1. Get the last line of the file.
1. If the line doesn't start with _Last Reviewed On:_, we flag it for review as it's never been reviewed.
1. If the line has a date, but it's older than 90 days, we flag it for review as it might be stale.
1. Print all flagged files to the screen.

With the script created, we could manually run this on Mondays. But we're technical, right? Why not create a scheduled task to execute this script instead? This removes a manual task to be ran and it gives us visibility on what docs need reviewed.

## Wrapping Up

When scaling your knowledge out, having great documentation is necessary as it allows your team to self-serve and work in a more asynchronous manner. The main problem with documentation is that it captures the state of the world when the docs were written, but they don't automatically update when the world changes.

Therefore, we need to have some process to flag and review stale docs. To ensure it gets done, we provide visibility by creating work items and committing to them during the sprint.