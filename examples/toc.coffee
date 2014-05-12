glob = require('glob')
path = require('path')
fs = require('fs')

makeTree = (files) ->
	tree = {}
	for file in files
		parts = file.split('/')
		branch = tree
		for part, idx in parts
			if idx == parts.length - 1
				branch[part] = file
				break
			if not branch[part]
				branch[part] = {}
			branch = branch[part]
	return tree

printTree = (tree) ->
	ret = '<ul>\n'
	for branch, link of tree
		ret += '<li>'
		if typeof link == 'string'
			ret += "<a href=\"#{link}\">#{branch}</a>"
		else
			ret += branch
			ret += printTree(link)
		ret += '</li>\n'
	ret += '</ul>\n'
	return ret

exports.getFiles = (callback) ->
	glob __dirname + '/**/!(index).html', (err, files) ->
		callback err, files

exports.getFilesSync = ->
	return glob.sync __dirname+'/**/!(index).html'

exports.getFilePathsSync = ->
	return glob.sync __dirname + '/**/!(index).html'

exports.run = ->
	files = exports.getFilesSync()

	for file, i in files
		files[i] = path.relative __dirname, file

	tree = makeTree(files)
	#console.log JSON.stringify(tree, null, '\t')

	content = '''
		<html>
		<head>
			<title>Examples</title>
		</head>
		<body>
		<h1>Contents</h1>
	'''

	content += printTree(tree)

	content += '''
		</body>
		</html>
	'''

	fs.writeFileSync path.resolve('examples','index.html'), content
