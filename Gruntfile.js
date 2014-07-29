/* global module */
var glob = require('glob');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
//var buildPack = require('./tools/buildPack');

module.exports = function (grunt) {
	'use strict';
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
					}

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
		uglify: {
			ammoworker: {
				files: {
					'out/ammo_worker.js': ['src/goo/addons/ammopack/ammo_worker.js']
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
					'visual-test/index.html',
					'examples/index.html'
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
				packPath: 'fsmpack',
				outBaseDir: 'out'
			},
			geometrypack: {
				packPath: 'geometrypack',
				outBaseDir: 'out'
			},
			quadpack: {
				packPath: 'quadpack',
				outBaseDir: 'out'
			},
			timelinepack: {
				packPath: 'timelinepack',
				outBaseDir: 'out'
			},
			debugpack: {
				packPath: 'debugpack',
				outBaseDir: 'out'
			},
			scriptpack: {
				packPath: 'scriptpack',
				outBaseDir: 'out'
			},
			p2pack: {
				packPath: 'addons/p2pack',
				outBaseDir: 'out'
			},
			box2dpack: {
				packPath: 'addons/box2dpack',
				outBaseDir: 'out'
			},
			terrainpack: {
				packPath: 'addons/terrainpack',
				outBaseDir: 'out'
			},
			ammopack: {
				packPath: 'addons/ammopack',
				outBaseDir: 'out'
			},
			cannonpack: {
				packPath: 'addons/cannonpack',
				outBaseDir: 'out'
			},
			howlerpack: {
				packPath: 'addons/howlerpack',
				outBaseDir: 'out'
			},
			waterpack: {
				packPath: 'addons/waterpack',
				outBaseDir: 'out'
			},
			animationpack: {
				packPath: 'animationpack',
				outBaseDir: 'out'
			},
			soundmanager2pack: {
				packPath: 'addons/soundmanager2pack',
				outBaseDir: 'out'
			},
			gamepadpack: {
				packPath: 'addons/gamepadpack',
				outBaseDir: 'out'
			},
			passpack: {
				packPath: 'passpack',
				outBaseDir: 'out'
			},
			gizmopack: {
				packPath: 'util/gizmopack',
				outBaseDir: 'out'
			}
		},
		'generate-toc': {
			'visual-test': {
				path: 'visual-test',
				title: 'Visual tests'
			},
			'examples': {
				path: 'examples',
				title: 'Examples'
			}
		},
		'build-custom': {
			myBundle: {
				outFile: 'bundle.js'
			}
		},
		karma: {
			unit: {
				configFile: 'test/unit/karma.conf.js',
				singleRun: true,
				browsers: ['Chrome'] // Phantom just doesn't have support for the goodies we've come to know and love
			}
		},
		shell: {
			jsdoc: {
				command: path.resolve('tools', 'generate_jsdoc.sh')
			},
			jsdoc_json: {
				command: path.resolve('tools', 'generate_jsdoc_json.sh')
			},
			update_webdriver: {
				options: {
					stdout: true
				},
				command: path.resolve('node_modules/webdriver-manager/bin/webdriver-manager') + ' update --standalone --chrome'
			},
			e2e: {
				command: 'node test/e2etesting/manualSpec.js'
			}
		},
		/*
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
	    */
		jshint: {
			all: ['src'],
			options: {
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
	//grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.loadTasks('tools/grunt_tasks');

	grunt.registerTask('default',	['minify']);
	grunt.registerTask('docs',		['shell:jsdoc']);
	grunt.registerTask('jsdoc',		['shell:jsdoc']);
	grunt.registerTask('minify',	['main-file', 'requirejs:build', 'wrap', 'build-pack', 'uglify:ammoworker']);
	grunt.registerTask('unittest',	['karma:unit']);
	grunt.registerTask('e2e',		['shell:e2e']);
	grunt.registerTask('test',		['unittest', 'e2e']); // this gruntfile is a mess

	//! AT: no better place to put this
	function extractFilename(path) {
		var index = path.lastIndexOf('/');
		return index === -1 ? path : path.substr(index + 1);
	}

	// Creates src/goo.js that depends on all engine modules
	grunt.registerTask('main-file', function () {
		// prefiltering out files in packs on the 'ground' level
		var sourceFiles = glob.sync('!(*pack)/**/*.js', { cwd: 'src/goo/', nonegate: true });

		// filtering files in packs that are not on the 'ground' level
		var regexp = /.+pack\/.+/;
		sourceFiles = sourceFiles.filter(function (sourceFile) {
			return !regexp.test(sourceFile);
		});

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

	grunt.registerTask('init-git', function () {
		fs.writeFileSync('.git/hooks/pre-commit', '#!/bin/sh\nexec node tools/pre-commit.js\n');
	});

	// Generates reference screenshots
	grunt.registerTask('refs', function () {
		var done = this.async();
		require('child_process').exec('node test/e2etesting/generate-reference-screenshots', function (error, stdout, stderr) {
		    console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
				console.log('exec error: ' + error);
		    }
		    done();
		});
	});
};
