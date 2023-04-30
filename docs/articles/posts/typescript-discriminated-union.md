---
draft: false
date: 2023-04-30
authors:
  - cameronpresley
description: >
  Better Domain Modeling with Discriminated Unions

categories:
  - Functional
  - Typescript

hide:
  - toc
---

# Better Domain Modeling with Discriminated Unions

When I think about software, I like designing software so that doing the right things are easy and doing the wrong things are impossible (or at least very hard). This approach is typically called [falling into the pit of success](https://blog.codinghorror.com/falling-into-the-pit-of-success/).

Having a well-defined domain model can prevent many mistakes from happening just because the code _literally_ won't let it happen (either through a compilation error or other mechanisms).

I'm a proponent of functional programming as it allows us to model software in a better way that can reduce the number of errors we make.

Let's at one of my favorite techniques _discriminated unions_.

## Motivation

In the GitHub API, there's an endpoint that allows you to get the [events that have occurred for a pull request](https://docs.github.com/en/rest/issues/timeline?apiVersion=2022-11-28#list-timeline-events-for-an-issue).

Let's take a look at the example response in the docs.

```json
[
  {
    "id": 6430295168,
    "url": "https://api.github.com/repos/github/roadmap/issues/events/6430295168",
    "event": "locked",
    "commit_id": null,
    "commit_url": null,
    "created_at": "2022-04-13T20:49:13Z",
    "lock_reason": null,
  },
  {
    "id": 6430296748,
    "url": "https://api.github.com/repos/github/roadmap/issues/events/6430296748",
    "event": "labeled",
    "commit_id": null,
    "commit_url": null,
    "created_at": "2022-04-13T20:49:34Z",
    "label": {
      "name": "beta",
      "color": "99dd88"
    },
  },
  {
    "id": 6635165802,
    "url": "https://api.github.com/repos/github/roadmap/issues/events/6635165802",
    "event": "renamed",
    "commit_id": null,
    "commit_url": null,
    "created_at": "2022-05-18T19:29:01Z",
    "rename": {
      "from": "Secret scanning: dry-runs for enterprise-level custom patterns (cloud)",
      "to": "Secret scanning: dry-runs for enterprise-level custom patterns"
    },
  }
]
```

Based on the name of the docs, it seems like we'd expect to get back an array of events, let's call this `TimelineEvent[]`. 

Let's go ahead and define the `TimelineEvent` type. One approach is to start copying the fields from the events in the array. By doing this, we would get the following.

```ts
type TimelineEvent = {
  id: number;
  url: string;
  event: string;
  commit_id?: string;
  commit_url?: string;
  created_at: string;
  lock_reason?: string;
  label?: {
    name: string;
    color: string;
  };
  rename?: {
    from: string;
    to: string;
  };
};

```

## The Problem

This definition will work, as it will cover all the data. However, the problem with this approach is that `lock_reason`, `label`, and `rename` had to be defined as nullable as they can sometimes be specified, but not always (for example, the `lock_reason` isn't specified for a label event).

Let's say that we wanted to write a function that printed data about `TimelineEvent`, we would have to write something like the following:

```ts

function printData(event: TimelineEvent) {
  if (event.event === "labeled") {
    console.log(event.label!.name); // note the ! here, to tell TypeScript that I know it'll have a value
  } else if (event.event == "locked") {
    console.log(event.lock_reason);
  } else {
    console.log(event.rename!.from); // note the ! here, to tell Typescript that I know it'll have a value
  }
}

```

The main problem is that the we have to remember that the `labeled` event has a `label` property, but not the `locked` property. It might not be a big deal right now, but given that the GitHub API has over [40 event types](https://docs.github.com/en/webhooks-and-events/events/issue-event-types), the odds of forgetting which properties belong where can be challenging. 

The pattern here is that we have a type `TimelineEvent` that can have different, separate shapes, and we need a type that can represent all the shapes.

## The Solution

One of the cool things about Typescript is that there is a [union operator (|)](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#unions), that allows you to define a type as one of the other types.

Let's refactor our `TimelineEvent` model to use the union operator.

First, we need to define the different events as their own types

```ts
type LockedEvent = {
  id: number;
  url: string;
  event: "locked"; // note the hardcoded value for event
  commit_id?: string;
  commit_url?: string;
  created_at: string;
  lock_reason?: string;
};

type LabeledEvent = {
  id: number;
  url: string;
  event: "labeled"; // note the hardcoded value for event
  commit_id?: string;
  commit_url: string;
  created_at: string;
  label: {
    name: string;
    color: string;
  };
};

type RenamedEvent = {
  id: number;
  url: string;
  event: "renamed"; // note the hardcoded value for event
  commit_id?: string;
  commit_url?: string;
  created_at: string;
  rename: {
    from: string;
    to: string;
  };
};
```

At this point, we have three types, one for each specific event. A `LockedEvent` has no knowledge of a `label` property and a `RenamedEvent` has no knowledge of a `lock_reason` property.

Next, we can update our definition of `TimelineEvent` to use the _union_ operator as so.

```ts
type TimelineEvent = LockedEvent | LabeledEvent | RenamedEvent
```

This would be read as _A `TimelineEvent` can either be a `LockedEvent` or a `LabeledEvent` or a `RenamedEvent`_.

With this new definition, let's rewrite the `printData` function.

```ts
function printData(event: TimelineEvent) {
  if (event.event == "labeled") {
    console.log(event.label.name); // note that we no longer need !
  } else if (event.event == "locked") {
    console.log(event.lock_reason); 
  } else {
    console.log(event.rename.to); // note that we no longer need !
  }
}
```

Not only do we not have to use the `!` operator to ignore type safety, but we also have better autocomplete (note that `locked_reason` and `rename` don't appear when working with a labeled event).
![Better autocomplete](../images/typescript-union-intellisense.png)


## Deeper Dive

At a general level, what we've modeled is a [sum type](https://en.wikipedia.org/wiki/Tagged_union) and it's great for when you have a type that can take on a finite number of differing shapes.

Sum types are implemented as either _tagged unions_ or _untagged unions_. Typescript has untagged unions, however, other languages like Haskell and F#, use tagged unions. Let's see what the same implementation in F# would have looked like.

```fsharp
// specific type definitions omitted since they're
// similar to typescript definition
// ....
type TimelineEvent = Locked of LockedEvent | Labeled of LabeledEvent | Renamed of RenamedEvent

let printData e = 
    match e with
    | Locked l -> printf "%s" l.lock_reason
    | Labeled l -> printf "%s" l.label.name
    | Renamed r -> printf "%s" r.rename.``to`` // the `` is needed here as to is a reserved word in F#
```

A _tagged union_ is when each shape has a specific constructor. So in the F# version, the `Locked` is the tag for the `LockedEvent`, `Labeled` is the tag for the `LabeledEvent`, so on and so forth. In the Typescript example, we worked around it because the `event` property is on every `TimelineEvent` and is a different value. 

If that wasn't true, then we would had to have added a field to `TimelineEvent` (typically called `kind` or `tag`) that would help us differentiate between the various shapes.

## Wrapping Up

When defining domain models where the model can have different shapes, you can use a _sum_ type to define the model.