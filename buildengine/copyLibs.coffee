fs = require('fs')
path = require('path')
mkdirp = require('mkdirp')
glob = require('glob')

copyFile = (source, target) ->
  indata = fs.readFileSync source
  mkdirp.sync path.dirname(target)
  fs.writeFileSync target, indata


copyLibs = (base, target, includes) ->
	base = path.resolve(base)
	target = path.resolve(target)
		
	if includes.length > 1
		pathsToInclude = '{'+includes.join(',')+'}'
	else
		pathsToInclude = includes[0]

	glob pathsToInclude, {cwd: base}, (err, files) ->
		for file in files
			console.log "Copying",path.resolve(base, file), path.resolve(target, file)
			copyFile path.resolve(base, file), path.resolve(target, file)
				
exports.copyLibs = copyLibs
