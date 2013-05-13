fs = require('fs')
path = require('path')
mkdirp = require('mkdirp')
glob = require('glob')

copyFile = (source, target) ->
  indata = fs.readFileSync source
  mkdirp.sync path.dirname(target)
  fs.writeFileSync target, indata


copyLibs = (base, target, includeFile) ->
	base = path.resolve(base)
	target = path.resolve(target)
	
	fs.readFile path.resolve(includeFile), 'utf-8', (err, data) ->
		if err then return console.log err
		
		lines = data.split(/\s+/)
		
		if lines.length > 1
			pathsToInclude = '{'+lines.join(',')+'}'
		else
			pathsToInclude = lines[0]
		
		# If there are no paths to include
		if /^(\{[\s,]*\}|\s*)$/.test pathsToInclude
			return console.log 'No files to include'

		glob pathsToInclude, {cwd: base}, (err, files) ->
			if(files.length == 0)
				console.log 'No files found'
				process.exit

			for file in files
				console.log "Copying",path.resolve(base, file), path.resolve(target, file)
				copyFile path.resolve(base, file), path.resolve(target, file)
				
exports.copyLibs = copyLibs