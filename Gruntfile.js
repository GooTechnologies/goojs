// jshint node:true
'use strict';

var path = require('path');
var _ = require('underscore');

module.exports = function (grunt) {
	var packs = {
		particlepack: 'goo/particlepack',
		fsmpack: 'goo/fsmpack',
		geometrypack: 'goo/geometrypack',
		quadpack: 'goo/quadpack',
		timelinepack: 'goo/timelinepack',
		debugpack: 'goo/debugpack',
		scriptpack: 'goo/scriptpack',
		p2pack: 'goo/addons/p2pack',
		box2dpack: 'goo/addons/box2dpack',
		terrainpack: 'goo/addons/terrainpack',
		ammopack: 'goo/addons/ammopack',
		cannonpack: 'goo/addons/cannonpack',
		waterpack: 'goo/addons/waterpack',
		linerenderpack: 'goo/addons/linerenderpack',
		animationpack: 'goo/animationpack',
		soundmanager2pack: 'goo/addons/soundmanager2pack',
		gamepadpack: 'goo/addons/gamepadpack',
		passpack: 'goo/passpack',
		gizmopack: 'goo/util/gizmopack',
		physicspack: 'goo/addons/physicspack'
	};

	function getPacksConfig(packs) {
		return Object.keys(packs).reduce(function (config, packName) {
			config[packName] = {
				packPath: packs[packName],
				packName: packName,
				minifyLevel: 'full'
			};

			config[packName + '-no-mangle'] = {
				packPath: packs[packName],
				packName: packName,
				minifyLevel: 'light'
			};

			config[packName + '-dev'] = {
				packPath: packs[packName],
				packName: packName,
				minifyLevel: null,
				rootPath: 'src'
			};

			return config;
		}, {});
	}

	// ---
	function getWatchConfig() {
		return Object.keys(packs).reduce(function (config, packName) {
			config[packName] = {
				files: ['src/' + packs[packName] + '/**/*.js'],
				tasks: ['minify-pack:' + packName + '-dev']
			};
			return config;
		}, {
			engine: {
				files: ['src/**/*.js', '!src/**/*pack/**/*.js'],
				tasks: ['minify-main:dev', 'uglify:build', 'wrap']
			}
		});
	}

	// ---
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
		'minify-pack': getPacksConfig(packs),
		'preprocess': {
			build: {
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
				browserDisconnectTimeout: 5000,
				browserDisconnectTolerance: 1,
				browserNoActivityTimeout: 60000,
				browsers: ['Chrome'] // Phantom just doesn't have support for the goodies we've come to know and love
			}
		},
		shell: {
			jsdoc: {
				command: 'node tools/modoc/src/modoc.js src/goo tools/modoc/src/templates tools/modoc/src/statics out-doc'
			},
			tern: {
				command: 'node tools/modoc/src/tern-definitions.js src/goo out-tern'
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
		},
		watch: getWatchConfig(packs),
		eslint: {
			options: {
				configFile: '.eslintrc'
			},
			'src': ['Gruntfile.js', 'src/**/*.js'],
			'unit-test': ['test/unit/*/**/*.js'],
			'visual-test': ['visual-test/goo/goofy/**/*.js']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-wrap');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-keepalive');
	grunt.loadNpmTasks('grunt-eslint');

	grunt.loadTasks('tools/grunt_tasks');

	grunt.registerTask('jsdoc',		 ['shell:jsdoc']);
	grunt.registerTask('tern',		 ['shell:tern']);
	grunt.registerTask('unittest',	 ['karma:unit']);
	grunt.registerTask('coverage',	 ['unittest']);
	grunt.registerTask('e2e',		 ['shell:e2e']);
	grunt.registerTask('test',		 ['unittest', 'e2e']);
	grunt.registerTask('modoc-test', ['shell:modoc-test']);

	grunt.registerTask('fast-watch', ['manual-watch', 'keepalive']);

	var buildPackTasks = _.map(packs, function (packPath, packName) {
		return 'minify-pack:' + packName;
	});

	var buildPackNoMangleTasks = _.map(packs, function (packPath, packName) {
		return 'minify-pack:' + packName + '-no-mangle';
	});

	var buildPackDevTasks = _.map(packs, function (packPath, packName) {
		return 'minify-pack:' + packName + '-dev';
	});

	grunt.registerTask('minify', [
		'preprocess:build',
		'minify-main:build',
		'uglify:build',
		'wrap'
	].concat(buildPackTasks));

	grunt.registerTask('minify-no-mangle', [
		'preprocess:build',
		'minify-main:no-mangle',
		'uglify:build',
		'wrap'
	].concat(buildPackNoMangleTasks));

	grunt.registerTask('minify-dev', [
		'preprocess:build',
		'minify-main:dev',
		'uglify:build',
		'wrap'
	].concat(buildPackDevTasks));

	// skip the preprocess and minify only the engine
	grunt.registerTask('minify-engine-dev', [
		'minify-main:dev',
		'uglify:build',
		'wrap'
	]);

	grunt.registerTask('default', ['minify']);
};
