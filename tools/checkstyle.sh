#! /bin/bash

SRC_DIR=src/

node_modules/.bin/jshint --checkstyle-reporter ${SRC_DIR} > checkstyle-result.xml
