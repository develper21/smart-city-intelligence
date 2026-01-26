#!/bin/bash

# Get list of untracked files
files=$(git ls-files --others --exclude-standard)

if [ -z "$files" ]; then
  echo "No untracked files found."
  exit 0
fi

# Count files
count=$(echo "$files" | wc -l)
echo "Found $count files to commit."

# Iterate and commit
i=1
while IFS= read -r file; do
  echo "[$i/$count] Processing: $file"
  git add "$file"
  git commit -m "feat: add $file"
  git push
  i=$((i+1))
done <<< "$files"

echo "Done!"
