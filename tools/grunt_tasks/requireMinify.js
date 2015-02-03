'use strict';

var fs = require('fs');
var childProcess = require('child_process');

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
			' * Copyright 2015 Goo Technologies AB\n' +
			' */\n';

		wrapperHead += fs.readFileSync('tools/customRequire.js');

		wrapperHead += fs.readFileSync('out/minified/MapSetPolyfill.js');

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

	// concatenate all modules in one big file, in the correct order
	grunt.config('requirejs', {
		build: {
			// Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
			options: {
				baseUrl: 'src-preprocessed/',
				optimize: 'none',  // uglify, uglify2, closure, closure.keepLines
				preserveLicenseComments: false,
				useStrict: true,
				wrap: false,
				keepBuildDir: false,
				//generateSourceMaps: true,
				dir: 'out/minified',
				modules: [gooModule],
				paths: {
					'requireLib': '../lib/require'
				}
			}
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

	// minify the main goo.js file
	grunt.registerTask('minify-main', function () {
		var done = this.async();

		var buildTxt = fs.readFileSync('out/minified/build.txt', 'utf8');
		var moduleList = buildTxt.match(/\/[\w+]+\.js/g);

		moduleList = moduleList.map(function (moduleName) {
			return moduleName.slice(1, moduleName.length - 3) + '_';
		});

		var command = "node node_modules/uglify-js/bin/uglifyjs out/minified/goo.js -m -r '" +
			moduleList.join(',') +
			"' --screw-ie8 -c -o out/goo.js";

		childProcess.exec(command, function (error, stdout, stderr) {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (error !== null) {
					console.log('exec error: ' + error);
				}
			done();
		});
	});

	// wrap the engine with our own require and map/set polyfills
	grunt.config('wrap', {
		build: {
			src: ['out/goo.js'],
				dest: engineFilename,
				options: {
				wrapper: getWrapper
			}
		}
	});
};