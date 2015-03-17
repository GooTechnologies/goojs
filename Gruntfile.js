// jshint node:true

var path = require('path');



module.exports = function (grunt) {
	'use strict';

	var packs = {
		fsmpack: 'fsmpack',
		geometrypack: 'geometrypack',
		quadpack: 'quadpack',
		timelinepack: 'timelinepack',
		debugpack: 'debugpack',
		scriptpack: 'scriptpack',
		p2pack: 'addons/p2pack',
		box2dpack: 'addons/box2dpack',
		terrainpack: 'addons/terrainpack',
		ammopack: 'addons/ammopack',
		cannonpack: 'addons/cannonpack',
		waterpack: 'addons/waterpack',
		linerenderpack: 'addons/linerenderpack',
		animationpack: 'animationpack',
		soundmanager2pack: 'addons/soundmanager2pack',
		gamepadpack: 'addons/gamepadpack',
		passpack: 'passpack',
		gizmopack: 'util/gizmopack',
		physicspack: 'addons/physicspack'
	};

	function getPacksConfig(packs) {
		return Object.keys(packs).reduce(function (config, packName) {
			config[packName] = { packPath: packs[packName] };
			config[packName + '-no-mangle'] = { packPath: packs[packName], mangle: false };
			return config;
		}, {});
	}

	var packConfigs = getPacksConfig(packs);

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
		'build-pack': packConfigs,
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

	grunt.registerTask('jsdoc',		 ['shell:jsdoc']);
	grunt.registerTask('unittest',	 ['karma:unit']);
	grunt.registerTask('coverage',	 ['unittest']);
	grunt.registerTask('e2e',		 ['shell:e2e']);
	grunt.registerTask('test',		 ['unittest', 'e2e']);
	grunt.registerTask('modoc-test', ['shell:modoc-test']);

	var buildPackArray = Object.keys(packs).map(function (packName) {
		return 'build-pack:' + packName;
	});

	var buildPackNoMangleArray = Object.keys(packs).map(function (packName) {
		return 'build-pack:' + packName + '-no-mangle';
	});

	grunt.registerTask('minify', [
		'main-file',
		'preprocess:prod',
		'requirejs:build',
		'uglify:build',
		'wrap'
	].concat(buildPackArray));

	grunt.registerTask('minify-no-mangle', [
		'main-file',
		'preprocess:prod',
		'requirejs:no-mangle',
		'uglify:build',
		'wrap'
	].concat(buildPackNoMangleArray));

	grunt.registerTask('default', ['minify']);
};
