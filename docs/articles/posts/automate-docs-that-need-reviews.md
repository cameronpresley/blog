---
draft: false
date: 2023-07-13
authors:
  - cameronpresley
description: >
  Scaling Effectiveness with Docs
categories:
  - Process
  - Typescript
hide:
  - toc
---

# Scaling Effectiveness with Docs

As a leader, I'm always looking for ways to help my team to be more efficient. To me, an efficient team is self-sufficient, able to have the information needed to solve their problems. I've found that having up-to-date documentation is critical for a team to be successful because it scales out knowledge in an asynchronous manner, without the need of transferring knowledge manually.

For example, my team has a wiki that contains information for onboarding into our space, how to complete certain processes (requesting time off, resetting a password), how to run our Agile activities, and our support guidebook. At any point, if someone on the team doesn't know how to do something, they can consult the wiki and find the necessary information.

I enjoy up-to-date documentation, but the main problem with them is that they capture the state of the world at the time when they were written, but they don't react to changes. If the process for resetting your password changes, the documentation doesn't auto-update. So unless you're spending time reviewing the docs, they'll grow stale and be worthless, or even worse, mislead others to do the wrong things.

A good mental model for documentation is to think of them as a garden. When planted, it looks great and everyone enjoys the environment. Over time, weeds will grow and plants will become overgrown, causing the garden to be less attractive. Eventually, people will stop visiting, and the garden will go into disrepair. To prevent this, we need to take care of the garden, weeding and trimming as needed.

<figure markdown>
  ![Outdoor green space](https://images.unsplash.com/photo-1601654253194-260e0b6984f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1999&q=80)
  <figcaption>Photo by Robin Wersich via <a href="https://unsplash.com/photos/Q0IrpWQIMR4">Unsplash.com</a></figcaption>
</figure>

_Alright, I get it, documentation is important, but my team has commitments, how do we carve out time to review?_

Story Time!

I started my career in healthcare and one of my first jobs was writing software for a medical diagnostic device. We were ISO 9001 certified and the device was considered a Class II from the FDA. Long story short, this meant that not only did we have to provide docuemntation for our device and software, but also show that we were keeping things up to date.

To ensure this, we would find docs that hadn't been updated in a certain time period (like 90 days) and review them. If everything checked out, we'd bump up the review date, otherwise, we'd make the necessary changes and revalidate the document.

At the time, all of our files were in Word, so it wasn't the easiest to search the files (I seem to recall that we had Outlook reminders, but this was many moons ago).

By baking this into our process and getting it into our calendars, this helped make our work more visible, which gave us a better idea of capacity that the team could get to that sprint.

So how do we bring this up to modern day?

I think that having documentation in source control is such a smart idea. If you're using tools like Git, then you already have a way of doing pull requests, leaving comments, and an audit trail of reviewed/approved the changes. To this extent, I enjoy using [Markdown]() as it's plaintext which is easy to read and to compare differences against.

Because it's plaintext, it's simple to add a line to the bottom of each file that says _Last Reviewed On: YYYY/MM/DD_. Once we have that line (which you could automate doing), we can then write a script that does the following:

1. Clone/Get latest the repo.
1. Find all the markdown files.
1. Get the last line of the file.
1. If the line doesn't start with _Last Reviewed On:_, then we flag it for review.
1. If the line has a date, but it's older than 90 days, then we flag it for review.
1. Print all flagged files to the screen.

Once we have this script, we can automate this process by creating a cron job/scheduled task on my machine. If we wanted to have a further reach, we could update the script to post a message to our chat application and have the script be executed through our Continuous Integration tooling.
