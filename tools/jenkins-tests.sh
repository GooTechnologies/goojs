#! /bin/bash

# Run this from the root of the project
# Assume npm install has been run (installing testacular)

if [ ! -d node_modules ]; then
    echo "Not in the project root directory or 'npm install' has not been run."
    exit 1
fi

# Run the tests using Testacular
node_modules/.bin/testacular start --single-run --browsers './tools/jenkins-headlessbrowser.sh' --no-colors --port 2900 test/testacular.conf.js
