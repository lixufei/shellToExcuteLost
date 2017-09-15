#!/bin/bash

echo "start to remove owner of lost sales and unsuccessful lead......"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

mongo lead-management --quiet "$DIR/remove_owner.js" > remove.json || { echo "remove failed"; exit 1;}
echo "remove success!"
