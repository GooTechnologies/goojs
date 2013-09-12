var glob = require('glob');
var _ = require('underscore')
var fs = require('fs')

// Create the gooengine.js dummy module that depends on all other js files.
function createMainFile() {
	var sourceFiles = glob.sync('**/*.js', {cwd: 'src/goo/'})
	var allModules = _.map(sourceFiles, function(f) {
		return 'goo/' + f.replace(/\.js/, '');
	});

	fs.writeFileSync('src/gooengine.js', 'define([\n' +
		_.map(allModules, function(m) { return "\t'" + m + "'"; }).join(',\n') +
	'\n], function() {});\n')
}

// This should not be done every time grunt runs; only when we're minifying.
// I wonder how to make this a dependency on the requirejs task.
createMainFile();

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'src/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},
		requirejs: {
			dist: {
				// Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
				options: {
					baseUrl: 'src/',
					optimize: 'uglify2',  // uglify, uglify2, closure, closure.keepLines
					preserveLicenseComments: false,
					useStrict: true,
					wrap: true,
					keepBuildDir: true,
					generateSourceMaps: true,
					dir: 'out/minified/',
					modules: [{
						name: 'gooengine',
					}],
					wrap: {
						start:
							'/* Goo Engine <%= pkg.version %>\n' +
							' * Copyright 2013 Goo Technologies AB\n' +
							' */\n' +
							'(function(window, undefined) {',
						end: '}(window));'
					},
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-requirejs');

	grunt.registerTask('default', ['minify']);
	grunt.registerTask('minify', ['requirejs']);

};
