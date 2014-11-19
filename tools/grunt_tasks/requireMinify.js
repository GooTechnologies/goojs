'use strict';

var fs = require('fs');

module.exports = function (grunt) {
	var engineFilename = './out/goo.js';
	var engineVersion = grunt.option('goo-version') || 'UNOFFICIAL';
	var gooModule = {
		name: 'goo'
	};

	// Returns the code to add at the start and end of the minified file
	function getWrapper() {
		var wrapperHead = '';
		var wrapperTail = '';

		wrapperHead +=
			'/* Goo Engine ' + engineVersion + '\n' +
			' * Copyright 2014 Goo Technologies AB\n' +
			' */\n';

		var customRequire = fs.readFileSync('tools/customRequire.js');
		wrapperHead += customRequire;

		wrapperHead += '(function(window) {';

		// Put all calls to define and require in the f function
		wrapperHead +=
			'function f(){';
		wrapperTail +=
			'}' +
			'try{' +
			'if(window.localStorage&&window.localStorage.gooPath){' +
			// We're configured to not use the engine from goo.js.
			// Don't call the f function so the modules won't be defined
			// and require will load them separately instead.
			'window.require.config({' +
			'paths:{goo:localStorage.gooPath}' +
			'})' +
			'}else f()' +
			'}catch(e){f()}';

		wrapperTail += '})(window,undefined)';
		return [wrapperHead, wrapperTail];
	}

	grunt.config('requirejs', {
		build: {
			// Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
			options: {
				baseUrl: 'src/',
				optimize: 'uglify2',  // uglify, uglify2, closure, closure.keepLines
				preserveLicenseComments: false,
				useStrict: true,
				wrap: false,
				keepBuildDir: true,
				//generateSourceMaps: true,
				dir: 'out/minified/',
				modules: [gooModule],
				paths: {
					'requireLib': '../lib/require'
				}
			}
		}
	});

	grunt.config('wrap', {
		build: {
			src: ['out/minified/goo.js'],
				dest: engineFilename,
				options: {
				wrapper: getWrapper()
			}
		}
	});
};