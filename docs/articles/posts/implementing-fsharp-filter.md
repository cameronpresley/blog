---
draft: false
date: 2015-10-13
authors: 
  - cameronpresley
description: >
  Implementing F# List.filter

categories:
  - Functional Programming
  - .NET

hide:
  - toc
---

# Implementing Your Own Version of F#’s List.Filter

As I’ve been thinking more about F#, I began to wonder how certain methods in the F# stack work, so I decided to implement F#’s List.filter method.

For those of you who aren’t familiar, List.Filter takes a function that returns true or false and a list of values. The result of the call is all values that fulfill the fuction.

For example, if we wanted to keep just the even numbers in our list, then the following would accomplish that goal.

```fsharp
let values = [1;2;3;4]
let isItEven x = x % 2 = 0


let evenValues = List.filter isItEven values
// val it : int list = [2; 4]
```

Now that we know the problem, how would we begin to implement? First, we need to define a function called filter:

```fsharp
let filter () =
```

However, to match the signature for List.filter, it needs to take a function that maps integers to bools and the list of values to work on

```fsharp
let filter (func:int->bool) (values:int List) =
```

Now that we have the signature, let’s add some logic to match on the list of values. When working with lists, there are two possibilities, an empty list and a non-empty list. Let’s first explore the empty list option.

In the case of an empty list of values, then it doesn’t matter what the func parameter does, there are no possible results, so we should return an empty list for the result.

```fsharp
let filter (func:int->bool) (values:int List) =
    match values with
    | [] -> []
```

Now that we’ve handled the empty list, let’s explore the non-empty list scenario. In this branch, the list must have a head and a tail, so we can deconstruct the list to follow that pattern.

```fsharp
let filter (func:int->bool) (values:int List) =
    match values with
    | [] -> []
    | head::tail -> // what goes here?
```

Now that we’ve deconstructed the list, we can now use the func parameter with the head element. If the value satisfies the func parameter, then we want to add the head element to the list of results and continue processing the rest of the list. To do that, we can use recursion to call back into filter with the same func parameter and the rest of the list:

```fsharp
let rec filter (func:int->bool) (values:int List) =
    match values with
    | [] -> []
    | head::tail -> 
         if func head then head :: filter func tail
```

At this point, we need to handle the case where the head element does not satisfy the func parameter. In this case, we should not add the element to the list of results and we should let filter continue the work

```fsharp
let rec filter (func:int->bool) (values:int List) =
    match values with
    | [] -> []
    | head::tail -> 
         if func head then head :: filter func tail
         else filter func tail
```

By handling the base case first (an empty list), filter can focus on the current element in the list (head) and then recurse to process the rest of the list. This solution works, but we can make this better by removing the type annotations. Interestingly enough, we don’t care if we’re working with integers, strings, or whatever. Just as long as the function takes some type and returns bool and the list of values matches the same type as the func parameter, it works. So then we end up with the following:

```fsharp
let rec filter func values =
    match values with
    | [] -> []
    | head::tail -> if func head then head :: filter func tail else filter func tail
```

In general, when working with lists, I tend to start by matching the list with either an empty list or non-empty. From there, I’ve got my base case, so I can focus on the implementation for the first element. After performing the work for the first element, I can then recurse to the next element.