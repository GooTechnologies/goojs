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