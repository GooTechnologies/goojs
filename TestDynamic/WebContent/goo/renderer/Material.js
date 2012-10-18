define([ 'goo/renderer/Shader' ], function(Shader) {
	function Material(name) {
		this.name = name;

		this.shader = null;
		this.textures = [];
	}

	Material.shaders = {
		vshader : [ //
		'attribute vec3 vertexPosition; //!POSITION', //

		'uniform mat4 viewMatrix; //!VIEW_MATRIX', //
		'uniform mat4 projectionMatrix; //!PROJECTION_MATRIX',//
		'uniform mat4 worldMatrix; //!WORLD_MATRIX',//

		'void main(void) {', //
		'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
		'}'//
		].join('\n'),
		fshader : [//
		'precision mediump float;',//

		'void main(void)',//
		'{',//
		'	gl_FragColor = vec4(1.0);',//
		'}',//
		].join('\n')
	};

	Material.createDefaultMaterial = function() {
		var material = new Material('DefaultMaterial');

		var vs = Material.shaders.vshader;
		var fs = Material.shaders.fshader;
		material.shader = new Shader('DefaultShader', vs, fs);

		return material;
	};

	Material.defaultMaterial = Material.createDefaultMaterial();

	return Material;
});