---
draft: false
date: 2023-04-23
authors:
  - cameronpresley
description: >
  Keeping Track - Task Tracking Approach

categories:
  - Process

hide:
  - toc
---

# Keeping Track - My Task Tracking Approach

When it comes to keeping track of things to do, I recall an ill-fated attempt at using a planner. My middle school introduced these planners for the students that you had to use to keep track of dates (and, weirdly enough, as a hall pass to go to the bathroom).

Looking back, the intent was to have the students be more organized, but that wasn't what I learned. I found it cumbersome and a pain to keep track of. Also, you had to pay to replace it if it was lost or stolen.

What I learned to do instead was to keep track of everything I needed to do in my memory, and if I forgot, well, I had to pay the penalty.

I recall seeing my peers in high school and college be much more organized, and they made it so simple. Just color code these things, add these other things to a book and highlight these things.

I didn't realize that my peers had developed a _system_ for studying and keeping track of what they needed to do. Since I didn't know what it was called and felt awkward admitting I didn't know what it was, I would continue relying on my memory to get things done. However, this approach doesn't scale and is prone to having tasks drop from the list.

When I started working at my second professional job, I found my boss to be organized and meticulous, and he never let anything slip. I learned a ton from him about process improvement and was introduced to a Kanban board for the first time.

As an engineer, I would use a version of his approach for years, but when I got into leadership, I felt that I needed a better system. As an individual contributor, I could rely on the task board for what I needed to do, but that approach doesn't work for a leader because not all of your tasks are timely or fit in a neat Jira ticket.

## Why a System?

Why do we need a system at all? Isn't memory good enough? The problem is that the human mind is fantastic at problem-solving but isn't great when it comes to recollection. In fact, multiple studies (like this [one](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2628592/) or this [one](https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2802090)) have shown that the more stressed you are, the worse your memory can become.

With this context, you need to have some system to get the tasks out of your head and stored elsewhere. Whether that's physical sticky notes in your office, a notebook that you use, or some other tooling, I don't particularly care, but you do need _something_.

## My Approach

I'm loosely inspired by the [Getting Things Done](https://gettingthingsdone.com/) approach to task completion, which I've implemented as a [Trello](https://trello.com/) board. Having an online tool works for me because I can access it anywhere on my phone (no need to carry a notebook or other materials).

Another side effect of having an online tool is that at any point I have an idea or a task that I need to do, I can add it to my Trello board in two clicks. No more worries about remembering to add the task when I'm back home or in the office, which allows me to not stress about it.

## Work Intake Process

On my Trello board (which you can copy a template from [here](https://trello.com/b/7hd13EPI/getting-things-done)), all tasks end up in the first column, called _Inbox_. The inbox is the landing spot for anything and everything. Throughout the day, I will process the list and move it to the appropriate column.

- Is it a task that I can knock out in 5 minutes or less? Just do it!
- Is it a task that will take more than 5 minutes? Then I move it into the _To Do_ column
- Is it a task that I might be interested in? Is it a bigger task that I need to think more about? Then that goes into the _Some Day_ column
- If the task is no longer needed, then it gets deleted.

## Deciding What To Do Next

Once the inbox is emptied, I look at the items in the _To Do_ column and pick the most important one. However, determining the most important one is not always the easy.

For this, I leverage the [Eisenhower Matrix](https://en.wikipedia.org/wiki/Time_management#The_Eisenhower_Method) approach.

Named after Dwight D. Eisenhower, the idea is that we have two axes, one labeled _Important_ and the other labeled _Urgent_. With these labels, tasks fall into four buckets:

- Urgent and Important - (e.g., production broken, everything is on fire)
- Urgent and Not Important - (e.g., last minute request, something that needs to be done, but not necessarily by you)
- Not Urgent and Important - (e.g., strategic work, things that need to get done, but not necessarily this moment)
- Not Urgent and Not Important - (e.g., time wasters, delete these tasks)

<figure>
  <img src="https://upload.wikimedia.org/wikipedia/commons/3/32/MerrillCoveyMatrix.png" alt="Eisenhower Matrix with four quadrants: Urgent & Important, Urgent & Not Important, Not Urgent & Important, and Not Urgent & Not Important">
  <figcaption>(2023, March 7). In Wikipedia. https://en.wikipedia.org/wiki/Time_management</figcaption>
</figure>

## Dealing with Roadblocks

In an ideal world, you could take an item and run it to completion, but things aren't always that easy. You might need help from another person or are waiting for someone to do their part.

When this happens, I'll move the item to the _Waiting_ column and pick up a new task as I don't like to be stalled.

However, I keep an eye on the number of items in flight as I've found that if I have more than three items in flight, I struggle with making progress and spend my time [context-switching](https://en.wikipedia.org/wiki/Context_switch#Cost) between the items instead of completing work. It can be challenging if the tasks are wholly unrelated (development tasks, writing, and reviewing pull requests) as the cost of regaining the context feels higher than if the tasks are related (e.g., reviewing multiple pull requests for the same repository).

## Getting Things Done

As items get completed, I add them to the _Done_ column for the week. To help keep track of what I got done for the week, I typically call my _Done_ column the week it spans (e.g., _Apr 17-23, 2023_). Once the week ends, I can refer back to the column, see where I spent my time, and reflect if I made the right choices for the week.

Finally, I'll archive the list, create a new column for next week and repeat.
