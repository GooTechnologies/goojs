#! /bin/bash -e

DOC_DIR=goojs-jsdoc-json
JSDOC_BIN=node_modules/jsdoc/jsdoc

# Run this from the root of the project
# Assume npm install has been run (installing jsdoc)

# Run JSDoc to generate documentation
rm -rf ${DOC_DIR}

# Create docs directory
mkdir ${DOC_DIR}
touch ${DOC_DIR}/goo.api.json

# Custom template
${JSDOC_BIN} -r -p "src" -t node_modules/jsdoc/templates/haruki -d console > ${DOC_DIR}/goo.api.json
