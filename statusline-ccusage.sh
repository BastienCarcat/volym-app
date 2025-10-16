#!/bin/bash

# Read Claude Code input
input=$(cat)

# Extract session_id, model, and current directory
session_id=$(echo "$input" | jq -r '.session_id')
model=$(echo "$input" | jq -r '.model.display_name')
current_dir=$(echo "$input" | jq -r '.workspace.current_dir')
dir_name=$(basename "$current_dir")

# Get git info
if git rev-parse --git-dir > /dev/null 2>&1; then
  branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "no-branch")
  changes=$(git diff --shortstat 2>/dev/null | awk '{print "+"$4" -"$6}' | sed 's/[^0-9+-]//g')
  if [ -n "$changes" ]; then
    git_status="🌿 $branch* ($changes)"
  else
    git_status="🌿 $branch"
  fi
else
  git_status="🌿 no-git"
fi

# Get session data using ccusage
session_data=$(ccusage session --id "$session_id" --json 2>/dev/null)

if [ "$session_data" != "null" ] && [ -n "$session_data" ]; then
  # Calculate session cost
  session_cost=$(echo "$session_data" | jq -r '.cost // 0')
  session_cost_fmt=$(printf "\$%.2f" "$session_cost")

  # Calculate tokens (input + output only, excluding cache)
  session_tokens=$(echo "$session_data" | jq -r '.entries | map(.inputTokens + .outputTokens) | add // 0')

  # Format tokens with K/M suffix
  if [ "$session_tokens" -ge 1000000 ]; then
    tokens_fmt=$(echo "scale=1; $session_tokens / 1000000" | bc)"M"
  elif [ "$session_tokens" -ge 1000 ]; then
    tokens_fmt=$(echo "scale=1; $session_tokens / 1000" | bc)"K"
  else
    tokens_fmt="$session_tokens"
  fi
else
  session_cost_fmt="\$0.00"
  tokens_fmt="0"
fi

# Get daily cost
today=$(date +%Y%m%d)
daily_data=$(ccusage daily --json --since "$today" 2>/dev/null)
daily_cost=$(echo "$daily_data" | jq -r ".[0].cost // 0")
daily_cost_fmt=$(printf "\$%.2f" "$daily_cost")

# Get active block info
blocks_data=$(ccusage blocks --active --json 2>/dev/null)
if [ "$blocks_data" != "null" ] && [ -n "$blocks_data" ]; then
  block_cost=$(echo "$blocks_data" | jq -r '.[0].cost // 0')
  block_cost_fmt=$(printf "\$%.2f" "$block_cost")

  # Calculate remaining time
  end_time=$(echo "$blocks_data" | jq -r '.[0].endDate')
  if [ "$end_time" != "null" ]; then
    now=$(date +%s)
    end=$(date -j -f "%Y-%m-%dT%H:%M:%S" "$(echo $end_time | cut -d. -f1)" +%s 2>/dev/null)
    if [ -n "$end" ] && [ "$end" -gt "$now" ]; then
      remaining_seconds=$((end - now))
      hours=$((remaining_seconds / 3600))
      minutes=$(((remaining_seconds % 3600) / 60))
      time_left="${hours}h ${minutes}m left"
    else
      time_left="expired"
    fi
  else
    time_left="unknown"
  fi

  block_info="🧊 $block_cost_fmt ($time_left)"
else
  block_info="🧊 \$0.00"
fi

# Output statusline
echo "$git_status | 📁 $dir_name | 🤖 $model | 💰 $session_cost_fmt / 📅 $daily_cost_fmt / $block_info | 🧩 ${tokens_fmt} tokens"
