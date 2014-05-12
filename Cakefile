require('coffee-script')
fs = require('fs')
path = require('path')
child_process = require('child_process')
# convert = require('./converter/convert').convert
wrench = require('wrench')
rimraf = require('rimraf')

# Run a command and exit with an error message if it fails.
runCommand = (cmd, callback) ->
	args = cmd.split(/\s+/)
	executable = args.shift()
	child = child_process.spawn(executable, args);

	child.stdout.on 'data', (data) ->
		process.stdout.write data
	child.stderr.on 'data', (data) ->
		process.stdout.write data
	child.on 'close', (code) ->
		if code == 0
			callback?()
		else
			console.log 'Command failed: ' + cmd
			process.exit(1)

endsWith = (str, suffix)-> str.indexOf(suffix, str.length - suffix.length) != -1

task 'minify', 'Minifies the whole project, or only one file if given two arguments', (options) ->
	rimraf 'out/minified', ->
		runCommand 'node_modules/grunt-cli/bin/grunt minify'

# Deprecated. Use "grunt karma" instead
task 'testserver', 'Start Testacular server', (options) ->
	server = require('testacular').server
	server.start(configFile: 'test/testacular.conf.js')

# Deprecated. Use "grunt karma" instead
task 'testmin', 'Start Testacular server for minified engine', ->
	server = require('testacular').server
	server.start(configFile: 'test/testacular-min.conf.js')

option '-o', '--output [FILE]', 'Outputfile'

# Deprecated. Use "grunt jshint" instead
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

#! schteppe: does not even work.
task 'whitespace',
	'Removes trailing whitespace in source files. Requires find, xargs and sed commands.',
	(options) ->
		dirs = ['src', 'test', 'examples']
		do next = ->
			dir = dirs.shift()
			runCommand "find #{dir} -type f -name '*.js' | xargs sed --in-place -r 's/\\s+$//'", ->
				if dirs.length
					next()

#!schteppe: unused?
task 'checkstyleforjenkins', 'Run JSHint to XML', (options) ->
	# I'm not sure that the cli module is official,
	# but it's a convenient way of running JSHint
	# with the same config files (.jshintrc and .jshintignore)
	# as when running from the command-line.
	cli = require('jshint/src/cli/cli')
	cmdopts = cli.interpret('jshint --reporter=checkstyle src/ test/')

# Deprecated. Use "grunt init-git" instead.
task 'init-git', 'Install the precommit script', (options) ->
	fs.writeFile '.git/hooks/pre-commit', '#!/bin/sh\nexec node tools/pre-commit.js\n'

#!schteppe: Does not work
task 'convert',
	"Converts a file from old json structure to new directory-json structure.\nUse cake convert [inputFile] [outputDirectory].",
	(options) ->
		if options.arguments.length != 4
			console.log 'Wrong paramaters, use cake convert [inputFile] [outputDirectory] [objectname]'
		else
			convert options.arguments[1], options.arguments[2], options.arguments[3]
			console.log "#{options.arguments[1]} converted"
		process.exit(0)

option '-t', '--template [TEMPLATE]', 'The template to build the docs with: json, default'

# Deprecated. Use "grunt jsdoc" or "grunt jsdoc_json" instead.
task 'jsdoc',
	'Creates the API documentation',
	(options) ->
		# This requires a shell.
		# To make this work in Windows too,
		# we could run JSdoc as a Node module.

		if options.template
			template = options.template
		else
			template = 'default'

		console.log 'template: ', template

		if template == 'json'
			command = path.resolve('tools', 'generate_jsdoc_json.sh')
		else
			command = path.resolve('tools', 'generate_jsdoc.sh')

		runCommand command

# Deprecated. Use "grunt toc:visualtest" instead
task 'visualtoc',
	'Creates a table of content index.html for visual tests',
	->
		toc = require('./visual-test/toc')
		toc.run()

# Deprecated. Use "grunt toc:examples" instead
task 'examplestoc',
	'Creates a table of content index.html for examples',
	->
		toc = require('./examples/toc')
		toc.run()
