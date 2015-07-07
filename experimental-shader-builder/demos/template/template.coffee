'use strict'

templateEditor = null
dataEditor = null
outputEditor = null


setupEditors = ->
	fontSize = 16

	templateEditor = ace.edit 'template-editor'
	templateEditor.setTheme 'ace/theme/monokai'
	templateEditor.getSession().setMode 'ace/mode/glsl'
	templateEditor.getSession().setUseWrapMode true
	templateEditor.setFontSize fontSize
	templateEditor.on 'input', onInput

	dataEditor = ace.edit 'data-editor'
	dataEditor.setTheme 'ace/theme/monokai'
	dataEditor.getSession().setMode 'ace/mode/javascript'
	dataEditor.getSession().setUseWrapMode true
	dataEditor.setFontSize fontSize
	dataEditor.on 'input', onInput

	outputEditor = ace.edit 'output-editor'
	outputEditor.setTheme 'ace/theme/monokai'
	outputEditor.getSession().setMode 'ace/mode/glsl'
	outputEditor.getSession().setUseWrapMode true
	outputEditor.setReadOnly true
	outputEditor.setFontSize fontSize


onInput = ->
	templateText = templateEditor.getValue()
	dataText = dataEditor.getValue()

	template = compileTemplate templateText
	result = template JSON.parse dataText

	outputEditor.setValue result

	return


compileTemplate = (source) ->

	compileLine = (line) ->
		trimmed = line.trim()
		return '' if trimmed.length == 0

		if (trimmed.indexOf '/*') == 0 and (trimmed.lastIndexOf '*/') == trimmed.length - 2
			trimmed.slice 2, -2
		else
			replacedBegin = trimmed.replace /\/\*/g, '" +'
			replacedEnd = replacedBegin.replace /\*\//g, '+ "'

			"__str += \"#{replacedEnd}\\n\";"


	templateCode = ((source.split '\n').map compileLine).join '\n'
	templateCode = "var __str = '';\n#{templateCode}\n return __str;"

	new Function 'data', templateCode


getSample = (name) ->
	$.ajax { url: "samples/#{name}/shader.frag", dataType: 'text' }
	.done (text) ->
		templateEditor.setValue text, -1

	$.ajax { url: "samples/#{name}/config.json", dataType: 'text' }
	.done (text) ->
		dataEditor.setValue text, -1


setupEditors()
getSample 's1'