// jshint node:true

var path = require('path');


module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		// is this task ever called?
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
				'out-doc/'
			]
		},
		'build-pack': {
			fsmpack: {
				packPath: 'fsmpack'
			},
			geometrypack: {
				packPath: 'geometrypack'
			},
			quadpack: {
				packPath: 'quadpack'
			},
			timelinepack: {
				packPath: 'timelinepack'
			},
			debugpack: {
				packPath: 'debugpack'
			},
			scriptpack: {
				packPath: 'scriptpack'
			},
			p2pack: {
				packPath: 'addons/p2pack'
			},
			box2dpack: {
				packPath: 'addons/box2dpack'
			},
			terrainpack: {
				packPath: 'addons/terrainpack'
			},
			ammopack: {
				packPath: 'addons/ammopack'
			},
			cannonpack: {
				packPath: 'addons/cannonpack'
			},
			waterpack: {
				packPath: 'addons/waterpack'
			},
			linerenderpack: {
				packPath: 'addons/linerenderpack',
				outBaseDir: 'out'
			},
			animationpack: {
				packPath: 'animationpack'
			},
			soundmanager2pack: {
				packPath: 'addons/soundmanager2pack'
			},
			gamepadpack: {
				packPath: 'addons/gamepadpack'
			},
			passpack: {
				packPath: 'passpack'
			},
			gizmopack: {
				packPath: 'util/gizmopack'
			},
			physicspack: {
				packPath: 'addons/physicspack'
			}
		},
		'preprocess': {
			prod: {
				defines: {
					DEBUG: false
				}
			},
			dev: {
				defines: {
					DEBUG: true
				}
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
				command: 'node tools/modoc/src/modoc.js src/goo tools/modoc/src/templates tools/modoc/src/statics out-doc'
			},
			update_webdriver: {
				options: {
					stdout: true
				},
				command: path.resolve('node_modules/webdriver-manager/bin/webdriver-manager') + ' update --standalone --chrome'
			},
			e2e: {
				command: 'node test/e2etesting/manualSpec.js'
			},
			'modoc-test': {
				command: 'node node_modules/jasmine-node/bin/jasmine-node tools/modoc/test/spec'
			}
		},
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
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.loadTasks('tools/grunt_tasks');

	grunt.registerTask('default',	 ['minify']);
	grunt.registerTask('jsdoc',		 ['shell:jsdoc']);
	grunt.registerTask('minify',	 [
		'main-file',
		'preprocess:prod',
		'requirejs:build',
		'uglify:build', 
		'wrap',
		'build-pack'
	]);
	grunt.registerTask('minify-no-mangle', [
		'main-file',
		'preprocess:prod',
		'requirejs:no-mangle',
		'uglify:build',
		'wrap',
		'build-pack'
	]);
	grunt.registerTask('unittest',	 ['karma:unit']);
	grunt.registerTask('coverage',	 ['unittest']);
	grunt.registerTask('e2e',		 ['shell:e2e']);
	grunt.registerTask('test',		 ['unittest', 'e2e']);
	grunt.registerTask('modoc-test', ['shell:modoc-test']);
};
