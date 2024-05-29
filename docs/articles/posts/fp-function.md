---
draft: false
date: 2024-05-30
authors:
  - cameronpresley
description: >
  Functional Foundations - Functions

categories:
  - Functional
  - TypeScript

hide:
  - toc
---

# Functional Foundations - Functions

When leveraging functional programming, you're not going to go far without functions. It's literally in the name.

In this post, let's take a deeper look at what functions are and some of the benefits we gain.

## What is a Function?

When we talk about _functions_, we're not talking about a programming construct (like the `function` keyword), but instead we're talking about functions from mathematics.

> As such, a _function_ is a mapping from two sets such that for every element of the first set, it maps to a single element in the second set.

Words are cool, but pictures are better. So let's look at the mapping for the `square` function.

![Mapping for the Square Function](images/functional-functions/squaredFunction.png){width=800px}

In this example, we have an arrow coming from an element on the left where it _maps_ to an element on the right. To read this image, we have a mapping called _Square_ that maps all possible numbers to the set of positive numbers. So -3 maps to 9 (-3*-3), 2 maps to 4 (2*2), so on and so forth.

To check if our mapping is a function, we need to check that every element on the left is mapped to a single element on the right. If so, then we've got a function!

Sounds easy, right? Let's take a look at a mapping that isn't a function.

## Love in the Air?

When working with dates, it's common to figure out how many days are in the month. Not only does this help with billable days, but it also makes sure that we don't try to send invoices on May 32nd.

So let's take a look at a mapping from month to the number of days it has.

![Broken Mapping for the Days In Month Function](images/functional-functions/daysInMonthBusted.png){width=800px}

Looking at the mapping, we can tell that January, March, May map to 31, April and June both map to 30. But take a look at February. It's got _two_ arrows coming out of it, one to 28 and the other to 29. Because there are two arrows coming out, this mapping isn't a function. Let's try to implement this mapping in TypeScript.


```ts
type Month = "Jan" | "Feb" | "Mar" | "Apr"
           | "May" | "Jun" | "Jul" | "Aug"
           |"Sept" | "Oct" | "Nov" | "Dec";

type DaysInMonth = 28 | 29 | 30 | 31;

function getDaysInMonth(month: Month): DaysInMonth {
  switch (month) {
    case "Jan":
    case "Mar":
    case "May":
    case "Jul":
    case "Oct":
    case "Dec":
      return 31;

    case "Feb":
      // what should this be?

    case "Apr":
    case "Jun":
    case "Aug":
    case "Sept":
    case "Nov":
      return 30;
  }
}

```

We can't return 28 all the time (we'd be wrong 25% of the time) and we can't return 29 all the time (as we'd be wrong 75% of the time). So how do we know? We need to know something about the year. One approach would be to check if the current year is a leap year ([algorithm](https://learn.microsoft.com/en-us/office/troubleshoot/excel/determine-a-leap-year)).

```ts
function isLeapYear(): boolean {
  const year = new Date().getFullYear();
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  if (year % 4 === 0) return true;
  return false;
}

// Updated switch
case 'Feb':
  return isLeapYear() ? 29 : 28;
```

The problem with this approach is that the determination of what to return isn't from the function's inputs, but outside state (in this case, time). So while this "works", you can get bit when you have tests that start failing when the calendar flips over because it assumed that February always had 28 days.

If we look at the type signature of `isLeapYear`, we can see that it takes in no inputs, but returns a boolean. How can that be possible except if it always returned a constant value? This is a clue that `isLeapYear` is not a function.

The better approach is to change our mapping to instead of taking just a month name, it takes two arguments, a `monthName` and `year`.

![Fixed Mapping For Days In Month](./images/functional-functions/daysInMonthFixed.png){width=800px}

With this new mapping, our implementation would look like the following:

```ts
function isLeapYear(year:number): boolean {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  if (year % 4 === 0) return true;
  return false;
}

function getDaysInMonth(month: Month, year:number): DaysInMonth {
  const isLeap = isLeapYear(year);
  switch (month) {
    case "Jan":
    case "Mar":
    case "May":
    case "Jul":
    case "Oct":
    case "Dec":
      return 31;

    case "Feb":
      return isLeap ? 29 : 28

    case "Apr":
    case "Jun":
    case "Aug":
    case "Sept":
    case "Nov":
      return 30;
  }
}
```

## Benefits of Functions

Now that we've covered what functions are and aren't, let's cover some of the reasons why we prefer functions for our logic.

First, mappings help us make sure that we've covered all our bases. We saw in the `getDaysInMonth` function we found a bug for when the month was February. Mappings can also be great conversation tools with non-engineers as they're intuitive to understand and to explain.

Second, functions are simple to test. Since the result is based solely on inputs, they are great candidates for unit testing and require little to no mocking to write them. I don't know about you, but I like simple test cases that help us build confidence that our application is working as intended.

Third, we can combine functions to make bigger functions using _composition_. At a high level, composition says that if we have two functions `f` and `g`, we can write a new function, `h` which takes the output of `f` and feeds it as the input for `g`.

Sounds theoretical, but let's take a look at a real example.

In the [Mars Rover kata](./mars-rover-intro.md), we end up building a basic console application that takes the input from the user (a string) and will need to convert it to the action that the rover takes.

In code, the logic looks like the following:

```ts
let rover:Rover = {x:0, y:0, direction:'North'};
const action = input.split('').map(convertStringToCommand).map(convertCommandToAction);
rover = action(rover);
```

The annoying part is that we're iterating the list twice (once for each `map` call), and it'd be nice to get it down to a single iteration. This is where composition helps.

When we're running the `map`s back-to-back, we're accomplish the following workflow

![Input to Command to Action Mapping](image.png){width=1000px}

Because each mapping is a function, we can compose the two into a new function, `stringToActionConverter`.

```ts
// using our f and g naming from earlier, convertString is f, convertCommand is g
const stringToActionConverter = (s:string)=>convertCommandToAction(convertStringToCommand(s));

let rover = {x:0, y:0, direction:'North'}
const action = input.split('').map(stringToActionConverter);
rover = action(rover);
```

## Why Not Function All the Things?

Functions can greatly simplify our mental model as we don't have to keep track of state or other side effects. However, our applications typically deal with side affects (getting input from users, reading from files, interacting with databases) in order to do something useful. Because of this limitation, we strive to put all of our business rules into functions and keep the parts that interact with state as dumb as possible (that way we don't have to troubleshoot as much).

What I've found is that when working with applications, you end up with a _workflow_ where you have input come in, gets processed, and then the result gets outputted.

Here's what an example workflow would look like

```ts
// Logic to determine the 'FizzBuzziness' of a number
function determineFizzBuzz(input:number): string {
  if (input % 15 === 0) return 'FizzBuzz';
  if (input % 3 === 0) return 'Fizz';
  if (input % 5 === 0) return 'Buzz';
  return `${input}`;
}

function workflow(): void {
  // Input Boundary
  var prompt = require('prompt-sync')();
  const input = prompt();

  // Business Rules
  const result = (+input) ? `${input} FizzBuzz value is ${determineFizzBuzz(+input)}` : `Invalid input`;

  // Output boundary
  console.log(result);
}
```

## What's Next?

Now that we have a rough understanding of functions, we can start exploring what happens when things go wrong. For example, could there have been a cleaner way of implementing the business rules of our workflow?