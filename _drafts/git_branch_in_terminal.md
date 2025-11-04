# Simple Bash Git Prompt Setup

This guide adds a minimal, colorful prompt to your Bash terminal in Ubuntu/WSL that shows the current Git branch.

### 1\. Open your `.bashrc` file

In your terminal, run:

```bash
nano ~/.bashrc
```

### 2\. Paste this code

Scroll to the very bottom of the file and paste this entire code block:

```bash
# --- Custom Git Prompt ---

# Function to get git branch name
parse_git_branch() {
  local branch=$(git branch --show-current 2> /dev/null)
  if [ -n "$branch" ]; then
    echo " ($branch)" # Note the space at the beginning
  fi
}

# Define color codes
COLOR_RESET='\[\033[00m\]' # Resets all colors and effects
COLOR_USER='\[\033[01;36m\]' # Bold Cyan
COLOR_HOST='\[\033[00;36m\]' # Cyan
COLOR_DIR='\[\033[01;33m\]'  # Bold Yellow
COLOR_GIT='\[\033[00;32m\]'  # Green

# Build the prompt
export PS1="${COLOR_USER}\u${COLOR_HOST}@\h${COLOR_RESET}:${COLOR_DIR}\w${COLOR_GIT}\$(parse_git_branch)${COLOR_RESET}\$ "

# --- End Custom Git Prompt ---
```

### 3\. Save and Reload

  * Press `Ctrl+X` to exit.

  * Press `Y` to confirm you want to save.

  * Press `Enter` to confirm the file name.

  * Reload your terminal for the changes to take effect:

    ```bash
    source ~/.bashrc
    ```

-----
