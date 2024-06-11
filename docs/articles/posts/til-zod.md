---
draft: false
date: 2024-06-13
authors:
  - cameronpresley
description: >
  TIL - Validating Data Using Zod

categories:
  - TypeScript
  - Today I Learned

hide:
  - toc
---

# Today I Learned: Validating Data in Zod

Validating input. You've got to do it, otherwise, you're going to be processing garbage, and that never goes well, right?

Whether it's through the front-end (via a form) or through the back-end (via an API call), it's important to make sure that the data we're processing is valid.

Coming from a C# background, I was used to ASP.NET Web Api's ability to create a class and then use the [`FromBody attribute`](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-8.0#frombody-attribute) for the appropriate route to ensure the data is good. By using this approach, ASP.NET will reject requests automatically that don't fit the data contract.

However, picking up JavaScript and TypeScript, that's not the case. At first, this surprised me because I figured that this would automatically happen when using libraries like Express or Nest.js. Thinking more about it, though, it shouldn't have surprised me. ASP.NET can catch those issues because it's a statically typed/ran language. JavaScript isn't and since TypeScript types are removed during the compilation phase, neither is statically typed at _runtime_.

When writing validations, I find [zod](https://github.com/colinhacks/zod) to be a delightful library to leverage. There are a ton of useful built-in options, you can create your own validators (which you can then compose!) and you can infer models based off of your validations.

## Building the Amazin' Bookstore

To demonstrate some of the cool things that you can do with Zod, let's pretend that we're building out a new POST endpoint for creating a new book. After talking to the business, we determine that the payload for a new book should look like this:

```ts
// A valid book will have the following
// - A non-empty title
// - A numeric price (can't be negative or zero)
// - A genre from a list of possibilities (mystery, fantasy, history are examples, platypus would not be valid)
// - An ISBN which must be in a particular format
// - A valid author which must have a first name, a last name, and an optional middle name
```

### What's in a Name?

Since the `Book` type needs a valid `Author`, let's build that out first:

```ts
import {z} from "zod";

export const AuthorSchema = z.object({
    
});

```

Since `Author` will need to be an object, we'll use `z.object` to signify that. Right off the bat, this prevents a string, number, or other primitive types from being accepted.

```ts
AuthorSchema.safeParse("someString"); // will result in a failure
AuthorSchema.safeParse(42); // will result in a failure
AuthorSchema.safeParse({}); // will result in success!
```

This is a great start, but we know that Author has some required properties (like a first name), so let's implement that by using `z.string()`

```ts
export const AuthorSchema = z.object({
    firstName: z.string()
});
```

With this change, let's take a look at our schema validation

```ts
AuthorSchema.safeParse({}); // fails because no firstName property
AuthorSchema.safeParse({firstName:42}); // fails because firstName is not a string
AuthorSchema.safeParse({firstName: "Cameron"}); // succeeds because firstName is present and a string
```

However, there's one problem with our validation. We would allow an empty `firstName`

```ts
AuthorSchema.safeParse({firstName:""}); // succeeds, but should have failed :(
```

To make our validation stronger, we can update our `firstName` property to have a minimum length of 1 like so.

```ts
export const AuthorSchema = z.object({
    firstName: z.string().min(1)
});
```

Finally, we have a way to enforce that an author has a non-empty firstName!. Looking at the requirements, it seems like `lastName` is going to be similar, so let's update our `AuthorSchema` to include lastName.

```ts
export const AuthorSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1)
});
```

Hmmm, it looks like we have the same concept in multiple places, the idea of a non empty string. Let's refactor that to its own schema.

```ts
export const NonEmptyStringSchema = z.string().min(1);

export const AuthorSchema = z.object({
    firstName: NonEmptyStringSchema,
    lastName: NonEmptyStringSchema
});
```

Nice! We're almost done with `Author`, we need to implement `middleName`. Unlike the other properties, an author may not have a middle name. In this case, we're going to leverage the `optional` function from zod to signify that as so.

```ts
export const NonEmptyStringSchema = z.string().min(1);

export const AuthorSchema = z.object({
    firstName: NonEmptyStringSchema,
    lastName: NonEmptyStringSchema,
    // This would read that middleName may or not may be present. 
    // If it is, then it must be a string (could be empty)
    middleName: z.string().optional(), 
});
```

With the implementation of `AuthorSchema`, we can start working on the `BookSchema`.

### Judging a Book By It's Cover

Since we have `AuthorSchema`, we can use that as our start as so:

```ts
export const BookSchema = z.object({
    author: AuthorSchema
});
```

We know that a book must have a non-empty title, so let's add that to our definition. Since it's a string that must have at least one character, we can reuse the `NonEmptyStringSchema` definition from before.

```ts
export const BookSchema = z.object({
    author: AuthorSchema,
    title: NonEmptyStringSchema
});
```

### Putting a Price on Knowledge

With title in place, let's leave the string theory alone for a bit and look at numbers. In order for the bookstore to function, we've got sell books for some price. Let's use `z.number()` and add a `price` property.

```ts
export const BookSchema = z.object({
    author: AuthorSchema,
    title: NonEmptyStringSchema,
    price: z.number()
});
```

This works, however, `z.number()` will accept _any_ number, which includes numbers like `0` and `-5`. While those values would be great for the customer, we can't run our business that way. So let's update our price to only include positive numbers, which can be accomplished by leveraging the `positive` function.

```ts
export const BookSchema = z.object({
    author: AuthorSchema,
    title: NonEmptyStringSchema,
    price: z.number().positive()
});
```

With price done, let's look at validating the genre.

### Would You Say It's a Mystery or History?

Up to this point, all of our properties have been straightforward (simple strings and numbers). However, with `genre`, things get more complicated because it can only be one of a particular set of values. Thankfully, we can define a `GenreSchema` by using `z.enum()` like so. 

```ts
export const GenreSchema = z.enum(["Fantasy", "History", "Mystery"]);
```

With this definition, a valid genre can _only be_ fantasy, history, or mystery. Let's update our book definition to use this new schema.

```ts
export const BookSchema = z.object({
    author: AuthorSchema,
    title: NonEmptyStringSchema,
    price: z.number().positive(),
    genre: GenreSchema
});
```

Now, someone can't POST a book with a genre of "platypus" (though I'd enjoy reading such a book).

### ID Please

Last, let's take a look at implementing the `isbn` property. This is interesting because ISBNs can be in one of two shapes: ISBN-10 (for books pre-2007) and ISBN-13 (all other books).

To make this problem easier, let's focus on the ISBN-10 format for now. A valid value will be in the form of `#-###-#####-#` (where # is a number). Now, you can [take this a whole lot further](https://en.wikipedia.org/wiki/ISBN#ISBN-10_check_digit_calculation), but we'll keep on the format.

Now, even though `zod` has built-in validators for emails, ips, and urls, there's not a built-in one for ISBNs. In these cases, we can use `.refine` to add our logic. But this is a good use case for a basic regular expression. Using [regex101](https://regex101.com/) as a guide, we end up with the following expression and schema for the ISBN.

```ts
const isbn10Regex = /^\d-\d{3}-\d{5}-\d/;
export const Isbn10Schema = z.string().regex(isbn10Regex);
```

Building onto that, an ISBN-13 is in a similar format, but has the form of `###-#-##-######-#`. By tweaking our regex, we end up with the following:

```ts
const isbn13Regex = /^\d{3}-\d-\d{2}-\d{6}-\d/;
export const Isbn13Schema = z.string().regex(isbn13Regex);
```

When modeling types in TypeScript, I'd like to be able to do something like the following as this makes it clear that an ISBN can in one of these two shapes.

```ts
type Isbn10 = string;
type Isbn13 = string;
type Isbn = Isbn10 | Isbn13;
```

While we can't use the `|` operator, we can use the `.or` function from zod to have the following

```ts
const isbn10Regex = /^\d-\d{3}-\d{5}-\d/;
export const Isbn10Schema = z.string().regex(isbn10Regex);
const isbn13Regex = /^\d{3}-\d-\d{2}-\d{6}-\d/;
export const Isbn13Schema = z.string().regex(isbn13Regex);

export const IsbnSchema = Isbn10Schema.or(Isbn13Schema);
```

With the `IsbnSchema` in place, let's add it to `BookSchema`

```ts
export const BookSchema = z.object({
    author: AuthorSchema,
    title: NonEmptyStringSchema,
    price: z.number().positive(),
    genre: GenreSchema
    isbn: IsbnSchema
});
```

### Getting Models for Free

Lastly, one of the cooler functions that zod supports is `infer` where if you pass it a schema, it can build out a type for you to use in your application. 

```ts
export const BookSchema = z.object({
    author: AuthorSchema,
    title: NonEmptyStringSchema,
    price: z.number().positive(),
    genre: GenreSchema
    isbn: IsbnSchema
});

// TypeScript knows that Book must have an author (which has a firstName, lastName, and maybe a middleName)
// a title (string), a price (number), a genre (string), and an isbn (string).
export type Book = z.infer<typeof BookSchema>; 
```

## Full Solution

Here's what the full solution looks like

```ts
const NonEmptyStringSchema = z.string().min(1);
const GenreSchema = z.enum(["Fantasy", "History", "Mystery"]);

export const AuthorSchema = z.object({
  firstName: NonEmptyString,
  lastName: NonEmptyString,
  middleName: z.string().optional(),
});

export const Isbn10Schema = z.string().regex(/^\d-\d{2}-\d{6}-\d/);
export const Isbn13Schema = z.string().regex(/^\d{3}-\d-\d{2}-\d{6}-\d/);
export const IsbnSchema = Isbn10Schema.or(Isbn13Schema);

export const BookSchema = z.object({
  title: NonEmptyString,
  author: AuthorSchema,
  price: z.number().positive(),
  genre: GenreSchema,
  isbn: IsbnSchema,
});

export type Book = z.infer<typeof BookSchema>;
```

With these schemas and models defined, we can leverage the `safeParse` function to see if our input is valid.

```ts
describe('when validating a book', () => {
    it("and the author is missing, then it's not valid", () => {
        const input = {title:"best book", price:200, genre:"History", isbn:"1-23-456789-0"}

        const result = BookSchema.safeParse(input);

        expect(result.success).toBe(false);
    });
    it("and all the fields are valid, then the book is valid", () => {
        const input = {
            title:"best book", 
            price:200, 
            genre:"History", 
            isbn:"1-23-456789-0", 
            author: {
                firstName:"Super", 
                middleName:"Cool", 
                lastName:"Author"
            }
        };

        const result = BookSchema.safeParse(input);

        expect(result.success).toBe(true);
        const book:Book = result.data as Book;
        // now we can start using properties from book
        expect(book.title).toBe("best book");
    });
});
```
