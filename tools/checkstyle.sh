#! /bin/bash

node_modules/.bin/jshint --checkstyle-reporter src/ test/ > checkstyle-result.xml
