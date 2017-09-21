#!/bin/bash

echo "start to find owner of lost sales and unsuccessful lead......"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

mongo lead-management --quiet "$DIR/generate_update_task_for_lost_and_successful.js" > generate_update_task_for_lost_and_unsuccessful.sql || { echo "write generate_update_task_for_lost_and_unsuccessful.sql failed!"; exit 1;}
echo "write generate_update_task_for_lost_and_unsuccessful.sql success!"

echo "wait for remove owner......"
