---
draft: false
date: 2024-08-06
authors:
  - cameronpresley
description: >
  TIL - Changing Entrypoint for Docker Container

categories:
  - Today I Learned

hide:
  - toc
---

# Today I Learned: Changing the Entrypoint for a Docker Container

A common pattern for building software today is to develop using containers. This is a great strategy because it can ensure that everyone is building/deploying the same environment every time. However, like any other tooling, it can take a bit to create the file and make sure that you're setting it up correctly.

When I'm building a container, I typically will run `bash` in the container so I can inspect files, paths, permissions and more.

For example, let's say that I wanted to see what all is in the `node` image, I could run the following

```sh
docker run -it node:22 bash
```

And as long as the `node` image has bash installed, I can take a look.

This trick works just fine when I have access to the Dockerfile and can change it. But what if you didn't have access to the Dockerfile? How would you troubleshoot?

## The Scenario

Let's say that I'm using a container that was created from another team, called `deps`. When I try to run it though, I get the following error:

```sh
docker run -it deps:latest
```

![Node error stating that it could not find module '/app/hello.js'](https://softwarementorblog.blob.core.windows.net/images/til-docker-entrypoint/image-1.png)

Looking at the error message, it says that it couldn't find `/app/hello.js`. I could let the other team know and let them figure it out. However, I'd like to give them a bit more info and possible advice, so I could use the `bash` trick from before and see if I can spot the problem.


```sh
docker run -it deps:latest bash
```

![Node error stating that it could not find module '/app/hello.js](https://softwarementorblog.blob.core.windows.net/images/til-docker-entrypoint/image-1.png)

Wait a minute! Why did I get the same error?

The reason is because the image has an `ENTRYPOINT` defined, which means that whenever the container starts, it's going to run that command. Since that command is the one that's failing, the container crashes before it executes bash or any other command.

## The Solution

Since I don't have access to the Dockerfile, I need a way to change the entrypoint to allow it to run bash. Luckily, it turns out that the `docker run` command has a `--entrypoint` param that you can set to be whatever the command should be.

So let's run the container, except this time, specifying bash as the entrypoint.

```sh
docker run -it --entrypoint "bash" deps:latest
```

And if I run the `ls` command, I can see that the issue is that the file is called index.js, not hello.js. 

![There's not a file called hello.js, but it's called index.js](https://softwarementorblog.blob.core.windows.net/images/til-docker-entrypoint/image-3.png)

From here, I can give this information to the other team and they can make the necessary changes to their Dockerfile.

