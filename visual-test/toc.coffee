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
	ret = '<ul>'
	for branch, link of tree
		ret += '<li>'
		if typeof link == 'string'
			ret += "<a href=\"#{link.slice(12)}\">#{branch}</a>"
		else
			ret += branch
			ret += printTree(link)
		ret += '</li>'
	ret += '</ul>'
	return ret

exports.run = ->
	glob 'visual-test/**/!(index).html', (err, files) ->
		if err
			console.log err
			return
		if files.length == 0
			console.log 'No files'
			return
		
		tree = makeTree(files)
		#console.log JSON.stringify(tree, null, '\t')
		
		content = '''
	<html>
	<head>
		<title>Visual tests</title>
	</head>
	<body>
	<h1>Contents</h1>
	'''
	
		content += printTree(tree)
		
		fs.writeFileSync path.resolve('visual-test','index.html'), content