---
draft: false
date: 2025-06-20
authors:
  - cameronpresley
description: >
  TIL - JavaScript private fields and properties

categories:
  - Today I Learned
  - TypeScript

hide:
  - toc
---

# Today I Learned - Leveraging Records to Eliminate Switch Statements

## The Problem

A common approach is to have a function for each command (`moveForward`, `moveBackward`, `turnLeft`, and `turnRight`).

When it comes to implementation though, they all have a similar pattern:

```ts
function moveForward(r:Rover): Rover {
  switch(r.direction){
    case 'North': return {...r, y:r.y+1};
    case 'South': return {...r, y:r.y-1};
    case 'East': return {...r, x:r.x+1};
    case 'West': return {...r, x:r.x-1};
  }
}

function turnLeft(r:Rover): Rover {
  switch(r.direction){
    case 'North': return {...r, direction:'West'};
    case 'West': return {...r, direction:'South'};
    case 'South': return {...r, direction:'East'};
    case 'East': return {...r, direction:'North'};
  }
}
```

This works, however, the duplicated switch logic can be annoying to deal with. 

During a code review, one of [our interns]() proposed an interesting solution using a dictionary for lookups.

Let's take a closer look.

## Possible solution

Instead of leveraging a `switch` statement, they thought about creating a dictionary where the key was the direction the rover was facing and the value being how to update the rover.

At a high level, it looked something like this:

```ts

type Direction = "North" | "South" | "East" | "West";
type Action = (r:Rover) => Rover;
type ActionLookup = Record<Direction, Action>;

function moveForward(r:Rover): Rover {
  const lookup: ActionLookup = {
    "North": (r)=>({...r, y:r.y+1}),
    "South": (r)=>({...r, y:r.y-1}),
    "East": (r)=>({...r, x:r.x+1}),
    "West": (r)=>({...r, x:r.x-1})
  };
  const action = lookup[r.direction];
  return action(r);
}
```

Even though this looks like a dictionary, I like this approach better for two reasons:

1. Explicit key coverage - By defining Record to have a key of `Direction`, we're forcing the developer to define options for _every_ direction, not just some of them.
1. Breaks when type changes - If a new option is added to `Direction`, this code won't compile anymore as it doesn't cover every option, which allows us to find bugs faster. 

## Closing Thoughts

When working with data that requires different access levels, think about leveraging private fields and then providing access through public properties.
