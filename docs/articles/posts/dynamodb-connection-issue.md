---
draft: false
date: 2024-04-25
authors:
  - cameronpresley
description: >
  Troubleshooting DynamoDB Connection Issue

categories:
  - Process
  - AWS

hide:
  - toc
---

# Troubleshooting a DynamoDB Connection Issue

Most of my blog posts cover process improvements, leadership advice, and new (to me) technologies. In this post, I wanted to shift a bit and cover some of the fun troubleshooting problems that I run into from time to time.

Enjoy!

## The Setup - How Did We Get Here?

At a high level, the team had a need to process messages coming from a message queue, parse the data, and then insert into a DynamoDB table. At a high level, here's what the architecture looked like:

``` mermaid
graph LR
Queue[Message Queue] --> Lambda[Lambda]
Lambda --> Process[Process?]
Process --> |Failed| DLQ[Dead Letter Queue]
Process --> |Success| DB[DynamoDB Table]
```

The business workflow is that a batch job was running overnight that would send messages to various queues (including this one). The team knew that we would receive about 100K messages, but had plenty of time to process them as this data was not needed for real-time.

## What Went Wrong?

For the first night, everything worked as intended. However, for the second night, the team saw that only _some_ of the messages made it to their DynamoDB table. A non-trivial number of them errored out with a message of `Error: connect EMFIL <IP ADDRESS>`.

I don't know about you, but I had never seen `EMFIL` as an error before and the logs weren't very helpful on what was going on.

Doing some digging, we found [this GitHub Issue](https://github.com/aws/aws-sdk-js-v3/issues/5010) where someone has ran into a similar problem.

Digging through the comment chain, we found [this comment](https://github.com/aws/aws-sdk-js-v3/issues/5010#issuecomment-1670967226), stating that you could run into this problem if you were exhausting the connection pool to DynamoDB.

Ah, now that's an idea! Even though I hadn't seen that error before, I know that if an application isn't cleaning up their connections properly, then the server can't accept new ones and that would fail the application. With almost 100K messages coming through and the large amount of failures, I could absolutely see how that might be the issue.

## Inspecting the Code

With this in mind, I started to take a look at the lambda in question and found the following:

```ts
export const handler = (event) => {
  // logic to parse event

  const dbClient = DynamoDbDocumentClient.from(new DynamoDBClient());

  // logic to insert event
}
```

Aha! This code implies that for _every_ execution of the lambda, it would attempt to create a new connection.

<blockquote>
But Cameron, hold up. Yes, it will create the connection every time the lambda executes, but once the lambda is done, the connection will get cleaned up, so will it really try to spin up 100K connections?
</blockquote>

You're right, when the lambda goes out of scope, the connection will get cleaned up.

But don't forget, it'll take the target server (DynamoDB) some time to tidy up. The problem is that since we were slamming 100K messages in rapid succession, DynamoDB didn't have enough time to clean up the connection before another connection was requested. And that was the problem.

## Resolution

Now that we have an idea on what the problem could be, time to fix it. In this case, the change is straightforward (though the reasoning might not be.)

So instead of having this

```ts
export const handler = (event) => {
  // logic to parse event

  const dbClient = DynamoDbDocumentClient.from(new DynamoDBClient());

  // logic to insert event
}
```

We moved the client creation to be outside of the `handler` block altogether.

```ts
const dbClient = DynamoDbDocumentClient.from(new DynamoDBClient());

export const handler = (event) => {
  // logic to parse event
  // logic to insert event
}
```

<blockquote>
Wait, wait. How does this solve the problem? You're still going to be executing this code for every message, so won't you have the same issue?
</blockquote>

Now that's a great question! Something that the team learned is that when a Lambda gets spun-up, there's a [context](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html#runtimes-lifecycle) that's created that hosts the external dependencies. When a lambda execution finishes, the context is maintained by AWS for a certain amount of time _to be reused_ in case the lambda is invoked again. This saves on the init/start-up times.

Because of the shared context, this allows us to essentially pool the connections and drastically reduce the amount of connections needed.

This same advice is given in [the best practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html#function-code) documentation for lambdas.

## Lessons Learned

After making the code change and redeploying, we were able to confirm that everything was working again with no issues.

Even though the problem was new to us, this was a great opportunity to learn more about how Lambdas work under the hood, understand more about execution context, and a bit of dive into troubleshooting unknown errors for the team.
