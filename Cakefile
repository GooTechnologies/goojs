minify = require('./buildengine/minify').minify
exec = require('child_process').exec


	
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

task 'testmin', 'Start Testacular server for minified engine', ->
	server = require('testacular').server
	server.start(configFile: 'test/testacular-min.conf.js')
	
option '-o', '--output [FILE]', 'Outputfile'

task 'checkstyle', 'Run JSHint', (options) ->
	# I'm not sure that the cli module is official,
	# but it's a convenient way of running JSHint
	# with the same config files (.jshintrc and .jshintignore)
	# as when running from the command-line.
	cli = require('jshint/src/cli/cli')
	
	if options.arguments[1]
		files = options.arguments[1]
	else
		files = "src/ test/"
		
	cmdopts = cli.interpret("jshint --reporter=tools/jshint-reporter.js #{files}")

task 'whitespace',
	'Removes trailing whitespace in source files. Requires find, xargs and sed commands.',
	(options) ->
		dirs = ['src', 'test', 'examples']
		do next = ->
			dir = dirs.shift()
			cmd = "find #{dir} -type f -name '*.js' | xargs sed --in-place -r 's/\\s+$//'"
			exec cmd, (error, stdout, stderr) ->
				if error != null
					console.log stderr
					console.log 'Command failed: ' + cmd
					process.exit(1)
				if dirs.length
					next()

task 'checkstyleforjenkins', 'Run JSHint to XML', (options) ->
	# I'm not sure that the cli module is official,
	# but it's a convenient way of running JSHint
	# with the same config files (.jshintrc and .jshintignore)
	# as when running from the command-line.
	cli = require('jshint/src/cli/cli')
	cmdopts = cli.interpret('jshint --reporter=checkstyle src/ test/')
