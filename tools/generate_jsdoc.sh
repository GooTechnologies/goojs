#! /bin/bash -e

DOC_DIR=goojs-jsdoc
JSDOC_BIN=node_modules/jsdoc/jsdoc
TEMPLATE_DIR=tools/jsdoc-template
README=tools/jsdoc-template/static/README.md

# Run this from the root of the project
# Assume npm install has been run (installing jsdoc)

# Run JSDoc to generate documentation
rm -rf ${DOC_DIR}
# Custom template
${JSDOC_BIN} -r "src" -d ${DOC_DIR} -t ${TEMPLATE_DIR} ${README}

# Package files into tar.gz
rm -f goojs-jsdoc*.tar.gz
tar zcf goojs-jsdoc_$(date +%d%h%Y_%H%M).tar.gz ${DOC_DIR}
