---
draft: false
date: 2024-05-06
authors:
  - cameronpresley
description: >
  TIL - Effective Mobbing with Mob.sh

categories:
  - Today I Learned
  - Tooling

hide:
  - toc
---

# Today I Learned - Effective Pairing with Mob.sh

As someone who enjoys leveraging technology and teaching, I'm always interested in ways to simplify the teaching process.

For example, when I'm teaching someone a new skill, I follow the "show one, do one, lead one" approach and my tool of choice for the longest time was [LiveShare](https://visualstudio.microsoft.com/services/live-share/) by Microsoft.

## Using VS LiveShare
I think this extension is pretty slick as it allows you to have multiple collaborators, the latency is quite low, and it's built into both Visual Studio Code (VS Code) and Visual Studio.

## Drawbacks to LiveShare

### Editor Lock-In

First, participants have to be using Visual Studio or VS Code. Since there's support for VS Code, this isn't quite a blocker as it could be. However, let's say that I'm wanting to work with a team on a Java application. They're more likely to be using IntelliJ or Eclipse as their editor and I don't want someone to have to change their editor just to collaborate.

### Security Concerns

Second, there are some security considerations to be aware of.

Given the nature of LiveShare, collaborators either connect to your machine (peer-to-peer) or they go through a relay in Azure. Companies that are sensitive to where traffic is routed to won't allow the Azure relay option and given the issues with the URL creation (see next section), the peer-to-peer connection isn't much better.

To start a session, LiveShare generates a URL that the owner would share with their collaborators. As of today, there's no way to limit _who_ can access that link. The owner has some moderator tools to block people, but there's not a way to stop anyone from joining who doesn't have the right kind of email address for example.

## Introducing Mob.sh

While pairing with a [colleague](https://www.linkedin.com/in/jefflangr/), he introduced me to an alternative tool, [mob.sh](https://mob.sh/)

At first, I was a bit skeptical of this tooling as I enjoyed the ease of use that I got with LiveShare. However, after a few sessions, I find that this tool solves the problems that I was using LiveShare for just as good, if not better.

### How It Works

At a high level, _mob.sh_ is a command line tool that is a wrapper around basic `git` commands.

Because of this design choice, it doesn't matter what editor that a participant has, as long as the code under question is under `git` source control, the tooling works.

Let's explore how a pair, Adam and Brittany, would use this tool for work.

### Adam and Brittany Start Pairing

Adam is looking to solve a logic issue in an AWS lambda could use Brittany's guidance since he's new to that domain.

Adam creates a new feature branch, `fixing-logic-issue` and starts a new mobbing session.

```sh
git switch -c fixing-logic-issue
mob start --create
# --create is needed because fixing-logic issue is not on the server yet
```

Under the hood, `mob.sh` has created a new branch off of `fixing-logic-issue` called `mob/fixing-logic-issue`. While Adam is making changes, they're going to occur on the `mob/fixing-logic-issue`.

Because the pair is working remotely, Adam shares his screen so that they're on the same page.

While on this branch, Adam writes a failing unit test that exposes the logic issue that he's running into. From here he signals that Brittany is up by running `mob next`

```sh
mob next
```

By running this command, `mob.sh` adds and commits all the changes made on this branch and pushes them up to the server. Once this command completes, it's Brittany's turn to lead.

Once Brittany see's the `mob next` command complete, she checks out the `fixing-logic-issue` branch and picks up the next portion of the work by running `mob start`

```sh
git pull # To get fixing-logic-issue branch
git switch fixing-logic-issue
mob start
```

Because she was on the `fixing-logic-issue` branch, `mob.sh` was able to see that there was a `mob/fixing-logic-issue` branch already, so that branch is checked out.

Based on the test, Brittany shows Adam where the failure is occurring and they write up a fix that passes the failing test.

Though there are more changes to be done, Brittany has a meeting to attend, so she ends the session by running `mob done`, committing, and then pushing the changes.

```sh
mob done
git commit -m "Fixed first logic bug"
git push
```

By running `mob done` command, all the changes that were on the `mob/fixing-logic-issue` are applied to the `fixing-logic-issue` branch. From here, Brittany can commit the changes and push them back to the server.

## Wrapping Up

If you're looking to expand your pairing/mobbing toolkit, I recommend giving `mob.sh` a try. Not only is the initial investment small, but I find the tooling natural to pick up after a few tries and since it's a wrapper around Git, it reduces the amount of learning needed before getting started.
