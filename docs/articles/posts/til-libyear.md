---
draft: false
date: 2024-04-22
authors:
  - cameronpresley
description: >
  TIL - Detecting Dependency Drift with LibYear

categories:
  - TypeScript
  - Today I Learned
  - Process

hide:
  - toc
---

# Today I Learned: LibYear

When writing software, it's difficult (if not impossible) to write everything from scratch. We're either using a framework or various third-party libraries to make our code work.

On one hand, this is a major win for the community because we're not all having to solve the same problem over and over again. Could you imagine having to implement your own authentication framework ([on second thought...](https://www.reddit.com/r/learnprogramming/comments/q8ppcs/never_roll_your_own_authenticationauthorization/))

However, this power comes at a cost. These libraries aren't free as in beer, but more like puppies. So if we're going to take in the library, then we need to make sure that our dependencies are up-to-date with the latest and greatest. There are new features, bug fixes, and security patches occurring all the time and the longer we let a library drift, the more painful it can be to upgrade.

If the library is leveraging [semantic versioning](https://semver.org/), then we can take a guess on the likelihood of a breaking change base on which number (Major.Minor.Maintenance) has changed.

- Major - We've made a breaking change that's not backward compatible. Your code may not work anymore.
- Minor - We've added added new features that you might be interested in or made other changes that  are backwards compatible.
- Maintenance - We've fixed some bugs, sorry about that!

## Keeping Up With Dependencies

For libraries that have known vulnerabilities, you can leverage tools like GitHub's [Dependabot](https://docs.github.com/en/code-security/getting-started/dependabot-quickstart-guide) to auto-create pull requests that will upgrade those dependencies for you. Even though the tool might be "noisy", this is a great way to take an active role in keeping libraries up to date.

However, this approach only works for vulnerabilities, what about libraries that are just out-of-date? There's a cost/benefit of upgrading where the longer you go between the upgrades, the riskier the upgrade will be.

In the JavaScript world, we know that dependencies are listed in the `package.json` file with minimum versions and the `package-lock.json` file states the _exact_ versions to use.

## Using LibYear

I was working with [one of my colleagues](https://www.linkedin.com/in/joshuaangolano/) the other day and he referred me to a library called [LibYear](https://github.com/jdanil/libyear) that will check your package.json and lock file to determine how much "drift" that you have between your dependencies.

Under the hood, it's combining the `npm outdated` and `npm view <package>` commands to determine the drift.

What I like about this tool is that you can use this as a part of a "software health" report for your codebase.

As engineers, we get pressure to ship features and hit delivery dates, but it's our responsibility to make sure that our codebase is in good shape (however we defined that term). I think this library is a good way for us to capture _a_ data point about software health which then allows the team to make a decision on whether we should update our libraries now (or defer).

The nice thing about the `LibYear` package is that it lends itself to be ran in a pipeline and then you could take those results and post them somewhere. For example, maybe you could [write your own automation bot](./having-coffee-with-deno-part1.md) that could post the stats in your Slack or Teams chat.

It looks like [there's already a GitHub Action](https://github.com/marketplace/actions/node-js-dependency-freshness-via-libyear) for running this tool today, so you could start there as a basis.
