---
draft: false
date: 2023-07-28
authors:
  - cameronpresley
description: >
  Having Coffee With Deno - Automating All the Things
categories:
  - TypeScript
hide:
  - toc
---

# Having Coffee with Deno - Automating All the Things

Welcome to the final installment of our Deno series, where we build a script that pairs up people for coffee.

In the [last post](./having-coffee-with-deno-part3.md), we added the ability to post messages into a Slack channel instead of copying from a console window.

The current major problem is that _we_ have to remember to run the script. We could always set up a [cron job](https://phoenixnap.com/kb/set-up-cron-job-linux) or [scheduled task](https://www.tomsguide.com/how-to/how-to-use-task-scheduler-on-windows), however, what happens when we change machines? What if our computer stops working? What if someone else changes the script, how will we remember to get the latest and run it?

<!-- more -->

It'd be nice if we had a centralized location that could run our script on a schedule. When it ran, it'd grab the latest version of the script and execute it. No more need for it to be on our machine.

Wait a minute; we have a tool for this, our [Continuous Integration (CI)](https://www.atlassian.com/continuous-delivery/continuous-integration) server. Whether you're using tools like Jenkins, TeamCity, Azure DevOps, GitHub Actions, or CircleCI, at the end of the day, these tools are doing the following:

1. Start when the trigger happens (e.g., changes are merged or when a certain time happens).
1. Get the latest version of code from source control.
1. Run one or more steps.

The fun thing about this is that no one said that CI couldn't execute side effects like kicking off scripts. In this post, let's take a look at how we can setup a [GitHub Action](https://docs.github.com/en/actions) to execute our script.

## The Approach

For the script to post to Slack, we'll need to make the following changes:

1. Add our secrets/variables to the repository so that our Action can access them.
1. Creating the Action.
1. Setup a schedule for when the script should run.

## Adding Secrets to the Repository

In our `.env` file, we have two secrets, our `GITHUB_BEARER_TOKEN`, which is used to get members of the organization and `SLACK_WEBHOOK`, the URL to post our messages to.

Since these values are secrets, we'll need to follow [these docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) to add them to the repository level.

There are additional places we could place these secrets (in an environment or at an organizational level). For now, we'll keep at the repository level.

While adding your secrets, you'll note that we can't have a secret start with `GITHUB` (this is forbidden according [to the docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets#naming-your-secrets)). We'll rename this to `GH_BEARER_TOKEN` for now (we'll see later why renaming isn't a big deal).

Once we've added our secrets, we should have a screen that looks like the following:

![Listing of Secrets](../images/deno-actions/secret-configuration.png)

With this done, let's work on creating our GitHub Action.

## Creating the GitHub Action

In the root of our repository, let's create the `.github` folder followed by `workflows` inside of it. From there, we'll create `run-script.yml` with the following:

```yml title="run-script.yml"
name: Run Random Coffee

# This is the trigger for the build and there quite a few options
# Details can be found at https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows
on:
  workflow-dispatch: # Execute on demand - useful for testing

jobs:
  run-script:
    runs-on: ubuntu-latest # using Ubuntu as the base image
    steps:
      # Installing Deno on the container
      # Instructions can be found at https://github.com/denoland/setup-deno
      - name: Setup Deno
        uses: denoland/setup-deno@61fe2df320078202e33d7d5ad347e7dcfa0e8f31 # v1.1.2
        with:
          deno-version: v1.x

      # Ensures that we have deno installed an on the path
      - name: Check Deno Version
        run: "deno --version"

      # Checkout the repository
      - name: Checkout Repo
        uses: actions/checkout@v3

      # Execute the Deno script
      - name: Run script
        run: |
          deno run --allow-read --allow-net --allow-env ./index.ts
        # Here's where we can pass in the secrets from GitHub to the script
        env:
          GITHUB_BEARER_TOKEN: ${{ secrets.GH_BEARER_TOKEN }}
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```

With these changes, we can go to our Actions and kick this off manually. If everything works correctly, we should see our message get posted!

### Troubleshooting

- If you receive a 401, it's most likely the GITHUB_BEARER_TOKEN is not being set. Make sure that you added your bearer token as a secret for the repository and that you're using `${{ secrets.GH_BEARER_TOKEN }}` to refer to it.
- If you receive a 404, it's most likely that the SLACK_WEBHOOK is not being set. Make sure that you added your webhook as a secret for the repository and that you're using `${{ secrets.SLACK_WEBHOOK }}` to refer to it.

## Creating the Schedule

Now that we have the script working, our last change is to add another trigger so that our script runs on a schedule.

GitHub uses [cron](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule) syntax for scheduling, so the times will be in UTC (consider this when determining your time).

I live in the Eastern Time Zone, so let's schedule our message to run at 8 am on Mondays.

(If you're not familiar with cron syntax, I highly recommend checking out [crontab](https://crontab.guru/), an online tool to help validate your syntax, it's terrific!)

Since we want to make sure that our heroes have time to meet up during the week, let's schedule this for 8 am on Mondays.

```yml title="run-script.yml"
name: Run Random Coffee

# This is the trigger for the build and there quite a few options
# Details can be found at https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows
on:
  workflow-dispatch: # Execute on demand - useful for testing
  schedule:
    - cron: "0 12 * * 1" # Executes on Mondays at 12pm UTC

# Rest of the action file...
```

Nice! At this point, our script will run at 8 am on Mondays (and sometimes at 7 am on Mondays, yay, Daylight Savings Time!). With this final piece, we've completed our Random Coffee script for the Justice League.

<figure markdown>
![Superman and Batman having coffee](../images/deno-actions/batman-superman-coffee.png)
<figcaption>Credit to <a href="https://www.youtube.com/watch?v=4QFPuyDrIIk&t=3s">How It Should Have Ended</a> for the image and video
</figure>

## Wrapping Up

In this series, we created our first bit of automation using Deno and TypeScript, pairing up the members of the Justice League. We learned how to make web requests, how Deno's permission scheme works, creating a Slack Webhook, and how to execute our scripts on a schedule using GitHub Actions.

You can find the full working version of this repo [on my GitHub](https://github.com/cameronpresley/random-coffee).

## Other Posts In The Series

- [Having Coffee with Deno - Inspiration](./having-coffee-with-deno-part1.md)
- [Having Coffee with Deno - Dynamic Names](./having-coffee-with-deno-part2.md)
- [Having Coffee with Deno - Sharing the News](./having-coffee-with-deno-part3.md)
