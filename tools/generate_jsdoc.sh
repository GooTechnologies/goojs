#! /bin/bash

DOC_DIR=goojs-jsdoc
JSDOC_BIN=node_modules/jsdoc/jsdoc

# Run this from the root of the project
# Assume npm install has been run (installing jsdoc)

# Run JSDoc to generate documentation
rm -rf ${DOC_DIR}
${JSDOC_BIN} -r -p "src/goo" -d ${DOC_DIR} -t tools/jsdoc-template

# Package files into tar.gz
rm -f goojs-jsdoc*.tar.gz
tar zcf goojs-jsdoc_$(date +%d%h%Y_%H%M).tar.gz ${DOC_DIR}
