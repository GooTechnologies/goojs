require([
	'goo/renderer/Material',
	'goo/renderer/MeshData',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'lib/V'
], function (
	Material,
	MeshData,
	Box,
	Vector3,
	V
) {
	'use strict';

	V.describe('...');

	var goo = V.initGoo();
	var world = goo.world;



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
		outputEditor.getSession().setMode('ace/mode/glsl');
		outputEditor.getSession().setUseWrapMode(true);
		outputEditor.setReadOnly(true);
		outputEditor.setFontSize(fontSize);
	}

	function onInput() {
		var types = JSON.parse(typesEditor.getValue());
		var structure = JSON.parse(structureEditor.getValue());

		var result = shaderBits.buildShader(types, structure);
		
		outputEditor.setValue(result);

		replaceBox(result);
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

	getSample('s2');


	var box;
	function replaceBox(shaderSource) {
		if (!box) { return; }
		box.removeFromWorld();

		var material = Material.createMaterial({
			attributes: {
				vertexPosition: MeshData.POSITION
			},
			uniforms: {
				viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
				worldMatrix: Shader.WORLD_MATRIX,
				time: Shader.TIME
			},
			vshader: [
				'attribute vec3 vertexPosition;',

				'uniform mat4 viewProjectionMatrix;',
				'uniform mat4 worldMatrix;',

				'void main(void) {',
				'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
				'}'
			].join('\n'),
			fshader: shaderSource
		}, 'MyCoolMaterial');

		world.createEntity(new Box(), material).addToWorld();
	}


	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0));

	V.process();
});