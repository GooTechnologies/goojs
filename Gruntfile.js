var glob = require('glob');
var _ = require('underscore');
var fs = require('fs');
//var buildPack = require('./tools/buildPack');

module.exports = function(grunt) {
	var engineVersion = grunt.option('goo-version') || 'UNOFFICIAL';

	var gooModule = {
		name: 'goo'
	};
	var engineFilename = './out/goo.js';

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
			'try{'+
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
					'src/goo.js'
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
				'goojs-jsdoc_*.tar.gz'
			]
		},
		'build-pack': {
			fsmpack: {
				packName: 'fsmpack',
				outBaseDir: 'out'
			},
			geometrypack: {
				packName: 'geometrypack',
				outBaseDir: 'out'
			},
			quadpack: {
				packName: 'quadpack',
				outBaseDir: 'out'
			},
			timelinepack: {
				packName: 'timelinepack',
				outBaseDir: 'out'
			},
		},
		karma: {
			unit: {
				configFile: 'test/karma.conf.js',
				singleRun: true,
				browsers:['Chrome'] // Phantom just doesn't have support for the goodies we've come to know and love
			},
		},
	    jsdoc : { // Could replace tools/generate_jsdoc.sh, but still need something that makes the tar.gz docs bundle
	        dist : {
	            src: ['src','tools/jsdoc-template/static/README.md'],
	            options: {
	                destination: 'goojs-jsdoc',
	                template: 'tools/jsdoc-template',
	                'private': false,
	                recurse: true
	            }
	        }
	    },
		jshint: {
			all: ['src'],
			options:{
				jshintrc: '.jshintrc',
				force: true // Do not fail the task
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-wrap');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.loadTasks('tools/grunt_tasks');

	grunt.registerTask('default',	['minify']);
	grunt.registerTask('docs',		['jsdoc']);
	grunt.registerTask('minify',	['main-file', 'requirejs:build', 'wrap', 'build-pack:fsmpack', 'build-pack:geometrypack', 'build-pack:quadpack', 'build-pack:timelinepack']);
	grunt.registerTask('unittest',	['karma:unit']);

	//! AT: no better place to put this
	function extractFilename(path) {
		var index = path.lastIndexOf('/');
		return index === -1 ? path : path.substr(index + 1);
	}

	// Creates src/goo.js that depends on all engine modules
	grunt.registerTask('main-file', function() {
		var sourceFiles = glob.sync('!(*pack)/**/*.js', { cwd: 'src/goo/', nonegate: true })
		var allModules = _.map(sourceFiles, function (f) {
			return 'goo/' + f.replace(/\.js/, '');
		});

		var lines = [];
		lines.push('require([');
		lines.push(_.map(allModules, function (m) { return "\t'" + m + "'"; }).join(',\n'));
		lines.push('], function (');

		var fileNames = allModules.map(extractFilename);

		lines.push('\t' + fileNames.join(',\n\t'));
		lines.push(') {');
		lines.push('\tvar goo = window.goo;\n\tif (!goo) { return; }');
		fileNames.forEach(function (fileName) {
			lines.push('\tgoo.' + fileName + ' = ' + fileName + ';');
		});

		lines.push('});');

		fs.writeFileSync('src/goo.js', lines.join('\n'));
	});

	// Creates an HTML list of tests in visual-test/index.html
	grunt.registerTask('visualtoc',function(){
		var toc = require('./visual-test/toc');
		toc.run();
	});
};
