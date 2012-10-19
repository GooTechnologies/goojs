"use strict";

define([ 'goo/renderer/Shader', 'goo/renderer/TextureCreator' ], function(Shader, TextureCreator) {
	function Material(name) {
		this.name = name;

		this.shader = null;
		this.textures = [];
	}

	Material.shaders = {
		simple : {
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
		},
		textured : {
			vshader : [ //
			'attribute vec3 vertexPosition; //!POSITION', //
			'attribute vec2 vertexUV0; //!TEXCOORD0', //

			'uniform mat4 viewMatrix; //!VIEW_MATRIX', //
			'uniform mat4 projectionMatrix; //!PROJECTION_MATRIX',//
			'uniform mat4 worldMatrix; //!WORLD_MATRIX',//

			'varying vec2 texCoord0;',//

			'void main(void) {', //
			'texCoord0 = vertexUV0;',//
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
			'}'//
			].join('\n'),
			fshader : [//
			'precision mediump float;',//

			'uniform sampler2D diffuseMap; //!TEXTURE0',//

			'varying vec2 texCoord0;',//

			'void main(void)',//
			'{',//
			'	vec4 texCol = texture2D(diffuseMap, texCoord0);',//
			'	gl_FragColor = texCol;',//
			'}',//
			].join('\n')
		}
	};

	Material.createDefaultMaterial = function() {
		var material = new Material('DefaultMaterial');

		var vs = Material.shaders.textured.vshader;
		var fs = Material.shaders.textured.fshader;
		material.shader = new Shader('DefaultShader', vs, fs);

		var texture = new TextureCreator().loadTexture2D('resources/pitcher.jpg');
		material.textures.push(texture);

		return material;
	};

	Material.defaultMaterial = Material.createDefaultMaterial();

	return Material;
});