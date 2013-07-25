fs = require('fs')
esprima = require('esprima')
escodegen = require('escodegen')

traverse = (node, stack, func) ->
	func node, stack
		
	for key, child of node
		if typeof child == 'object'
			if Array.isArray child
				for elem, idx in child
					traverse elem, stack + '.' + key + '.' + idx, func
			else
				traverse child, stack + '.' + key, func

removeFunc = ( code, funcName ) ->
	syntax = esprima.parse(code, { raw: true, tokens: true, range: true, comment: true });
	syntax = escodegen.attachComments(syntax, syntax.comments, syntax.tokens);

	path = ''
	traverse syntax, '', (node, stack) ->
		if node?.name == funcName
			path = stack

	path = path.substring 1; # remove leading dot
	console.log 'found path: ', path
	parts = path.split '.'
	ast = syntax;
	for part, idx in parts
		if( idx == parts.length - 4 && ast[part]?.type == 'ExpressionStatement')
			console.log 'found ExpressionStatement to be removed'
			ast.splice( part, 1 ); # remove this ExpressionStatement
			break
		ast = ast[part]
	
	#fs.writeFileSync 'testxy.json', JSON.stringify( syntax, null, "  " );
		
	return escodegen.generate(syntax, comment: true);

# EXAMPLE USAGE:
# newCode = removeFunc (fs.readFileSync 'src/goo/renderer/Camera.js'), 'setToObliqueMatrix'
# fs.writeFileSync 'testxy.js', newCode
