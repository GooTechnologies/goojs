test:
	./node_modules/.bin/testacular start test/testacular.conf.js

docs:
	./tools/generate_jsdoc.sh

checkstyle:
	./node_modules/.bin/jshint src/ test/

.PHONY: test docs checkstyle
