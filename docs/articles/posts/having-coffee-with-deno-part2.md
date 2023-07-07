---
draft: false
date: 2023-07-10
authors:
  - cameronpresley
description: >
  Having Coffee With Deno - Dynamic Names
categories:
  - Typescript
hide:
  - toc
---

# Having Coffee with Deno - Dynamic Names

Welcome to the second installment of our Deno series, where we build a script that pairs up people for coffee.

In the [last post](./having-coffee-with-deno-part1.md), we built a script that helped the Justice League meet up for coffee.

As of right now, our script looks like the following.

```ts title="index.ts"
const names = [
  "Batman",
  "Superman",
  "Green Lantern",
  "Wonder Woman",
  "Static Shock", // one of my favorite DC heroes!
  "The Flash",
  "Aquaman",
  "Martian Manhunter",
];
const pairs = createPairsFrom(shuffle(names));
const message = createMessage(pairs);
console.log(message);

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
type Pair<T> = { first: T; second: T; third?: T };
function createPairsFrom<T>(items: T[]): Pair<T>[] {
  if (items.length < 2) {
    return [];
  }
  const results = [];
  for (let i = 0; i <= items.length - 2; i += 2) {
    const pair: Pair = { first: items[i], second: items[i + 1] };
    results.push(pair);
  }
  if (items.length % 2 === 1) {
    results[results.length - 1].third = items[items.length - 1];
  }
  return results;
}
function createMessage(pairs: Pair<string>[]): string {
  const mapper = (p: Pair<string>) =>
    `${p.first} meets with ${p.second}${p.third ? ` and ${p.third}` : ""}`;

  return pairs.map(mapper).join("\n");
}
```

Even though this approach works, the major problem is that every time there's a member change in the Justice League (which seems to happen more often than not), we have to go back and update the list manually.

It'd be better if we could get this list dynamically instead. Given that the League are great developers, they have their own GitHub organization. Let's work on integrating with GitHub's API to get the list of names.

## The Approach

To get the list of names from GitHub, we'll need to do the following.

1. First, we need to figure out which GitHub endpoint will give us the members of the League. This, in turn, will also tell us what permissions we need for our API scope.
1. Now that we have a secret, we need to update our script to read from an `.env` file.
1. Once we have the secret being read, we can create a function to retrieve the members of the League.
1. Miscellaneous refactoring of the main script to handle a function returning complex types instead of strings.

![Justice League Planning](https://cdn.vox-cdn.com/uploads/chorus_asset/file/6221845/Screen_Shot_2016-03-21_at_12.08.04_PM.0.png){width=300%}

## Laying the Foundation

Before we start, we should reactor our current file. It works, but we have a mix of utility functions (`shuffle` and `createPairsFrom`) combined with presentation functions (`createMessage`). Let's go ahead and move `shuffle` and `createPairsFrom` to their own module.

```ts title="utility.ts"
type Pair<T> = { first: T; second: T; third?: T };

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createPairsFrom<T>(items: T[]): Pair<T>[] {
  if (items.length < 2) {
    return [];
  }
  const results: Pair<T>[] = [];
  for (let i = 0; i <= items.length - 2; i += 2) {
    const pair: Pair<T> = { first: items[i], second: items[i + 1] };
    results.push(pair);
  }
  if (items.length % 2 === 1) {
    results[results.length - 1].third = items[items.length - 1];
  }
  return results;
}

export { createPairsFrom, shuffle };
export type { Pair };
```

With these changes, we can update `index.ts` to be:

```ts title="index.ts" hl_lines="1"
import { Pair, createPairsFrom, shuffle } from "./module.ts";

const names = [
  "Batman",
  "Superman",
  "Green Lantern",
  "Wonder Woman",
  "Static Shock", // one of my favorite DC heroes!
  "The Flash",
  "Aquaman",
  "Martian Manhunter",
];
const pairs = createPairsFrom(shuffle(names));
const message = createMessage(pairs);
console.log(message);

function createMessage(pairs: Pair<string>[]): string {
  const mapper = (p: Pair<string>) =>
    `${p.first} meets with ${p.second}${p.third ? ` and ${p.third}` : ""}`;

  return pairs.map(mapper).join("\n");
}
```

## Getting GitHub

Now that our code is more tidy, we can focus on figuring out which GitHub endpoint(s) to use to figure out the members of the Justice League.

Taking a look at the [docs](https://docs.github.com/en/rest?apiVersion=2022-11-28), we see that there are two different options.

1. [Get members of an Organization](https://docs.github.com/en/rest/orgs/members?apiVersion=2022-11-28#list-organization-members)
1. [Get members of a Team](https://docs.github.com/en/rest/teams/members?apiVersion=2022-11-28#list-team-members)

What's the difference between the two? In GitHub parlance, an [_Organization_](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations#about-organizations) is an overarching entity that consists of members which, in turn, can be part of multiple teams.

Using the Justice League as an example, it's an organization that contains Batman, and Batman can be part of the _Justice League Founding Team_ and a member of the _Batfamily Team_.

Since we want to pair everyone up in the Justice League, we'll use the _Get members of an Organization_ approach.

## Working with Secrets

To interact with the endpoint, we'll need to create an API token for GitHub. Looking over the docs, our token needs to have the `read:org` scope. We can create this token by following the instructions [here about creating a Personal Auth Token (PAT)](https://docs.github.com/en/rest/overview/authenticating-to-the-rest-api?apiVersion=2022-11-28#authenticating-with-a-personal-access-token).

Once we have the token, we can invoke the endpoint with cURL or Postman to verify that we can communicate with the endpoint correctly.

After we've verified, we'll need a way to get this API token into our script. Given that this is sensitive information, we absolutely should **NOT** check this into the source code.

### Creating an ENV File
A common way of dealing with that is to use an _.env_ file which doesn't get checked in, but our application can use it during runtime to get secrets.

Let's go ahead and create the `.env` file and put our API token here.

```txt title=".env"
GITHUB_BEARER_TOKEN="INSERT_TOKEN_HERE"
```

Our problem now is that if we check `git status`, we'll see this file listed as a change. We don't want to check this in, so let's add a `.gitignore` file.

### Adding a .gitignore File

With the `.env` file created, we need to create a [.gitignore](https://git-scm.com/docs/gitignore#_description) file, which tells Git not to check in certain files.

Let's go ahead and add the file. You can enter the below, or you can use the Node gitignore file (found [here](https://github.com/github/gitignore/blob/main/Node.gitignore))

```gitignore title=".gitignore"
.env # ignores all .env files in the root directory
```

We can validate that we've done this correctly if we run `git status` and don't see `.env` showing up anymore as a changed file.

### Loading Our Env File

Now that we have the file created, we need to make sure that this file loads at runtime.

In our `index.ts` file, let's make the following changes.

```ts title="index.ts"
import { config as loadEnv } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
// other imports

// This loads the .env file and adds them to the environment variable list
await loadEnv({export: true});
// Deno.env.get("name") retrieves the value from an environment variable named "name"
console.log(Deno.env.get("GITHUB_BEARER_TOKEN"));

// remaining code
```

When we run the script now with `deno run`, we get an interesting prompt:

<blockquote>
Deno requests read access to ".env".
<br />
- Requested by `Deno.readFileSync()` API.
<br />
- <i>Run again with --allow-read to bypass this prompt</i>
<br />
- Allow?
<br />
</blockquote>

This is one of the coolest parts about Deno; it has a security system that prevents scripts from doing something that you hadn't intended through its [Permissions](https://deno.land/manual@v1.33.4/basics/permissions) framework.

For example, if you weren't expecting your script to read from the `env` file, it'll prompt you to accept. [Since packages can be taken over and updated to do nefarious things, this is a terrific idea](https://jfrog.com/blog/npm-package-hijacking-through-domain-takeover-how-bad-is-this-new-attack/).

The permissions can be tuned (e.g., you're only allowed to read from the .env file), or you can give blanket permissions. In our cases, two resources are being used (the ability to read the `.env` file and the ability to read the `GITHUB_BEARER_TOKEN` environment variable).

Let's run the command with the `allow-read` and `allow-env` flags.

`deno run --allow-run --allow-env ./index.ts`

If the bearer token gets printed, we've got the `.env` file created correctly and can proceed to the next step.

## Let's Get Dynamic

Now that we have the bearer token, we can work on calling the GitHub Organization endpoint to retrieve the members.

Since this is GitHub related, we should create a new file, `github.ts`, to host our functions and types.

### Adding axiod

In the `github.ts` file, we're going to be use [axiod](https://deno.land/x/axiod@0.26.2) for communication. It's similar to axios in Node and is better than then the built-in fetch API.

Let's go ahead and bring in the import.

```ts title="github.ts"
import axiod from "https://deno.land/x/axiod@0.26.2/mod.ts";
```

### Calling the Organization Endpoint

With `axiod` pulled in, let's write the function to interact with the GitHub API.

```ts title="github.ts"
// Brining in the axiod library
import axiod from "https://deno.land/x/axiod@0.26.2/mod.ts";

async function getMembersOfOrganization(orgName: string): Promise<any[]> {
  const url = `https://api.github.com/orgs/${orgName}/members`;
  // Necessary headers are found on the API docs
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${Deno.env.get("GITHUB_BEARER_TOKEN")}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    const resp = await axiod.get<any[]>(url, {
      headers: headers,
    });
    return resp.data;
  } catch (error) {
    // Response was received, but non-2xx status code
    if (error.response) {
      return Promise.reject(
        `Failed to get members: ${error.response.status}, ${error.response.statusText}`
      );
    } else {
      // Response wasn't received
      return Promise.reject(
        "Failed for non status reason " + JSON.stringify(error)
      );
    }
  }
}
```

To prove this is working, we can call this function in the `index.ts` file and verify that we're getting a response.

```ts title="index.ts" hl_lines="2 7 8"
import { config as loadEnv } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { getMembersOfOrganization } from "./github.ts";
import { Pair, createPairsFrom, shuffle } from "./utility.ts";

await loadEnv({ export: true });

const membersOfOrganization = await getMembersOfOrganization('JusticeLeague');
console.log(JSON.stringify(membersOfOrganization));
// rest of the file
```

Now let's rerun the script.

```sh
deno run --allow-read --allow-env ./main.ts
```

<blockquote>
Deno requests net access to "api.github.com"
<br />
- Requested by `fetch` API.
<br />
- <i>Run again with --allow-net to bypass this prompt.</i>
</blockquote>

Ah! Our script is now doing something new (making network calls), so we'll need to allow that permission by using the `--allow-net` flag.

```sh
deno run --allow-read --allow-env --allow-net ./main.ts
```

If everything has worked, you should see a bunch of JSON printed to the screen. Success!

### Creating the Response Type

At this point, we're making the call, but we're using a pesky `any` for the response, which works, but it doesn't help us with what properties we have to work with.

Looking at the [response schema](https://docs.github.com/en/rest/orgs/members?apiVersion=2022-11-28#list-organization-members), it seems the main field we need is `login`. So let's go ahead and create a type that includes that field.

```ts title="github.ts"
type GetOrganizationMemberResponse = {
  login: string
};

async function getMembersOfOrganization(orgName: string): Promise<GetOrganizationMemberResponse[]> {
  //code
  const resp = await axiod.get<GetOrganizationMemberResponse[]>
  (url, {headers:headers});
  // rest of the code
}
```

We can rerun our code and verify that everything is still working, but now with better type safety.

## Cleaning Up
Now that we have this function written, we can work to integrate it with our `index.ts` script.

```ts title="index.ts" hl_lines="5"
import { config as loadEnv } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { getMembersOfOrganization } from "./github.ts";
import { Pair, createPairsFrom, shuffle } from "./utility.ts";

await loadEnv({ export: true });

const names = await getMembersOfOrganization("JusticeLeague");
const pairs = createPairsFrom(shuffle(names));
const message = createMessage(pairs);
console.log(message);
```

So far, so good. The only change we had to make was to replace the hardcoded array of names with the call to `getMembersOfOrganization`.

Not an issue, right?

Hmmm, what's up with this?
![createMessage has a type error](../images/deno-part-two-createMessage.png)

It looks like `createMessage` is expecting `Pair<string>[]`, but is receiving `Pair<GetOrganizationMemberResponse>[]`.

To solve this problem, we'll modify `createMessage` to work with `GetOrganizationMemberResponse`.

```ts title="index.ts"
// Need to update the input to be Pair<GetOrganizationMemberResponse>
function createMessage(pairs: Pair<GetOrganizationMemberResponse>[]): string {
  // Need to update mapper function to get the login property
  const mapper = (p: Pair<string>): string =>
    `${p.first.login} meets with ${p.second.login}${
      p.third ? ` and ${p.third.login}` : ""
    }`;

  return pairs.map(mapper).join("\n");
}
```

With this last change, we run the script and verify that we're getting the correct output, huzzah!

## Current Status

Congratulations! We now have a script that is dynamically pulling in heroes from the Justice League organization instead of always needing to see if Green Lantern is somewhere else or if another member of Flash's SpeedForce is here for the moment.

A working version of the code can be found on [GitHub](https://github.com/cameronpresley/random-coffee).
