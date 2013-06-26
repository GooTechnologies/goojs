fs = require('fs')
path = require('path')
mkdirp = require('mkdirp')


# Minifying files

doClosure = (fileIn, fileOut, deleteAfter, callback) ->
	dir = path.dirname(path.resolve(fileOut))
	mkdirp.sync dir
	
	command = 'java -jar buildengine/compiler.jar ' + 
		'--compilation_level=SIMPLE_OPTIMIZATIONS --language_in ECMASCRIPT5_STRICT ' +
		#'--jscomp_warning=checkTypes ' +
		'--jscomp_off=internetExplorerChecks --js ' + fileIn + ' ' +
		#'--formatting=pretty_print --externs newbuild/externs.js --externs newbuild/jquery-1.8.js ' +
		'--js_output_file ' + fileOut
		
	exec = require('child_process').exec;
	exec command,
		maxBuffer: 100*1024*1024
	, (error, stdout, stderr) ->
		if deleteAfter
			fs.unlink fileIn
		if error?
			console.log('closure error: ' + error);
			callback?(false)
		else
			console.log('Minify complete')
			callback?(true)

optimize = ({absroot, fileIn, fileOut, deleteAfter}, callback) ->
	filePathIn = path.relative(absroot, fileIn).slice(0,-3)

	base = path.dirname(fileIn)
	fileIn = path.basename(fileIn, '.js')
	tempClosure = "#{absroot}/clos_temp.js"
	
	requirejs = require('requirejs')
	config =
		baseUrl: absroot
		useStrict : true
		out: tempClosure
		name: filePathIn
		optimize: 'none'
		paths:
			'goo/lib' : 'empty:'

	requirejs.optimize config, (buildResponse) ->
		#files = buildResponse.split("\n")
		if deleteAfter
			fs.unlink "#{absroot}/#{fileIn}.js"
		doClosure tempClosure, fileOut, true, callback
		console.log buildResponse
	, (err) ->
		console.log err
		callback?(false)


minify = (sourcePath, targetFile, includefile, callback) ->

	absroot = path.resolve(sourcePath)
	if includefile
		fs.readFile includefile, 'utf-8', (err, data) ->
			if err then return console.log err

			lines = data.split(/\s+/)

			if lines.length > 1
				pathsToInclude = '{'+lines.join(',')+'}'
			else
				pathsToInclude = lines[0]

			# If there are no paths to include
			if /^(\{[\s,]*\}|\s*)$/.test pathsToInclude
				return console.log 'No files to include'

			glob = require('glob')
			glob pathsToInclude, {cwd: absroot}, (err, files) ->
				if files.length == 0
					console.log 'No files found'
					process.exit

				for f, idx in files
					files[idx] = "\""+f.slice(0, f.lastIndexOf('.'))+"\""

				source = "require([#{files}]);\n"
				tempRequire = "#{absroot}/req_temp.js"

				fs.writeFile tempRequire, source, ->
					optimize {
						absroot: absroot
						fileIn: tempRequire
						fileOut: targetFile
						deleteAfter: true
					}, callback
	else
		doClosure sourcePath, targetFile, false, callback

exports.minify = minify
