fs = require('fs')
path = require('path')
mkdirp = require('mkdirp')


# Minifying files

minifyFile = exports.minifyFile = (fileIn, fileOut, callback) ->
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
		if error?
			console.log('closure error: ' + error);
			callback error
		else
			console.log('Minify complete')
			callback null

# Removes unnecessary whitespace from JS source code
strip = (source) ->
	source.replace /\s+/g, ' '

wrap = (source) ->
	return '// Goo Engine. Copyright 2013 Goo Technologies AB\n' + strip("""
(function(window,undefined){
	var f=function(){""") + source + strip("""};
	if(window.localStorage&&window.localStorage.gooPath){
		require.config({
			paths: {
				goo: localStorage.gooPath
			}
		});
	}else f();
})(window);""");

optimize = ({absroot, fileIn, fileOut, options}, callback) ->
	filePathIn = path.relative(absroot, fileIn).slice(0,-3)

	base = path.dirname(fileIn)
	fileIn = path.basename(fileIn, '.js')
	tempClosure = "#{absroot}/clos_temp.js"
	includeRequireLib = options.include == 'requireLib'
	
	requirejs = require('requirejs')
	config =
		baseUrl: absroot
		useStrict : true
		out: tempClosure
		name: filePathIn
		optimize: 'none'
		paths:
			'goo/lib' : 'empty:'
			'requireLib' : '../../lib/require'

	# this is an implementation of the idea to include require.js into goo.js
	# this currently does not work with the wrap code
	if options.include
		config.include = [options.include]

	# Concatenate all files into the file tempClosure
	requirejs.optimize config, (buildResponse) ->
		#files = buildResponse.split("\n")
		# Now minify that concatenated file
		tempMinified = "#{absroot}/minified_temp.js"
		minifyFile tempClosure, tempMinified, (err)->
			if err
				return callback err
			minifiedSource = fs.readFileSync(tempMinified)
			if !includeRequireLib
				minifiedSource = wrap(minifiedSource)
			fs.writeFile fileOut, minifiedSource, callback
		console.log buildResponse
	, (err) ->
		callback err

exports.minifyProject = (sourcePath, targetFile, includes, options, callback) ->

	absroot = path.resolve(sourcePath)

	if includes.length == 0
		console.log 'No files to include'
		return
	else if includes.length > 1
		pathsToInclude = '{'+includes.join(',')+'}'
	else
		pathsToInclude = includes[0]

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
				options: options
			}, callback
