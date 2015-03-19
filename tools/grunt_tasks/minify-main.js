// jshint node:true
'use strict';

var fs = require('fs');

var minifier = require('../minifier');

var ENGINE_FILE = 'out/goo.js';

module.exports = function (grunt) {
	var engineVersion = grunt.option('goo-version') || 'UNOFFICIAL';

	grunt.registerMultiTask('minify-main', function () {
		var done = this.async();

		minifier.run(
			this.data.rootPath,
			null,
			'out/goo.js',
			{ minifyLevel: this.data.minifyLevel },
			done
		);
	});

	// Returns the code to add at the start and end of the minified file
	function getWrapper() {
		var wrapperHead = '';
		var wrapperTail = '';

		wrapperHead +=
			'/* Goo Engine ' + engineVersion + '\n' +
			' * Copyright 2015 Goo Technologies AB\n' +
			' */\n';
		wrapperHead += fs.readFileSync('out/minified/MapSetPolyfill.js');

		return [wrapperHead, wrapperTail];
	}

	grunt.config('minify-main', {
		'build': {
			minifyLevel: 'full'
		},
		'no-mangle': {
			minifyLevel: 'light'
		},
		'dev': {
			minifyLevel: null,
			rootPath: 'src'
		}
	});

	// some files are not part of the engine per se but need to be minified and added to goo.js
	grunt.config('uglify', {
		build: {
			files: {
				'out/minified/MapSetPolyfill.js': ['tools/MapSetPolyfill.js']
			}
		}
	});

	grunt.config('wrap', {
		build: {
			src: [ENGINE_FILE],
			dest: ENGINE_FILE,
			options: {
				wrapper: getWrapper
			}
		}
	});
};