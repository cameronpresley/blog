---
draft: false
date: 2024-05-10
authors:
  - cameronpresley
description: >
  TIL - TypeScript Object Destructure

categories:
  - TypeScript
  - Today I Learned

hide:
  - toc
---

# Today I Learned: Destructure Objects in Function Signatures

When modeling types, one thing to keep in mind is to not leverage [primitive types](https://refactoring.guru/smells/primitive-obsession) for your domain. This comes up when we use a primitive type (like a string) to represent core domain concepts (like a Social Security Number or a Phone Number).

Here's an example where it can become problematic:

```ts
// Definition for Customer
type Customer = {
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string
}

// Function to send an email to customer about a new sale
async function sendEmailToCustomer(c:Customer): Promise<void> {
  const content = "Look at these deals!";

  // Uh oh, we're trying to send an email to a phone number...
  await sendEmail(c.phoneNumber, content);
}

async function sendEmail(email:string, content:string): Promise<void> {
  // logic to send email
}
```

There's a bug in this code, where we're trying to send an email to a phone number. Unfortunately, this code type checks and compiles, so we have to lean on other techniques (automated testing or code reviews) to discover the bug.

Since it's better to find issues earlier in the process, we can make this a compilation error by introducing a new type for `Email` since not all strings should be treated equally.

One approach we can do is to create a [tagged union](https://stackoverflow.com/questions/61646400/difference-union-types-and-discriminated-unions-typescript-f/61649726#61649726) like the following:

```ts
type Email = {
  label:"Email",
  value:string
}
```

With this in place, we can change our `sendEmail` function to leverage the new `Email` type.

```ts
function sendEmail(email:Email, content:string): Promise<void> {
  // logic to send email
}
```

Now, when we get a compilation error when we try passing in a phoneNumber.

![Compilation error that we can't pass a string to an email](./images/til-destructure-error.png)

One downside to this approach is that if you want to get the value from the `Email` type, you need to access it's `value` property. This can be a bit hard to read and keep track of.

```ts
function sendEmail(email:Email, content:string): Promise<void> {
  const address = email.value;
  // logic to send email
}
```

## Leveraging Object Destructuring in Functions

One technique to avoid this is to use destructuring to get the individual properties. This allows us to "throw away" some properties and hold onto the ones we care about. For example, let's say that we wanted only the `phoneNumber` from a `Customer`. We could get that with an assignment like the following:

```ts
const customer: Customer = {
  firstName: "Cameron",
  lastName: "Presley",
  phoneNumber: "555-5555",
  email: {label:"Email", value:"Cameron@domain.com"}
}

const {phoneNumber} = customer; // phoneNumber will be "555-555"
```

This works fine for assignments, but it'd be nice to have this at a function level. Thankfully, we can do that like so:

```ts
// value is the property from Email, we don't have the label to deal with
function sendEmail({value}:Email, content:string): Promise<void> {
  const address = value; // note that we don't have to do .value here
  // logic to send email
}
```

If you find yourself using domain types like this, then this is a handy tool to have in your toolbox.