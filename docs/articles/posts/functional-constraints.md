---
draft: false
date: 2015-10-20
authors: 
  - cameronpresley
description: >
  Using F# for Constraint Solving

categories:
  - Functional

hide:
  - toc
---

# Using F# To Solve a Constraints Problem

In this post, I’m going to solve a logic puzzle using C# and F#. First, I’ll define the problem being solved and what our restrictions are. Next, I’ll show how I’d break down the problem and write an easy-to-read, extendable solution using idiomatic C#. Afterwards, I’ll solve the same problem and write an easy-to-read, extendable solution writing in idiomatic F#. Finally, we’ll compare the two solutions and see why the F# solution is the better solution.

## The Problem
For this problem, I’m going to write a constraint solver (thanks to [Geoff Mazeroff](https://geoffmazeroff.com/) for the inspiration).

If you’re not familiar with the concept, a constraint is simply some rule that must be followed (such as all numbers must start with a 4). So a constraint solver is something that takes all the constraints and a source of inputs and returns all values that fit all the constraints.

With that being said, our source will be a list of positive integers and our constraints are the following:

- 4 digits long (so 1000 – 9999)
- Must be even (so 1000, 1002, 1004, etc…)
- The first digit must match the last digit (2002, 2012, 2022, etc…)

To further restrict solutions, all code will be production ready. This includes handling error conditions (like input being null), being maintainable (easily adding more constraints) and easy to read.

To quickly summarize, we need to find a robust, maintainable, and readable solution to help us find all 4 digit number that are even and that the first and last digit are equal.

## Implementing a Solution in C#

For the C# solution, I’m going to need a class for every constraint, a class to execute all constraints against a source (positive integers) and a runner that ties all the pieces together.

Starting with the smaller blocks and building up, I’m going to start with the constraint classes. Each constraint is going to take a single number and will return true if the number follows the constraint, false otherwise.

With that being said, I’d first implement the constraint that all numbers must be 4 digits long

```csharp
class MustBeFourDigitsLongConstraint
{
    public bool FollowsConstraint(int value)
    {
        return value.ToString().Length == 4;
    }
}
```

Second, I’d write the constraint that all numbers must be even

```csharp
class MustBeEvenConstraint
{
    public bool FollowsConstraint(int value)
    {
        return value % 2 == 0;
    }
}
```

Third, I’d implement the constraint that all numbers must have the same first digit and the last digit

```csharp
class FirstDigitMustEqualLastDigitConstraint
{
    public bool FollowsConstraint(int value)
    {
        var valueString = value.ToString();
        return valueString[0] == valueString[valueString.Length-1];
    }
}
```

At this point, I have the constraints written, but I need them to follow a general contract so that the **Constraint Solver** (about to be defined) can take a list of these constraints. I’ll introduce an interface, **IConstraint** and update my classes to implement that interface.

```csharp
public interface IConstraint
{
    bool FollowsConstraint(int value);
}
class MustBeFourDigitsLongConstraint : IConstraint {/* Implementation Details Omitted */}

class MustBeEvenConstraint : IConstraint {/* Implementation Details Omitted */}

class FirstDigitMustEqualLastDigitConstraint : IConstraint {/* Implementation Details Omitted */}
```

So now I have the constraints defined and they’re now implementing a uniform interface, I can now create the constraint solver. This class is responsible for taking the list of numbers and the list of constraints and then returning a list of numbers that follow all constraints.

```csharp
class ConstraintSolver
{
    public List FindValues(List constraints, List values)
    {
        if (constraints == null) throw new ArgumentNullException("constraints");
        if (values == null) throw new ArgumentNullException("values");
        
        var result = values;
        foreach (var constraint in constraints)
        {
            result = result.Where(x => constraint.FollowsConstraint(x)).ToList();
        }
        return result;
    }
}
```

Finally, I can put all the pieces together using LINQPad (Full C# solution can be found here).

```csharp
void Main()
{
    var numbers = Enumerable.Range(0, 10000).ToList();
    var constraints = new List<IConstraint>{new MustBeFourDigitsLongConstraint(), new MustBeEvenConstraint(), 
             new FirstDigitMustEqualLastDigitConstraint()};
    
    var constraintSolver = new ConstraintSolver();
    var result = constraintSolver.FindValues(constraints, numbers.ToList());
    
    result.Dump();
}
```

This solution is easily extendable because if we need to add another constraint, we just add another class that implements the IConstraint interface and change the Main method to add an instance of the new constraint to the list of constraints.

## Implementing a Solution in F#
Now that we have the C# solution, let’s take a look at how I would solve the problem using F#.

Similar to the C# solution, I’m going to create a function for every constraint, a function to execute all constraints against a source (positive integers) and a runner that ties all the pieces together.

Also similar to the C# solution, I’m going to start with creating the constraints and then work on the constraint solver function.

First, I’d implement that the number must be four digits long constraint.

```fsharp
let mustBeFourDigit number = 
    number.ToString().Length = 4
```

Next, the number must be even constraint.

```fsharp
let mustBeEven number =
    number % 2 = 0
```

Lastly, the first digit is the same as the last digit constraint.

```fsharp
let firstDigitMustBeEqualLast number =
    let numberString = number.ToString().ToCharArray()
    let firstDigit = numberString.GetValue(0)
    let lastDigit = numberString.GetValue(numberString.Length-1)
    firstDigit = lastDigit
```

At this stage in the C# solution, I had to create an interface, **IConstraint**, so that the constraint solver could take a list of constraints. What’s cool with F# is that I don’t have to define the interface. The F# type inference is saying that each of these functions are taking the same input (some generic `a) and returning a bool, so I can add all of them to the list. This is pretty convenient since I don’t have to worry about this piece of plumbing.

Now that the different constraints are defined, I’d go ahead and write the last function that takes a list of constraints and a list of numbers and returns the numbers that the constraints fit. (Confused by this function? Take a look at [Implementing your own version of # List.Filter](./implementing-fsharp-filter.md))

```fsharp
let rec findValidNumbers numbers constraints = 
    match constraints with
    | [] -> numbers
    | firstConstraint::remainingConstraints ->
        let validNumbers = numbers |> List.filter firstConstraint
        findValidNumbers validNumbers remainingConstraints
```

Finally, all the pieces are in place, so I can now put all the pieces together using LINQPad.

```fsharp
let numbers = [1000 .. 9999]
let constraints = [mustBeFourDigits; mustBeEven; firstDigitMustEqualLast;]

let result = findValidNumbers numbers constraints

printf "%A" result
```

## Comparing Both Solutions

Now that we have both solutions written up, let’s compare and see which solution is better.

First, the same design was used for both solutions. I decided to use this design for both because it’s flexible enough that we could add new constraints if needed (such as, the 2nd digit must be odd). As an example, for the C# solution, I’d create a new class that implemented **IConstraint** and then update the runner to use the new class. For the F# solution, I’d create a new function and update the runner. So, I’d think it’s safe to say that both solutions score about the same from a maintainability and extendability point of view.

From an implementation perspective, both solutions are production ready since the code handles possible error conditions (C# with null checks in the **ConstraintSolver** class, F# with none because it doesn’t support null). In addition to being robust, both solutions are readable by using ample whitespace and having all variables, classes, and interfaces clearly described.

With that being said, this is where the similarities end. When we look at how much code was written to solve the problem, we have a stark difference. For the C# solution, I ended up with 48 lines of code (omitting blank lines), however, for the F# solution, it only took 19. Now you could argue that I could have written the C# solution in fewer lines of code by removing curly braces around one line statements or ignoring null inputs. However, this would lead the code to be less robust.

Another difference between the F# solution and C# is that I was able to focus on the solution without having to wire up an interface. You’ll often hear developers talk about the how little plumbing you need for F# to “just work” and this small example demonstrates that point.

Another difference (albeit subtle) is that the F# solution is that I can use the **findValidNumbers** function with any generic list of values and any generic list of functions that take the generic type and return true/false.

In other words, if I had another constraint problem using strings, I’d still implement the different constraints, but I could use the same **findValidNumbers** function. At that point, however, I’d probably rename it to **findValidValues** to signify the generic solution.

What’s awesome about this is that I didn’t have to do any more work to have a generic solution, F# did that for me. To be fair, the C# solution can easily be made generic, but that would have to be a conscious design decision and I think that’s a downside.

## TL;DR
In this post, we took a look at solving a number constraint problem by using idiomatic C# and F#. Even though both solutions are easy to read and easy to extend, the F# version was less than 1/2 the size of the C# solution. In addition, I didn’t have to do any plumbing for the F# version, but had to do some for the C# solution, and to top it off, the F# solution is generically solved, whereas the C# solution is not.