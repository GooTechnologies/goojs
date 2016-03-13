var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var toc = require('./tools/table-of-contents');
var outWatch = require('./tools/build-watch.js');

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		webpack: {
			packsAndCore: {
				entry: {
					goo: ['./src/goo'],
					animationpack: ['./src/goo/animationpack'],
					fsmpack: ['./src/goo/fsmpack'],
					geometrypack: ['./src/goo/geometrypack'],
					quadpack: ['./src/goo/quadpack'],
					timelinepack: ['./src/goo/timelinepack'],
					debugpack: ['./src/goo/debugpack'],
					scriptpack: ['./src/goo/scriptpack'],
					p2pack: ['./src/goo/addons/p2pack'],
					box2dpack: ['./src/goo/addons/box2dpack'],
					terrainpack: ['./src/goo/addons/terrainpack'],
					ammopack: ['./src/goo/addons/ammopack'],
					cannonpack: ['./src/goo/addons/cannonpack'],
					waterpack: ['./src/goo/addons/waterpack'],
					linerenderpack: ['./src/goo/addons/linerenderpack'],
					soundmanager2pack: ['./src/goo/addons/soundmanager2pack'],
					physicspack: ['./src/goo/addons/physicspack'],
					gamepadpack: ['./src/goo/addons/gamepadpack'],
					passpack: ['./src/goo/passpack'],
					particlepack: ['./src/goo/addons/particlepack'],
					gizmopack: ['./src/goo/util/gizmopack'],
					logicpack: ['./src/goo/logicpack']
				},
				output: {
					filename: "out/[name].js"
				},
				plugins: [
					new webpack.optimize.CommonsChunkPlugin('goo', 'out/goo.js')
				]
			}
		},

		preprocess: {
			out: {
				cwd: 'out',
				src: '**.js',
				dest: 'out',
				expand: true,
				options: {
					context : {
						DEBUG: false
					}
				}
			},
		},

		wrap: {
			out: {
				src: 'out/*.js',
				dest: '', // Same as the infile
				options: {
					wrapper: [
						'/* Goo Engine ' + (grunt.option('goo-version') || 'UNOFFICIAL') + '\n' +
						' * Copyright 2015 Goo Technologies AB\n' +
						' */\n',
						''
					]
				}
			}
		},

		uglify: {
			out: {
				files: [{
					expand: true,
					cwd: 'out',
					src: '**/*.js',
					dest: 'out'
				}]
			}
		},

		copy: {
			lib: {
				files: [{
					expand: true,
					cwd: 'out',
					src: '*.js',
					dest: 'lib/'
				}]
			}
		},

		watch: {
			dev: {
				files: ['src/**/*.js'],
				tasks: ['minify-dev'],
				options: {
					spawn: false
				}
			}
		},

		clean: {
			out: {
				src: [
					'out/'
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

		'generate-toc': {
			'visual-test': {
				path: 'visual-test',
				title: 'Visual tests'
			},
			examples: {
				path: 'examples',
				title: 'Examples'
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
	grunt.loadNpmTasks('grunt-wrap');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-keepalive');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-webpack');
	grunt.loadNpmTasks('grunt-preprocess');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('jsdoc',		 ['shell:jsdoc']);
	grunt.registerTask('tern',		 ['shell:tern']);
	grunt.registerTask('unittest',	 ['karma:unit']);
	grunt.registerTask('coverage',	 ['unittest']);
	grunt.registerTask('e2e',		 ['shell:e2e']);
	grunt.registerTask('test',		 ['unittest', 'e2e']);
	grunt.registerTask('modoc-test', ['shell:modoc-test']);

	grunt.registerTask('fast-watch', ['manual-watch', 'keepalive']);

	grunt.registerTask('init-git', function () {
		fs.writeFileSync('.git/hooks/pre-commit', '#!/bin/sh\nexec node tools/pre-commit.js\n');
		fs.chmodSync('.git/hooks/pre-commit', '777');
	});

	grunt.registerMultiTask('generate-toc', 'Generates the Table of contents for a directory', function () {
		toc.run(
			this.data.path,
			this.data.title
		);
	});

	grunt.registerTask('manual-watch', function () {
		outWatch.run();
	});

	grunt.registerTask('minify', ['webpack', 'preprocess', 'uglify', 'wrap', 'generate-toc', 'copy']);
	grunt.registerTask('minify-dev', ['webpack', 'copy']);
	grunt.registerTask('default', ['minify']);
};
