/* global module */

var path = require('path');


module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
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

	grunt.registerTask('default',	['minify']);
	grunt.registerTask('docs',		['shell:jsdoc']);
	grunt.registerTask('jsdoc',		['shell:jsdoc']);
	grunt.registerTask('minify',	['main-file', 'requirejs:build', 'wrap', 'build-pack']);
	grunt.registerTask('unittest',	['karma:unit']);
	grunt.registerTask('coverage',	['unittest']);
	grunt.registerTask('e2e',		['shell:e2e']);
	grunt.registerTask('test',		['unittest', 'e2e']);
};
