---
draft: false
date: 2023-10-23
authors:
  - cameronpresley
description: >
  Scaling Effectiveness with Docs - Finding Stale Docs
categories:
  - Process
  - TypeScript
hide:
  - toc
---

# Scaling Effectiveness with Docs - Finding Stale Docs

In a [previous post](../posts/scaling-effectiveness-with-docs.md), I argued that to help your team be effective, you need to have up-to-date docs, and to have this happen, you need some way of flagging stale documentation.

In this series, I show you how you can automate this process by creating a _seed_ script, a _check_ script, and then automating the _check_ script. In today's post, let's develop the _check_ script.

## Breaking Down the Check Script

At a high level, our script will need to perform the following steps:

1. Specify the location to search.
1. Find all the markdown files in directory.
1. Get the "Last Reviewed" line of text.
1. Check if the date is more than 90 days in the past.
1. If so, print the file to the screen.

## Specifying Location

Our script is going to search over our repository, however, I don't want our script to be responsible for cloning and cleaning up those files. Since the long term plan is for our script to run through GitHub Actions, we can have the pipeline be responsible for cloning the repo.

This means that our script will have to be told where to search and since it can't take in manual input, we're going to use an _environment variable_ to tell the script where to search.

First, let's create a `.env` file that will store the path of the repository:

```sh title=".env"
REPO_DIRECTORY="ABSOLUTE PATH GOES HERE"
```

From there, we can start working on our script to have it use this environment variable.

```ts title="index.ts"
import { load } from "https://deno.land/std@0.195.0/dotenv/mod.ts";

await load({ export: true }); // this loads the env file into our environment

const directory = Deno.env.get("REPO_DIRECTORY");

if (!directory) {
  console.log("Couldn't retrieve the REPO_DIRECTORY value from environment.");
  Deno.exit();
}
console.log(directory);
```

If we were to run our Deno script with the following command `deno run --allow-read --allow-env ./index.ts`, we should see the environment variable getting logged.

## Finding all the Markdown Files

Now that we have a directory, we need a way to get all the markdown files from that location.

Doing some digging, I didn't find a built-in library for doing this, but building our own isn't too terrible.

By using [`Deno.readDir/Sync`](https://deno.land/api@v1.36.1?s=Deno.readDirSync), we can get all the entries in the specified directory.

From here, we can then [recurse](https://en.wikipedia.org/wiki/Recursion_%28computer_science%29#Recursive_functions_and_algorithms) into the other folders and get their markdown files as well.

Let's create a new file, `utility.ts` and add a new function, `getMarkdownFilesFromDirectory`

```ts title="utility.ts"
export function getMarkdownFilesFromDirectory(directory: string): string[] {
  // let's get all the files from the directory
  const allEntries: Deno.DirEntry[] = Array.from(Deno.readDirSync(directory));

  // Get all the markdown files in the current directory
  const markdownFiles = allEntries.filter(
    (x) => x.isFile && x.name.endsWith(".md")
  );
  // Find all the folders in the directory
  const folders = allEntries.filter(
    (x) => x.isDirectory && !x.name.startsWith(".")
  );
  // Recurse into each folder and get their markdown files
  const subFiles = folders.flatMap((x) =>
    getMarkdownFilesFromDirectory(`${directory}/${x.name}`)
  );
  // Return the markdown files in the current directory and the markdown files in the children directories
  return markdownFiles.map((x) => `${directory}/${x.name}`).concat(subFiles);
}
```

With this function in place, we can update our `index.ts` script to be the following:

```ts title="index.ts"
import { load } from "https://deno.land/std@0.195.0/dotenv/mod.ts";
import { getMarkdownFilesFromDirectory } from "./utility.ts";

const directory = Deno.env.get("REPO_DIRECTORY");

if (!directory) {
  console.log("Couldn't retrieve the REPO_DIRECTORY value from environment.");
  Deno.exit();
}

const files = getMarkdownFilesFromDirectory(directory);
console.log(files);
```

Running the script with `deno run --allow-read --allow-env ./index.ts`, should get a list of all the markdown files being printed to the screen.

## Getting the Last Reviewed Text

Now that we have each file, we need a way to get their last line of text.

Using [Deno.readTextFile/Sync](), we can get the file contents. From there, we can convert them to lines and then find the latest occurrence of _Last Reviewed_

Let's add a new function, `getLastReviewedLine` to the `utility.ts` file.

```ts title="utility.ts"
export function getLastReviewedLine(fullPath: string): string {
  // Get the contents of the file, removing extra whitespace and blank lines
  const fileContent = Deno.readTextFileSync(fullPath).trim();

  // Convert block of text to a array of strings
  const lines = fileContent.split("\n");

  // Find the last line that starts with Last Reviewed On
  const lastReviewed = lines.findLast((x) => x.startsWith("Last Reviewed On"));

  // If we found it, return the line, otherwise, return an empty string
  return lastReviewed ?? "";
}
```

Let's try this function out by modifying our `index.ts` file to display files that don't have a Last Reviewed On line.

```ts title="index.ts"
import { load } from "https://deno.land/std@0.195.0/dotenv/mod.ts";
import {
  getMarkdownFilesFromDirectory,
  getLastReviewedLine,
} from "./utility.ts";

const directory = Deno.env.get("REPO_DIRECTORY");

if (!directory) {
  console.log("Couldn't retrieve the REPO_DIRECTORY value from environment.");
  Deno.exit();
}

const files = getMarkdownFilesFromDirectory(directory);
files
  .filter((x) => getLastReviewedLine(x) !== "")
  .forEach((s) => console.log(s)); // print them to the screen
```

### Determining If A Page Is Stale

At this point, we can get the "Last Reviewed On" line from a file, but we've got some more business rules to implement.

- If there's a _Last Reviewed On_ line, but there's no date, then the files needs to be reviewed
- If there's a _Last Reviewed On_ line, but the date is invalid, then the file needs to be reviewed
- If there's a _Last Reviewed On_ line, and the date is more than 90 days old, then the file needs to be reviewed.
- Otherwise, the file doesn't need review.

We know from our filter logic that we're only going to be looking at lines that start with "Last Reviewed On", so now we need to extract the date.

Since we assume our format is _Last Reviewed On_, we can use substring to get the rest of the line. We're also going to assume that the date will be in YYYY/MM/DD format.

```ts title="utility.ts"
export function doesFileNeedReview(line: string): boolean {
  if (!line.startsWith("Last Reviewed On: ")) {
    return true;
  }
  const date = line.replace("Last Reviewed On: ", "").trim();
  const parsedDate = new Date(Date.parse(date));
  if (!parsedDate) {
    return true;
  }

  // We could something like DayJS, but trying to keep libraries to a minimum, we can do the following
  const cutOffDate = new Date(new Date().setDate(new Date().getDate() - 90));

  return parsedDate < cutOffDate;
}
```

Let's update our `index.ts` file to use the new function.

```ts title="index.ts"
import { load } from "https://deno.land/std@0.195.0/dotenv/mod.ts";
import {
  getMarkdownFilesFromDirectory,
  getLastReviewedLine,
} from "./utility.ts";

const directory = Deno.env.get("REPO_DIRECTORY");

if (!directory) {
  console.log("Couldn't retrieve the REPO_DIRECTORY value from environment.");
  Deno.exit();
}

getMarkdownFilesFromDirectory(directory)
  .filter((x) => getLastReviewedLine(x) !== "")
  .filter((x) => doesFileNeedReview(x))
  .forEach((s) => console.log(s)); // print them to the screen
```

And just like that, we're able to print stale docs to the screen. At this point, you could create a scheduled batch job and start using this script.

However, if you wanted to share this with others (and have this run not on your box), then stay tuned for the final post in this series where we put this into a GitHub Action and post a message to Slack!

## Other Posts In The Series

- [Having Coffee with Deno - Inspiration](./having-coffee-with-deno-part1.md)
- [Having Coffee with Deno - Dynamic Names](./having-coffee-with-deno-part2.md)
- [Having Coffee with Deno - Sharing the News](./having-coffee-with-deno-part3.md)
- [Having Coffee with Deno - Automating All the Things](./having-coffee-with-deno-part4.md)
