---
layout: post
title: "Simple Bash Git Prompt: Always Know Your Current Branch"
date: 2025-11-04T00:00:00.000Z
categories: Misc Automation Git Linux
short_title: Bash Git Prompt Setup
tags:
  - Misc
  - bash
  - git
  - workflow
  - productivity
  - linux
  - wsl
  - automation
---
This guide adds a minimal, colorful prompt to your Bash terminal in Ubuntu/WSL that shows the current Git branch.

<!-- toc -->

- [Introduction](#introduction)
- [🛠️ Simple Bash Git Prompt Setup](#%F0%9F%9B%A0%EF%B8%8F-simple-bash-git-prompt-setup)
  * [1. Open your `.bashrc` file](#1-open-your-bashrc-file)
  * [2\. Paste the custom code](#2-paste-the-custom-code)
  * [3\. Save and Reload](#3-save-and-reload)
- [**Final Thoughts**](#final-thoughts)

<!-- tocstop -->

## Introduction
As an infrastructure specialist constantly dealing with various environments and repositories—especially when using **Terraform** or **Ansible** to manage cloud infrastructure—it's incredibly easy to lose track of which Git branch you're currently operating in. We've all been there: accidentally committing to `main` instead of a feature branch, or trying to pull from a branch that doesn't exist locally.

For someone like me, who values **automation** and a **smooth workflow** to reduce operational overhead, this cognitive slip-up is a huge productivity killer.

A simple, colorful **Git prompt** in your terminal is a game-changer. It gives instant visual feedback, helping you avoid mistakes and keep your development or infrastructure-as-code repos perfectly in sync.

Here is the quick guide to setting up a minimal, colorful prompt in your Bash terminal (Ubuntu/WSL) that clearly displays the current Git branch.

## 🛠️ Simple Bash Git Prompt Setup

### 1. Open your `.bashrc` file

In your terminal, run the following command to open your Bash configuration file for editing:

```bash
nano ~/.bashrc

````

### 2\. Paste the custom code

Scroll to the very bottom of the file and paste this entire code block. This code block defines a function to grab the branch name and then sets the `PS1` variable to include colored components, including the output of the new function.

```bash
# --- Custom Git Prompt ---

# Function to get git branch name
parse_git_branch() {
  local branch=$(git branch --show-current 2> /dev/null)
  if [ -n "$branch" ]; then
    echo " (${branch})" # Note the space and parentheses
  fi
}

# Define color codes
COLOR_RESET='\[\033[00m\]' # Resets all colors and effects
COLOR_USER='\[\033[01;36m\]' # Bold Cyan
COLOR_HOST='\[\033[00;36m\]' # Cyan
COLOR_DIR='\[\033[01;33m\]'  # Bold Yellow
COLOR_GIT='\[\033[00;32m\]'  # Green - Highlight the branch name!

# Build the prompt: [user]@[host]:[directory] (git-branch-name)$
export PS1="${COLOR_USER}\u${COLOR_HOST}@\h${COLOR_RESET}:${COLOR_DIR}\w${COLOR_GIT}\$(parse_git_branch)${COLOR_RESET}\$ "

# --- End Custom Git Prompt ---
```

### 3\. Save and Reload

Follow these steps to save the changes to your `.bashrc` file:

  * Press `Ctrl+X` to exit the `nano` editor.
  * Press `Y` to confirm you want to save.
  * Press `Enter` to confirm the file name (`.bashrc`).

Finally, reload your terminal configuration for the changes to take effect immediately:

```bash
source ~/.bashrc
```

Now, when you navigate into a Git-initialized directory, you'll see the branch name clearly displayed in **green**, right before the command prompt\!  If it's not a Git directory your prompt will work just like before.

## **Final Thoughts**

It's the small, simple quality-of-life automations like this that truly compound to create a more efficient and less error-prone work environment.

Happy automating\!




