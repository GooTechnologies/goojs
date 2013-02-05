test:
	./node_modules/.bin/testacular start test/testacular.conf.js

docs:
	./tools/generate_jsdoc.sh

.PHONY: test docs
