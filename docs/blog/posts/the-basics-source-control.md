---
draft: false
date: 2013-10-12
authors:
  - cameronpresley
description: >
  Intro to Source Control

categories:
  - Basics
---

# The Basics: Source Control

As the first part of the Basics of Software Development series, we’re going to talk about source control is, why you should be using it and commonly used source control management (SCM) tools.

## Source Control, what’s that?

To put it simply, SCM is a set of tools that allow users to keep track of source code by using a repository. The most common workflow is to get a copy of the source code from SCM, make changes to some of the files (refactoring for example) and committing those changes back.

## Benefits of Source Control

- Allows for users to undo uncommitted changes
  - Promotes developers to refactor code
- Keeps track of what changes have been made over time
  - Great for seeing what changes have been made over time (for example between versions)
- By definition, it’s a backup of the source code
  - Perfect if your workstation crashes and you don’t have a backup
- Makes it easier for other developers to get the latest changes
  - Instead of one developer making changes and “pushing” them to the team, source control allows the team to “pull” changes when ready.

Without source control, anytime that code changes were made, the developer who made changes would have to push the code to the other developers. This may not sound terrible, but what if you were in the middle of rewriting a file? You would have to figure out what files have been changed, hope that the files that were changed aren’t files that you’re currently working on. After ensuring all of that, you need to merge your changes to the latest version and hope that nothing broke. As you can see, this is a horrible workflow, prone for errors. However, using a SCM solves these issues.

## Choosing Source Control

All SCM tools work either as **centralized** or **distributed**. Before you can choose a source control, you need to figure what type of source control type works best for your situation (tech requirements, ease of setup, company policies, etc..)

In a centralized source control implementation, there is a main server (central repository) that holds the source code and history of changes. When a developer checks out source code, they are only getting the source code (no revision history). After the developer makes changes and commits the changes, the files that have been modified are sent back to the central repository. Since the repository has the source code and history of changes, the repository is known to have the “blessed” or the “single source of truth” copy of the source code.

Since the centralized implementation utilizes the central server, it’s very easy to see what’s the latest and greatest. However, due to the centralization, if the server ever goes down, the team cannot commit changes.

In a distributed source control implementation, the big difference is that there is not a central repository. This means that every developer has both the latest source code and the revision history.

The main advantage to this implementation is that a developer can commit changes and continue working if there is no network connection. However, due to the lack of a central repository, there is no such thing as “blessed” version.

## Common Source Control Implementations

Team Foundation Server (TFS) – This is a centralized source control that is most likely working with .NET code and Visual Studio. Even though It is possible to use TFS for other languages and IDE’s, you have to use Team Explorer Everywhere and is currently supported with Eclipse.

Subversion (SVN) – This is a centralized source control platform that is designed to be used for any programming language and IDE.

Git – This is one of the most widely used distributed source control platform. This platform is most commonly used with GitHub.

Mercurial – Another common distributed source control platform. This is most commonly used with Bitbucket.

Visual SourceSafe – Very old solution from Microsoft, if your company is using this for source control, you need to migrate to another solution. This was the precursor for TFS and should no longer be used for source control.

