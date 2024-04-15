---
draft: false
date: 2024-04-16
authors:
  - cameronpresley
description: >
  Learning From Failures: Leveraging Postmortems For Good
categories:
  - Process
hide:
  - toc
---

# Learning From Failures: Leveraging Postmortems for Good

As engineers, we love solving problems and digging into the details. I know that I feel a particular sense of joy when shipping a system to production for the first time.

However, once a system goes into production, it's going to fail. That's not a knock on engineering, that's a fact of our industry. We cannot build a system with 100% uptime, no matter how much we plan ahead or think about.

When this happens, our job is to fix the issue and bring the systems back up.

A common mistake that I see teams make is that they'll fix the problem, but never dig into the _why_ it happened. Fast forward three months, and the team will run into the same problem, making the same mistakes. I'm always surprised when teams don't share their knowledge because if you've paid the tax of learning from the first outage, why would you pay the same tax to learn the lesson again?

This is where having a _postmortem_ meeting comes into play. Borrowing from medicine, a _postmortem_ is performed when the team gets together to analyze the outage and what could have been done differently to prevent it from happening. Other industries have similar mechanisms (for example, professional athletes review their games to learn where they made mistakes so that they can train differently).

One of the key concepts of the _postmortem_ is that the goal **isn't to assign blame, but to understand what happened and why**. People aren't perfect and it's not reasonable for them to be. This concept is so fundamental that another term you might here for a postmortem is a _[blameless incident report (BIR)](https://www.atlassian.com/incident-management/postmortem/blameless)_.

## Getting Started

Every company has their own process when they have an outage, but health process should be able to answer these five questions at a minimum.

1. What stopped working?
1. Why did it stop working?
1. How did we fix it?
1. What led to the system breaking?
1. What are we doing to prevent this issue from happening in the future?

Organizations may have additional questions for their process, for example

- What was the impact? (X customers were impacted for Y minutes)
- How was this discovered? (Was it user reported, support found it, our monitoring tools paged on-call)

You can always make a process more complicated, but it's hard to simplify a process, so my recommendation is start with the 5 questions and then expand as your team evolves and matures.

### What Stopped Working?

For there to be an outage, something had to stop working, right? So what was it? It's okay/normal to be a bit technical here, however, don't forget that this outage caused an impact to our users, so we should strive to explain the outage in those terms.

Another way to think about this is _"What stopped working and what impact did it have for our users?"_

Here's a not-great answer to the question

<blockquote>
  The Data Sync Java container stopped working.
</blockquote>

While this does capture what stopped working, the details are quite vague. For example, did it not start? Did it start crashing? Was it the whole process that failed or only one part?

In addition, there's not a clear delineation of what the user impact was. For example, could users not log into the application at all? Were there certain parts of the application that stopped working?

We can improve this by including a bit more details in what specifically stopped working.

<blockquote>
  The Data Sync process was failing to connect to the UserHistory database.
</blockquote>

Ah, okay, now we know that the sync process wasn't able to connect to a specific database and we can start getting a sense of why that would be a big deal. We're still not including the user impact, so let's add that bit of detail in.

<blockquote>
  The Data Sync process was failing to connect to the UserHistory database. As such, when users logged into their account, they could not see the latest transactions for their account.
</blockquote>

Much better, now I know that our users couldn't see recent transactions and it was something to do with the Data Sync process.

As a side benefit, if I'm a new engineer to this codebase or team, I know know more about the architecture and that this process is involved for when users start transactions.

### Why Did It Stop Working?

At some point, the system was working and if it's no longer working, something had to have happened, so what was it? Was there a code deployment to production? Did a feature flag get toggled that had an adverse effect? What about infrastructure changes like DNS entries or firewall?

This is a key critical step because if we don't know why it stopped working, then we don't have a good spot to start when we start diving into the [circumstances behind what led to the outage](#what-led-to-the-system-breaking).

This doesn't have to be a page worth of technical deep dive, a couple of sentences can suffice here. In our outage, the issue was due to a port being blocked by the firewall (where it wasn't before).

<blockquote>
  There was an infrastructure change for the database that blocked port 1433, which is the default port for the database. Because of this change, no application was able to successfully connect to the database.
</blockquote>

### How Did We Fix It?

If you've gotten to the point of writing the BIR, then you've fixed the issue and the system is up and running again, right? So what did you do to fix the issue? Did you rollback the deployment? Disable a feature flag? Burn down the application, change your name and get a new job? This is a cool part of the BIR because you're leveling up others that if they run into a similar issue, here's how you were able to get back up and running.

In our example, we were able to unblock the port, so we can answer this question with:

<blockquote>
  Once we realized that port 1433 was being blocked by the firewall, we worked with the Infrastructure team to unblock the port. Once that change was completed, the Data Sync service was able to start syncing data to the UserHistory database.
</blockquote>

### What Led To the System Breaking?

This is where the meat of the conversation should take place. In a healthy organization, we assume that people are wanting to do the right thing (if not, you have a much bigger problem that BIRs). So we've got to figure out how did we get here, what were the motivations and why did we do the things that we did?

One common approach is [5 Whys](https://en.wikipedia.org/wiki/Five_whys), made popular by the Toyota Production System. The idea is that we keep digging into why something happened and not stop at symptoms.

An example _5 Whys_ breakdown for this outage could be the following:

```md
- Why did the Data Sync service started failing to connect to the UserHistory database?
    - Because the port that the Data Sync service was communicating with got blocked
    - Why did the port become blocked?
        - One of our security initiatives is to block default ports to lessen the changes of someone gaining access to our systems
        - Why is this an initiative?
            - Our current firewall solution doesn't support a way to have an _allowList_ of dynamic IP addresses. Since most vulnerability tools scan a network, they'll typically use default ports to see if there's a service running there and if so, try to compromise it.
            - Why doesn't our current firewall solution have support for dynamic IP addresses?
    - Why did we not see this issue in the lower environments?
        - The lower environments are not configured the same as our production environment
        - Why are these environments different?
            - Given that lowers receive less traffic than production, we have multiple databases installed on the same server, none of which are on the default port. By doing this, we're saving money on infrastructure costs.
        - Why did the team not realize that the lowers are configured differently?
            - The Data Sync process is an older part of our application that most of the team doesn't have knowledge of.
    - Why did our monitoring tools not catch the issue after deployment?
        - For the Data Sync process, we currently only have a health check, which only checks to see if the app is up, it doesn't check that it has line-of-sight to all its dependencies.
        - Why doesn't the health check include dependency checking?
            - Health checks are used to tell our cloud infrastructure to restart a service. Since restarting the service wouldn't have resolved the problem, that's why we don't have it included in the checks
        - Why don't we have other checks?
            - The Data Sync process predates our existing monitoring solutions and has been stable, so the work was never prioritized.
```

As you can see, this approach brings up lots of questions, including the motivation behind the work and why the team was doing it anyway. It is possible

### What Are We Doing To Prevent Similar Issues in the Future?

The system is going to have an outage, that's not up for debate. However, it would be foolish to have an outage and not do anything to prevent it from happening in the future. If we already paid the learning tax once, let's not pay it again for the same issue.

This should be a concrete list of action items that the team takes ownership of. In some cases, it's work that they can do to prevent the issue going forward. In some cases, it could be working with others to help them fix things in their process.

In our hypothetical outage, we could have the following action items

- Add Additional Monitoring for the Data Sync process
- Work with Security to determine approach for securing our database instance
- Create environment diagram for Data Sync process
- Create architecture diagram for Data Sync process


## Example Blameless Incident Report

In this post, we covered the 5 main questions to answer for a BIR and what good responses look like. In this section, I wanted to go over an example BIR for the database issue that we've been exploring. As you'll see, it's not a verbose document, however, it does capture the main points and this is easily consumable for other teams to learn from our mistakes.

```md
# Title: Users Unable To See Latest Transactions

##  What Stopped Working?
The Data Sync process stopped being able to connect to the UserHistory Database. Because of this failure, when users logged into their account to see transactions, they were not able to see any new transactions.

## Why Did It Stop Working?

A change was made to the database infrastructure to block port 1433. This is the default port for a SQL Server database so when it was blocked, no application was able to communicate with the database.

## How Did We Fix It?

The firewall port change was reverted.

## What Led to the System Breaking?

To improve our security posture, we wanted to block default ports to our systems so that if someone was to gain access, they couldn't "guess" into the connection for the database.

When making these firewall changes, we start in the lower environments so that if there is a problem, we impact dev or staging and not production.

Unknown to the team, in the lower environments, we have multiple databases installed on a server, none of which are on port 1433. Because of this, we had false confidence that our changes were safe to deploy forward.

In production, each database has their own server, running on port 1433.

##  What Are We Doing To Prevent Issues In The Future?

- **Check the environment differences** - Before making infrastructure changes, we're going to check what the differences are in our lower environments vs production.
- **Create architecture diagram** - Since one of the main issues is that the team didn't understand the architecture of the Data Sync process, we're going to create an architecture diagram that covers the flow of the service.
- **Create environment diagram** - To better understand our system, we're going to create an environment diagram that covers the databases at play and how the Data Sync process communicates.
- **Work with Security on Approaches for Securing Database** - We'll work with the Security team to either setup a way to have dynamic IPs work with our firewall technology or to change our Data Sync process to have a static IP.

```