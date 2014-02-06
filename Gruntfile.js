var glob = require('glob');
var _ = require('underscore');
var fs = require('fs');
//var buildPack = require('./tools/buildPack');

module.exports = function(grunt) {
	var engineVersion = grunt.option('goo-version') || 'UNOFFICIAL';
	var bundleRequire = grunt.option('bundle-require');

	var gooModule = {
		name: 'goo'
	};
	var engineFilename = './out/goo.js'
	if(bundleRequire) {
		console.log('Bundling require');
		gooModule.include = ['requireLib'];
		engineFilename = './out/goo-require.js'
	}

	// Returns the code to add at the start and end of the minified file
	function getWrapper() {
		var global = grunt.option('global');
		var wrapperHead = '';
		var wrapperTail = '';

		wrapperHead +=
			'/* Goo Engine ' + engineVersion + '\n' +
			' * Copyright 2014 Goo Technologies AB\n' +
			' */\n';

		if (global) {
			var customRequire = fs.readFileSync('tools/customRequire.js');
			wrapperHead += customRequire;
		}

		wrapperHead += '(function(window) {';

		if (global) {
			wrapperHead += 'window.goo = {};'
		}

		if (bundleRequire) {
			wrapperTail += 'window.requirejs=requirejs;';
			wrapperTail += 'window.require=require;';
			wrapperTail += 'window.define=define;';
		}
		else {
			// Put all calls to define and require in the f function
			wrapperHead +=
				'function f(){';
			wrapperTail +=
				'}' +
				'if(window.localStorage&&window.localStorage.gooPath){' +
					// We're configured to not use the engine from goo.js.
					// Don't call the f function so the modules won't be defined
					// and require will load them separately instead.
					'window.require.config({' +
						'paths:{goo:localStorage.gooPath}' +
					'})' +
				'}else f()'
		}
		wrapperTail += '})(window,undefined)';
		return [wrapperHead, wrapperTail];
	}

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		requirejs: {
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
					},

					// I tried using a wrap block like this, but it has no effect
					// wrap: { ... }
					/*
					uglify2: {
						output: {
							beautify: true
						},
						compress: {
							sequences: false,
							global_defs: {
								DEBUG: false
							}
						},
						warnings: true,
						mangle: false
					}*/
				}
			}
		},
		wrap: {
			build: {
				src: ['out/minified/goo.js'],
				dest: engineFilename,
				options: {
					wrapper: getWrapper()
				}
			}
		},
		clean: {
			build: {
				src: [
					'out/',
					'src/goo.js',
				]
			},
			toc: {
				src: [
					'visual-test/index.html'
				]
			},
			docs: [
				'goojs-jsdoc/',
				'goojs-jsdoc-json/',
				'goojs-jsdoc_*.tar.gz',
			]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-wrap');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('default', ['minify']);
	grunt.registerTask('minify', ['main-file', 'requirejs:build', 'wrap']);


	//! AT: no better place to put this
	function extractFilename(path) {
		var index = path.lastIndexOf('/');
		return index === -1 ? path : path.substr(index + 1);
	}

	// Creates src/goo.js that depends on all engine modules
	grunt.registerTask('main-file', function() {
		var sourceFiles = glob.sync('!(*pack)/**/*.js', {cwd: 'src/goo/', nonegate: true })
		var allModules = _.map(sourceFiles, function(f) {
			return 'goo/' + f.replace(/\.js/, '');
		});

		var global = grunt.option('global');

		if (global) {
			var lines = [];
			lines.push('define([');
			lines.push(_.map(allModules, function(m) { return "\t'" + m + "'"; }).join(',\n'));
			lines.push('], function (');

			var fileNames = allModules.map(extractFilename);

			lines.push('\t' + fileNames.join(',\n\t'));
			lines.push(') {');
			fileNames.forEach(function (fileName) {
				lines.push('\tgoo.' + fileName + ' = ' + fileName + ';');
			});

			lines.push('});require(["goo"], function() {})')

			fs.writeFileSync('src/goo.js', lines.join('\n'));
		} else {
			fs.writeFileSync('src/goo.js', 'define([\n' +
				_.map(allModules, function(m) { return "\t'" + m + "'"; }).join(',\n') +
				'\n], function() {});\n');
		}
	});

	/*
	grunt.registerTask('pack', 'Creates a pack', function() {
		//! AT: writeFile (in buildPack.js) fails for some unknown reason if .pack() is exported
		// this is unused - use 'node tools/buildPack.js <somepack>' instead
		var packName = grunt.option('name');
		if (!packName) {
			console.error('Please specify a pack name using the -name option'.red);
		} else {
			buildPack.pack(packName);
		}
	});
	*/
};
