---
draft: false
date: 2023-08-08
authors:
  - cameronpresley
description: >
  Scaling Effectiveness with Docs - Seeding Dates
categories:
  - Process
hide:
  - toc
---

# Scaling Effectiveness with Docs - Seeding Dates

In a [previous article](../posts/scaling-effectiveness-with-docs.md), I argued that to help your team be effective, you need to have up-to-date docs, and to have this happen, you need some way of flagging stale documentation.

This process lends itself to being easily automated, so in this series of posts, we'll build out the necessary scripts to check for docs that haven't been reviewed in the last 90 days.

All code used in this post can be found [on my GitHub](https://github.com/cameronpresley/doc-review).

## Approach

To make this happen, we'll need to create the following:

1. A _seed_ script that will add a _Last Reviewed Date_ to all of our pages.
1. A _check_ script that will check files for the _Last Reviewed Date_, returning which ones are either missing a date or are older than 90 days.
1. Create a scheduled job using GitHub Actions to run our check script and post a message to our Slack channel.

For this post, we'll be creating the _seed_ script.

## Breaking Down the Seed Script

For this script to work, we need to be able to do two things:

1. Determine the last commit date for a file.
1. Add text to the end of the file.
1. Getting a list of files in a directory.

To determine the last commit date for a file, we can leverage `git` and its `log` command (more on this in a moment). Since we're mainly doing file manipulation, we could use Deno here, but it makes much more sense to me to use something like `bash` or `PowerShell`.

## Determining the Last Commit Date For a File

To make this automation work, we need to have a date for the _Last Reviewed On_ footer. You don't want to set all the files to the same date because all the files will come up for review in one big batch.

So, you're going to want to stagger the dates. You can do this by generating random dates, but honestly, getting the last commit date should be "good" enough.

To do this, we can take advantage of git's [`log` command](https://git-scm.com/docs/git-log) with the [`--pretty` flag](https://git-scm.com/docs/pretty-formats).

We can test this out by using the following script.

```sh
file=YourFileHere.md
commitDate=$(git log -n 1 --pretty=format:%aI -- $file)
# formatting date to YYYY/MM/DD
formattedDate=$(date -d "$commitDate" "+%Y/%m/%d")
echo $formattedDate
```

Assuming the file has been checked into Git, we should get the date back in a YYYY/MM/DD format. Success!

## Adding Text to End of File

Now that we have a way to get the date, we need to add some text to the end of the file. Since we're working in markdown, we can use `---` to denote a footer and then place our text.

Since we're going to be appending multiple lines of text, we can use the [cat](https://ss64.com/bash/cat.html) command with [here-docs](https://linuxize.com/post/bash-heredoc/).

```sh
file=YourFileHere.md
# Note the blank lines, this is to make sure that the footer is separated from the text in the file
# Note: The closing EOF has to be on its own line with no whitespace or other characters in front of it.
cat << EOF >> $file


---
Last Reviewed On: 2023/08/12
EOF
```

After running this script, we'll see that the file has appended blank lines and our new footer.

## Combining Into a New Script

Now that we have both of these steps figured out, we can combine them into a single script like the following:

```sh
file=YourFileHere.md
commitDate=$(git log -n 1 --pretty=format:%aI -- $file)
# formatting date to YYYY/MM/DD
formattedDate=$(date -d "$commitDate" "+%Y/%m/%d")
# Note the blank lines, this is to make sure that the footer is separated from the text in the file
# Note: The closing EOF has to be on its own line with no whitespace or other characters in front of it.
cat << EOF >> $file


---
Last Reviewed On: $formattedDate
EOF
```

Nice! Given a file, we can figure out its last commit date and append it to the file. Let's make this more powerful by not having to hardcode a file name.

## Finding Files In a Directory

At this point, we can update a file, but the file is hardcoded. But we're going to have a lot of docs to review, and we don't want to do this manually, so let's figure out how we can get all the markdown files in a directory.

For this exercise, we can use the [`find`](https://ss64.com/bash/find.html) command. In our case, we need to find all the files with a `.md` extension, no matter what directory they're in.

```sh
directory=DirectoryPathGoesHere
find $directory -name "*.md" -type f
```

We're going to need to process each of these files, so some type of iteration would be helpful. Doing some digging, Bash supports a [for loop](https://linuxize.com/post/bash-for-loop/#the-standard-bash-for-loop), so let's use that.

```sh
directory=DirectoryPathGoesHere
for file in `find $directory -name "*.md" -type f`; do
  echo "printing $file"
done
```

If everything works, we should see each markdown file name being printed.

## When a Plan Comes Together

We've got all the pieces, so let's bring this together:

```sh
directory=DirectoryPathGoesHere
for file in `find $directory -name "*.md" -type f`; do
  commitDate=$(git log -n 1 --pretty=format:%aI -- $file)
  # formatting date to YYYY/MM/DD
  formattedDate=$(date -d "$commitDate" "+%Y/%m/%d")
  # Note the blank lines, this is to make sure that the footer is separated from the text in the file
  # Note: The closing EOF has to be on its own line with no whitespace or other characters in front of it.
  cat << EOF >> $file


---
Last Reviewed On: $formattedDate
EOF
done

```

## Bells and Whistles

This script works and we could ship this, however, it's a bit rough.

For example, the script assumes that it's in the same directory as your git repository. It also assumes that your repository is up-to-date and that it's safe to make changes on the current branch.

Let's make our script a bit more durable by making the following tweaks:

1. Clone the repo to a new temp directory.
1. Create a new branch for making changes.
1. Commit changes and publish the branch.


### Getting the latest version of the repo

For this step, let's add logic for creating a new temp directory and adding a call to `git clone`.

```sh
# see https://unix.stackexchange.com/questions/30091/fix-or-alternative-for-mktemp-in-os-x#answer-84980
# for why tmpDir is being created this way
docRepo="RepoUrlGoesHere"
tmpDir=$(mktemp -d 2>/dev/null || mktemp -d -t 'docSeed')
cd $tmpDir
echo "Cloning from $docRepo"
# Note the . here, this allows us to clone to the temp folder and not to a new folder of repo name
git clone "$docRepo" . &> /dev/null
```

### Making a new branch and pushing changes

Now that we've got the repo, we can add the steps for switching branches, committing changes, and publishing the branch.

```sh
# ... code to clone repository
git switch -c 'adding-seed-dates'
# ... code to make file changes
git add --all
git commit -m "Adding seed dates"
git push -u origin adding-seed-dates
```

## Final Script

Let's take a look at our final script:

```sh
#!/bin/bash
docRepo="RepoUrlGoesHere"
tmpDir=$(mktemp -d 2>/dev/null || mktemp -d -t 'docSeed')
cd $tmpDir

echo "Cloning from $docRepo"
git clone "$docRepo" . &> /dev/null

git switch -c 'adding-dates-to-files'

for file in `(find . -name "*.md" -type f)`; do
  echo "updating $file"
  commitDate="$(git log -n 1 --pretty=format:%aI -- $file)"
  formattedDate=$(date -d $commitDate "+%Y/%m/%d")
  cat << EOT >> $file


---
Last Reviewed On: $formattedDate
EOT
done
git add --all
git commit -m "Adding initial dates"
git push -u origin adding-dates-to-files
```

## Wrapping Up

In this post, we wrote a bash script to clone our docs and add a new footer to every page with the file's last commit date. In the next post, we'll build the script that checks for stale files.