#!/bin/bash

INPUT_FILE="test_input.js"
OUTPUT_FILE="test_output.js"

generate_unique_id() {
  echo $(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 16)
}

cp "$INPUT_FILE" "$OUTPUT_FILE"

declare -A id_map

grep -oP "(?<=id: ')([a-zA-Z0-9]+)" "$INPUT_FILE" | while read -r id; do
  # id not empty
  if [[ -n "$id" ]]; then
    # id is in dict
    if [[ ${id_map[$id]} ]]; then
      new_id=$(generate_unique_id)
      echo "Replacing duplicate id '$id' with '$new_id'"

      # new_id is not empty
      if [[ -n "$new_id" ]]; then
        # replace in place
        sed -i "s|$id|$new_id|g" "$OUTPUT_FILE"
      else
        echo "Error: Generated new_id is empty"
        exit 1
      fi

    else
      id_map[$id]=1
    fi
  else
    echo "Error: id is empty"
    exit 1
  fi

done

echo "Duplicate IDs have been replaced in $OUTPUT_FILE"
