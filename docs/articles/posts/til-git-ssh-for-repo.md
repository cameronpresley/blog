---
draft: false
date: 2025-03-12
authors:
  - cameronpresley
description: >
  TIL - How to set a SSH key for a single repository

categories:
  - Today I Learned

hide:
  - toc
---

# Today I Learned: Configuring Git to Use A Specific Key for a Specific Repo

When working with a Git repository, there are two ways to authenticate yourself, either by using your name/password or by leveraging an SSH key, proving who you are. I like the SSH key the best since I can create the key for my machine, associate it to my profile, and then I'm good to go.

However, the problem becomes when I have to juggle different SSH keys. For example, I may have two different accounts (personal and a work one) and these accounts can't use the same SSH key (in fact, if you try to add the same SSH key to two different accounts, you'll get an error message).

In these cases, I'd like to be able to specify which SSH key to use for a given repository.

Doing some digging, I found the following configures the sshCommand that git uses

```shell

git config core.sshCommand 'ssh -i C:\\users\\<name>\\.ssh\\<name_of_private_key>'

```

Because we're not specifying a scope (like `--global`), this will only apply to the single repository.
