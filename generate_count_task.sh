#!/bin/bash

echo "start to count tasks of lost sales and unsuccessful lead......"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

mongo lead-management --quiet "$DIR/count_todo_task.js" > count_todo_task.sql || { echo "write count_todo_task.sql failed!"; exit 1;}
echo "write count_todo_task.sql success!"

mongo lead-management --quiet "$DIR/count_todo_task_for_lost.js" > count_todo_task_for_lost.sql || { echo "write count_todo_task_for_lost.sql failed!"; exit 1;}
echo "write count_todo_task_for_lost.sql success!"

mongo lead-management --quiet "$DIR/count_todo_task_for_unsuccessful.js" > count_todo_task_for_unsuccessful.sql || { echo "write count_todo_task_for_unsuccessful.sql failed!"; exit 1;}
echo "write count_todo_task_for_unsuccessful.sql success!"

mongo lead-management --quiet "$DIR/count_customer_task.js" > count_customer_task.sql || { echo "write count_customer_task.sql failed!"; exit 1;}
echo "write count_customer_task.sql success!"

echo "wait for remove owner......"
