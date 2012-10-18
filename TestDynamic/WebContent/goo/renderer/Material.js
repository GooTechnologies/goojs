define([ 'goo/renderer/Shader' ], function(Shader) {
	function Material(name) {
		this.name = name;

		this.shader = null;
		this.textures = [];
	}

	Material.shaders = {
		vshader : [ //
		'attribute vec3 vertexPosition; //!POSITION', //
		'attribute vec4 vertexColors; //!COLOR',//
		'attribute vec2 vertexUV0; //!TEXCOORD0',//

		'uniform mat4 viewMatrix; //!VIEW_MATRIX', //
		'uniform mat4 projectionMatrix; //!PROJECTION_MATRIX',//
		'uniform mat4 worldMatrix; //!WORLD_MATRIX',//

		'varying vec4 color;', //
		'varying vec2 texCoord0;',//

		'void main(void) {', //
		'	color = vertexColors;',//
		'	texCoord0 = vertexUV0;',//
		'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
		'}'//
		].join('\n'),
		fshader : [//
		'precision mediump float;',//

		'uniform sampler2D diffuseMap;',//

		'varying vec4 color;',//
		'varying vec2 texCoord0;',//

		'void main(void)',//
		'{',//
		'	vec4 texCol = texture2D(diffuseMap, texCoord0);',//
		'	gl_FragColor = vec4(1.0); //texCol * color;',//
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