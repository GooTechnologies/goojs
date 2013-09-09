var glob = require('glob');
var _ = require('underscore')

var sourceFiles = glob.sync('**/*.js', {cwd: 'src/goo/'})
var allModules = _.map(sourceFiles, function(f) { return f.replace(/\.js/, ''); });

console.log('allModules', allModules);

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
/*
			compile: {
				options: {
					baseUrl: 'src',
					name: 'goo',
					//include: '*',
					//mainConfigFile: "path/to/config.js",
					//out: "path/to/optimized.js"
					out: 'optimized.js'
				}
			}
*/
			dist: {
				// Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
				options: {
					baseUrl: 'src/',
					optimize: 'uglify',  // uglify, uglify2, closure, closure.keepLines
					preserveLicenseComments: false,
					useStrict: true,
					wrap: true,
					//name: '*.js',
					//out: 'out.js',
					//keepBuildDir: true
					//generateSourceMaps: true
					dir: 'out/minified/',
					modules: [{
						//name: 'goo/loaders/DynamicLoader',
						name: 'gooengine',
					}],
					wrap: {
						start: '// Goo Engine <%= pkg.version %>\n(function() {',
						end: '}());'
					},
					uglify: {
						make_seqs: false,
						beautify: true
					}
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-requirejs');

	grunt.registerTask('default', ['uglify']);

	grunt.registerTask('foo', ['requirejs']);

};
