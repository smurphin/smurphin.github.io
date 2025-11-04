---
layout: post
title: 'Simple Bash Git Prompt: Always Know Your Current Branch'
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
- [Advanced Config: Displaying the Git Branch State](#advanced-config-displaying-the-git-branch-state)
  * [Visual Feedback and Functionality](#visual-feedback-and-functionality)
  * [The Code: Git Status via `PROMPT_COMMAND`](#the-code-git-status-via-prompt_command)
  * [Save and Reload](#save-and-reload)
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

## Advanced Config: Displaying the Git Branch State

The simple prompt introduced earlier is great, but to truly reduce errors and boost productivity, we need the terminal to reflect the **state** of the Git repository—not just the branch name. This "advanced" configuration uses **color coding** to give you immediate visual feedback on whether you have uncommitted changes.

This is a critical improvement for managing Infrastructure as Code (IaC) with tools like **Terraform**, ensuring you don't accidentally commit half-finished changes.

###  Visual Feedback and Functionality

The key benefit of this advanced setup is the immediate **color-coded status** of your active branch. You can tell your repo's state at a glance:

| Git Status | Colour | Meaning |
| ----- | ----- | ----- |
| **Clean/Synced** | **Green** | The repository is clean. All changes are committed and pushed (or ready to be pushed). You are safe to switch branches or pull updates. |
| **Staged** | **Yellow** | Files have been **staged** (`git add`) but not yet committed (`git commit`). You are ready for a commit. |
| **Dirty/Uncommitted** | **Red** | You have **unstaged changes** (files modified or newly created). This is a strong visual warning to save, stage, or discard your work before proceeding. |

This dynamic visual confirmation improves your workflow and drastically reduces the chance of making accidental commits, helping you maintain a clean and reliable codebase.

### The Code: Git Status via `PROMPT_COMMAND`

Replace the previous Git prompt code block in your `~/.bashrc` file with this more powerful configuration. It uses a dynamic function run via `PROMPT_COMMAND` to check the repository status before every prompt:

```bash
# --- Custom Git Prompt (Final Version) ---

# This function is called before each prompt
_build_my_prompt() {
    # 1. Define colors (raw codes, without wrappers)
    local C_RESET='\033[00m'
    local C_USER='\033[00;36m'     # Cyan
    local C_HOST='\033[00;36m'     # Cyan
    local C_DIR='\033[01;36m'      # Bold Cyan
    local C_GREEN='\033[00;32m'    # Green
    local C_RED='\033[00;31m'      # Red
    local C_YELLOW='\033[00;33m'   # Yellow

    # 2. Build the main prompt part (user, host, dir)
    #    We add the \[...\] wrappers here
    local prompt_start="\[${C_USER}\]\u\[${C_HOST}\]@\h\[${C_RESET}\]:\[${C_DIR}\]\w\[${C_RESET}\]"

    # 3. Build the git part
    local git_info=""
    local branch=$(git branch --show-current 2> /dev/null)

    if [ -n "$branch" ]; then
        local color=$C_GREEN # Default to green (in sync)

        # Check for uncommitted files (dirty)
        if ! git diff-files --quiet 2> /dev/null; then
            color=$C_RED
        # Check for staged files
        elif ! git diff-index --cached --quiet HEAD 2> /dev/null; then
            color=$C_YELLOW
        fi

        # Add wrappers *around* the color
        git_info=" (\[${color}\]$branch\[${C_RESET}\])"
    fi

    # 4. Set the final PS1 string
    PS1="${prompt_start}${git_info} \$ "
}

# Tell Bash to run this function before each prompt
export PROMPT_COMMAND="_build_my_prompt"

# --- End Custom Git Prompt ---
```

###  Save and Reload

Remember to save the changes to your `.bashrc` file:

  * Press `Ctrl+X` to exit the `nano` editor.
  * Press `Y` to confirm you want to save.
  * Press `Enter` to confirm the file name (`.bashrc`).

Finally, reload your terminal configuration for the changes to take effect immediately:

```bash
source ~/.bashrc
```

## **Final Thoughts**

It's the small, simple quality-of-life automations like this that truly compound to create a more efficient and less error-prone work environment.

Happy automating\!





