test:
	@echo "Makefile is deprecated: use 'cake testserver'"
	./node_modules/.bin/testacular start test/testacular.conf.js

docs:
	./tools/generate_jsdoc.sh

checkstyle:
	@echo "Makefile is deprecated: use 'cake checkstyle'"
	./node_modules/.bin/jshint src/ test/

.PHONY: test docs checkstyle
