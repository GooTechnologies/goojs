minify = require('./buildengine/minify').minify
	
task 'minify', 'minify try', (options) ->

	console.log 'minifying'
	fileIn = 'src'
	fileOut = 'minified/goo.js'
	includefile = 'buildengine/glob/minify.glob'

	minify(fileIn, fileOut, true, includefile)	

option '-i', '--input [FILE]', 'Entrypoint file'
option '-o', '--output [FILE]', 'Output file'

task 'minifysmall', 'one minify', (options) ->
	console.log "minifying #{options.input}"
	fileOut = "minified/#{options.output}.js"
	
	minify(options.input, fileOut, true)

task 'testserver', 'Start Testacular server', (options) ->
	server = require('testacular').server
	server.start(configFile: 'test/testacular.conf.js')

task 'checkstyle', 'Run JSHint', (options) ->
	# I'm not sure that the cli module is official,
	# but it's a convenient way of running JSHint
	# with the same config files (.jshintrc and .jshintignore)
	# as when running from the command-line.
	cli = require('jshint/src/cli/cli')
	cmdopts = cli.interpret('jshint --reporter=tools/jshint-reporter.js src/ test/')
