(function () {
	'use strict';

	var typesEditor;
	var structureEditor;
	var outputEditor;

	function setupEditors() {
		var fontSize = 16;
		typesEditor = ace.edit('types-editor');
		typesEditor.setTheme('ace/theme/monokai');
		typesEditor.getSession().setMode('ace/mode/json');
		typesEditor.getSession().setUseWrapMode(true);
		typesEditor.setFontSize(fontSize);
		typesEditor.on('input', onInput);

		structureEditor = ace.edit('structure-editor');
		structureEditor.setTheme('ace/theme/monokai');
		structureEditor.getSession().setMode('ace/mode/json');
		structureEditor.getSession().setUseWrapMode(true);
		structureEditor.setFontSize(fontSize);
		structureEditor.on('input', onInput);

		outputEditor = ace.edit('output-editor');
		outputEditor.setTheme('ace/theme/monokai');
		outputEditor.getSession().setMode('ace/mode/javascript');
		outputEditor.getSession().setUseWrapMode(true);
		outputEditor.setReadOnly(true);
		outputEditor.setFontSize(fontSize);
	}

	function onInput() {
		var types = JSON.parse(typesEditor.getValue());
		var structure = JSON.parse(structureEditor.getValue());

		var result = shaderBits.buildShader(types, structure);
		
		outputEditor.setValue(result);
	}

	function getSample(name) {
		$.ajax({
			url: 'samples/' + name + '/types.json',
			dataType: 'text'
		}).done(function(text) {
			return typesEditor.setValue(text, -1);
		});

		$.ajax({
			url: 'samples/' + name + '/structure.json',
			dataType: 'text'
		}).done(function(text) {
			return structureEditor.setValue(text, -1);
		});
	}

	setupEditors();

	getSample('s1');
})();