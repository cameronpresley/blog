---
draft: false
date: 2020-12-12
authors: 
  - cameronpresley
description: >
  Examining LINQ's WHERE

categories:
  - .NET

hide:
  - toc
---

# Thinking With Properties: Examining Where

_Note: This post is for [C# Adevent Calendar 2020](https://www.csadvent.christmas/) organized by [Matthew Groves](https://twitter.com/mgroves). Check out some of the other psots that are happening over the month of December!_

## What Do We Mean By Properties?

When I think about software, I will generally think about the _properties_ that the solution has to have `Where` properties are the characteristics that the code has. Sometimes, the property is obvious (for example, if you square a number, the result should always be positive). In this post, we’re going to look at LINQ’s `Where` method, examine some of the properties, and come up with a more efficient way of creating filters.

## Examining LINQ's `Where` Method

For those not familiar with `Where`, it’s a method that promises that it will return a subset of a list `Where` each item fulfills some criteria (referred to as a _predicate_). The type signature for `Where` is

`IEnumerable<T> => Func<T, bool> => IEnumerable<T>`

At face value, this sounds pretty straightforward, but there are a few more properties that `Where` provides that aren’t obvious at first, but are beneficial

- The results can’t be null (worse case, it’ll be an empty list because no item fulfilled the criteria)
- The results can’t be larger than the original list
- The results are in the same order that the original list was in (i.e. if we’re trying to find the even numbers in a list that is 1..10, then you’re guaranteed to get 2, 4, 6, 8, and 10. Not, 8, 2, 6, 10, 4)
- The results will only contain elements that were in the original list (i.e. it can’t create elements out of thin air and it can’t copy elements in the original list)

## Common LINQ Mistake with `Where`

That’s a ton of guarantees that you get from leveraging `Where` instead of doing your own filtering inside loops. With these properties in mind, let’s take a look at a common mistake that developers make when working with `Where`

```c#

// Generate numbers from -10 .. 100
var numbers = Enumerable.Range(-10, 111);

// Determines all positive numbers that are divisible by 6
var positiveDivisbleBySix = numbers
                            .Where(x=>x > 0) // iterates through the whole list (111 comparisons, returning 100 results)
                            .Where(x=>x % 2 == 0) // iterates through the new list (100 comparisons, returning 50 results)
                            .Where(x=>x % 3 == 0); // iterates through the new list (50 comparisons, returning 16 results)
// Overall metrics: 261 comparisons over 111 total elements)

```

By leveraging multiple Where statements, the list will be iterated once per statement. which may not be a big deal for small lists, but for larger lists, this will become a performance hit. In order to help cut down on the iterations, it’d be ideal to combine the multiple Where statements into a single one like so

```c#

// Generate numbers from -10 .. 100
var numbers = Enumerable.Range(-10, 111);

var positiveDivisibleBySix = numbers.Where(x => x > 0 && x % 2 == 0 && x % 3 == 0);

```

By combining the criteria in a single Where statement, we eliminate the multiple iteration problem, however, we introduce code that’s a bit harder to read and if we want to combine a non-fixed number of predicates, then this approach won’t work.

Since the goal is to take multiple predicates and combine them to a single predicate, my intuition is to leverage LINQ’s Aggregate method where we can take a List of items and reduce down to a single item.

## Refactoring Multiple Where with Aggregate

In order to leverage Aggregate, we’ll first need to have a list of item to reduce down. Since all of the predicates are Func<int, bool>, we can easily create a List like so

```csharp

Func<int, bool> isPositive = x => x > 0;
Func<int, bool> isEven = x => x % 2 == 0;
Func<int, bool> isDivisibleByThree = x => x % 3 == 0;
var predicates = new List<Func<int, bool>> {isPositive, isEven, isDivisibleByThree};

```

Now that we have a list of predicates, we can go ahead and start stubbing out the Aggregate call.

```csharp

var combinedPredicate = predicates.Aggregate(...., ....);

```

In order to use Aggregate, we need to determine two pieces of information. First, what should the predicate be if there are no predicates to combine? Second, how do we we combine two predicates into a single predicate?

## Defining the Base Case

When using Aggregate, the first thing that we need to think about is the base case, or in other words, what should the default value be if there are no elements to reduce down?

Given that the result needs to be a predicate, we know that the type should be `Func<int, bool>`, but how do we implement that? We’ve got one of two choices for the base case, we can either filter every item out (i.e. if no predicates are specified, then no items are kept) or we keep every item.

For our use case, we want to keep every item if there are no predicates, so our base case looks like the following

```csharp

Func<int, bool> andIdentity = _ => true;

```

## Defining How To Combine Predicates

Since we’re combining predicates, our combine function will need to have the following type

`Func<int, bool> => Func<int, bool> => Func<int, bool>`

```csharp

Func<int, bool> combinedPredicateWithAnd(Func<int, bool> a, Func<int, bool> b)
{
  return x => ...;
}
```

With this in mind, we know that for an item to be valid, it has to match _every_ predicate in the list which implies that we’ll be leveraging the `&&` operator

```csharp

Func<int, bool> combinedPredicateWithAnd(Func<int, bool> a, Func<int, bool> b)
{
  return x => ... && ...;
}

```

Now that we know to use `&&`, we can then use a and b to determine if the item is valid

```csharp

Func<int, bool> combinedPredicateWithAnd(Func<int, bool> a, Func<int, bool> b)
{
  return x => a(x) && b(x);
}

```

## Bringing It All Together

With the base case established and a way to combine predicates, here’s how we can solve the original problem.

```csharp

// Define the predicates
Func<int, bool> isPositive = x => x > 0;
Func<int, bool> isEven = x => x % 2 == 0;
Func<int, bool> isDivisibleByThree = x => x % 3 == 0;
var predicates = new List<Func<int, bool>> {isPositive, isEven, isDivisibleByThree};

// Defining the Aggregate functions
Func<int, bool> andIdentity = _ => true;
Func<int, bool> combinedPredicateWithAnd(Func<int, bool> a, Func<int, bool> b)
{
  return x => a(x) && b(x);
}

// Combining the predicates
Func<int, bool> combinedAndPredicate = predicates.Aggregate(andIdentity, combinedPredicateWithAnd);

// The new solution
// Generate numbers from -10 .. 100
var numbers = Enumerable.Range(-10, 111);
var positiveDivisbleBySix = numbers.Where(combinedAndPredicate);

```

Going forward, if we need to add more predicates, all we need to do is to add it to the `List` and the rest of the application will work as expected

## Wrapping Up

In this post, we explored LINQ’s `Where` method by examining its various properties. From there, we took a look at a common mistake developers make with `Where` and then showed how to resolve that issue by using `Aggregate`.

Shout out to Matthew Groves for letting me participate in C# Christmas ([csadvent.christmas](https://www.csadvent.christmas/))