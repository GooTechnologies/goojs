(function () {
	'use strict';

	var Material = goo.Material;
	var Shader = goo.Shader;
	var MeshData = goo.MeshData;
	var Box = goo.Box;
	var Vector3 = goo.Vector3;

	var gooRunner = v.initGoo();
	var world = gooRunner.world;


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

	getSample('s3');


	var box;
	function replaceBox(shaderSource) {
		if (box) { box.removeFromWorld(); }

		var material = new Material({
			attributes: {
				vertexPosition: MeshData.POSITION
			},
			uniforms: {
				viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
				worldMatrix: Shader.WORLD_MATRIX,
				time : function() { return world.time; }
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
			//'void main(void) { gl_FragColor = vec4(1.0); }'
		});

		box = world.createEntity(new Box(), material).addToWorld();
	}


	v.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));
})();