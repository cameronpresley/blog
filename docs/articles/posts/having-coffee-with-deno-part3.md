---
draft: false
date: 2023-07-24
authors:
  - cameronpresley
description: >
  Having Coffee With Deno - Dynamic Names
categories:
  - TypeScript
hide:
  - toc
---

# Having Coffee with Deno - Sharing the News

Welcome to the third installment of our Deno series, where we build a script that pairs up people for coffee.

In the [last post](./having-coffee-with-deno-part2.md), we're dynamically pulling members of the Justice League from GitHub instead of a hardcoded list.

Like any good project, this approach works, but now the major problem is that we have to run the script, copy the output, and post it into our chat tool so everyone knows the schedule.

It'd be better if we could update our script to post this message instead. In this example, we're going to use [Slack and their incoming webhook](https://api.slack.com/messaging/webhooks#getting_started), but you could easily tweak this approach to work with other tools like [Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook?tabs=dotnet#create-incoming-webhooks-1) or [Discord](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks).

## The Approach

In order to for the script to post to Slack, we'll need to make the following changes:

1. Follow [these docs from Slack](https://api.slack.com/messaging/webhooks#getting_started) to create an application and enable the incoming webhooks.
1. Test that we can post a simple message to the channel
1. From here, we'll need to add code to make a POST call to the webhook with a message
1. Tweak the formatting so it looks nicer

![Justice League Planning](https://cdn.vox-cdn.com/uploads/chorus_asset/file/6221845/Screen_Shot_2016-03-21_at_12.08.04_PM.0.png){width=300%}

## Creating the Slack Application and creating the Webhook

For this step, we'll follow the instructions [in the docs](https://api.slack.com/messaging/webhooks#getting_started), ensuring that we're hooking it up to the right channel.

After following the steps, you should see something like the following:

![Image of Slack App with Incoming Webhook](https://softwarementorblog.blob.core.windows.net/images/deno-slack/slack.png)

We can test that things are working correctly by running the `curl` command provided. If the message `Hello World` appears in the channel, congrats, you've got the incoming webhook created!

## Modifying the Script to POST to Webhook

We have the Slack app created and verified that the incoming webhook is working, so we'll need to add this integration to our script.

Since we have this incoming webhook URL and **Slack recommends treating this as a secret**, we'll need to add this to our `.env` file.

![Keep your webhook ULR safe image](https://softwarementorblog.blob.core.windows.net/images/deno-slack/keep-url-safe.png)

```.env title=".env"
GITHUB_API_TOKEN="<yourTokenHere>"
SLACK_WEBHOOK="<yourWebHookHere>"
```

With this secret added, we can write a new function, `sendMessage`, that'll make the POST call to Slack. Since this is a new integration, we'll add a new file, `slack.ts` to put it in.

```ts title="slack.ts"
// Using axiod for the web connection
import axiod from "https://deno.land/x/axiod@0.26.2/mod.ts";

// function to send a message to the webhook
async function sendMessage(message: string): Promise<void> {
  // Get the webhookUrl from our environment
  const webhookUrl = Deno.env.get("SLACK_WEBHOOK")!;

  try {
    // Send the POST request
    await axiod.post(webhookUrl, message, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Error handling
    if (error.response) {
      return Promise.reject(
        `Failed to post message: ${error.response.status}, ${error.response.statusText}`
      );
    }
    return Promise.reject(
      "Failed for non status reason " + JSON.stringify(error)
    );
  }
}

export { sendMessage };
```

With `sendMessage` done, let's update `index.ts` to use this new functionality.

```ts title="index.ts" hl_lines="6 16 17"
import { load } from "https://deno.land/std@0.195.0/dotenv/mod.ts";
import {
  GetOrganizationMemberResponse,
  getMembersOfOrganization,
} from "./github.ts";
import { sendMessage } from "./slack.ts";
import { Pair, createPairsFrom, shuffle } from "./utility.ts";

await load({ export: true });

// Replace this with your actual organization name
const organizationName = "JusticeLeague";
const names = await getMembersOfOrganization(organizationName);
const pairs = createPairsFrom(shuffle(names));
const message = createMessage(pairs);
// Slack expects the payload to be an object of text, so we're doing that here for now
await sendMessage(JSON.stringify({ text: message }));

function createMessage(pairs: Pair<GetOrganizationMemberResponse>[]): string {
  const mapper = (p: Pair<GetOrganizationMemberResponse>): string =>
    `${p.first.login} meets with ${p.second.login}${
      p.third ? ` and ${p.third.login}` : ""
    }`;
  return pairs.map(mapper).join("\n");
}
```

And if we were to run the above, we can see the following message get sent to Slack.

![Message from Random Coffee](https://softwarementorblog.blob.core.windows.net/images/deno-slack/coffee-post.png)

Nice! We could leave it here, but we could make the message prettier (having an unordered list and italicizing names), so let's work on that next.

### Pretty Printing the Message

So far, we could leave the messaging as is, however; it's a bit muddled. To help it pop, let's make the following changes.

- _Italicize_ the names
- Start each pair with a bullet point

Since [Slack supports basic Markdown in the messages](https://api.slack.com/reference/surfaces/formatting#basics), we can use the `_` for italicizing and `-` for the bullet points. So let's modify the `createMessage` function to add this formatting.

```ts title="index.ts"
function createMessage(pairs: Pair<GetOrganizationMemberResponse>[]): string {
  // Let's wrap each name with the '_' character
  const formatName = (s: string) => `_${s}_`;

  const mapper = (p: Pair<GetOrganizationMemberResponse>): string =>
    // and start each pair with '-'
    `- ${formatName(p.first.login)} meets with ${formatName(p.second.login)}${
      p.third ? ` and ${formatName(p.third.login)}` : ""
    }`;
  return pairs.map(mapper).join("\n");
}
```

By making this small change, we now see the following message:

![Formatted Slack Message with italics and bullets](https://softwarementorblog.blob.core.windows.net/images/deno-slack/formatted-slack-message.png){width:300px}

The messaging is better, but we're still missing some clarity. For example, what date is this for? Or what's the purpose of the message? Looking through [these docs](https://app.slack.com/block-kit-builder/T0432GV8P), it seems like we could add different text blocks (like titles). So let's see what this could look like.

One design approach is to encapsulate the complex logic for dealing with Slack and only expose a "common-sense" API for consumers. In this regard, I think using a [Facade pattern](https://refactoring.guru/design-patterns/facade) would make sense.

We want to expose the ability to set a title and to set a message through one or more lines of text. Here's what that code would look like

```ts title="slack.ts"
// This class allows a user to set a title and lines and then use the
// 'build' method to create the payload to interact with Slack

class MessageFacade {
  // setting some default values
  private header: string;
  private lines: string[];
  constructor() {
    this.header = "";
    this.lines = [];
  }

  // I like making these types of classes fluent
  // so that it returns itself.
  public setTitle(title: string): MessageFacade {
    this.header = title;
    return this;
  }
  public addLineToMessage(line: string | string[]): MessageFacade {
    if (Array.isArray(line)) {
      this.lines.push(...line);
    } else {
      this.lines.push(line);
    }
    return this;
  }

  // Here's where we take the content that the user provided
  // and convert it to the JSON shape that Slack expects
  public build(): string {
    // create the header block if set, otherwise null
    const headerBlock = this.header
      ? {
          type: "header",
          text: { type: "plain_text", text: this.header, emoji: true },
        }
      : null;
    // convert each line to it's own section
    const lineBlocks = this.lines.map((line) => ({
      type: "section",
      text: { type: "mrkdwn", text: line },
    }));
    return JSON.stringify({
      // take all blocks that have a value and set it here
      blocks: [headerBlock, ...lineBlocks].filter(Boolean),
    });
  }
}
```

With the facade in place, let's look at implementing this in `index.ts`

```ts title="index.ts"
// ... code to get the pairs and formatted lines

// using the facade with the fluent syntax
const message = new MessageFacade()
  .setTitle(`☕ Random Coffee ☕`)
  .addLineToMessage(formattedPairs)
  .build();

await sendMessage(message);
```

When we run the script now, we get the following message:

![Random Coffee Message with Header and Icons](https://softwarementorblog.blob.core.windows.net/images/deno-slack/pretty-printed-message.png)

## Wrapping Up

In this post, we changed our script from posting its Random Coffee message to the console window to instead posting it into a Slack channel using an Incoming Webhook. By making this change, we were able to remove a manual step (e.g., us copying the message into the channel), and we were able to use some cool emojis and better formatting.

In the final post, we'll take this one step further by automating the script using scheduled jobs via GitHub Actions.

As always, you can find a full working version of this bot [on my GitHub](https://github.com/cameronpresley/random-coffee).

## Other Posts In The Series

- [Having Coffee with Deno - Inspiration](./having-coffee-with-deno-part1.md)
- [Having Coffee with Deno - Dynamic Names](./having-coffee-with-deno-part2.md)
- [Having Coffee with Deno - Automating All the Things](./having-coffee-with-deno-part4.md)
