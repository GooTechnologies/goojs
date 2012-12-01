define(['goo/renderer/Renderer', 'goo/renderer/Camera', 'goo/renderer/TextureCreator', 'goo/renderer/Material', 'goo/renderer/pass/FullscreenUtil',
		'goo/renderer/pass/RenderTarget', 'goo/renderer/Util', 'goo/renderer/MeshData', 'goo/renderer/Shader',
		'goo/renderer/shaders/ShaderFragments', 'goo/renderer/pass/RenderPass', 'goo/renderer/pass/FullscreenPass'], function(Renderer, Camera,
	TextureCreator, Material, FullscreenUtil, RenderTarget, Util, MeshData, Shader, ShaderFragments, RenderPass, FullscreenPass) {
	"use strict";

	function DepthPass(renderList, outShader) {
		this.depthPass = new RenderPass(renderList);
		var packDepthMaterial = Material.createMaterial(packDepth);
		this.depthPass.overrideMaterial = packDepthMaterial;

		var shader = outShader || unpackDepth;
		this.outPass = new FullscreenPass(shader);
		this.outPass.useReadBuffer = false;
		// this.outPass.clear = true;

		var width = window.innerWidth || 1;
		var height = window.innerHeight || 1;
		this.depthTarget = new RenderTarget(width, height);

		this.enabled = true;
		this.clear = false;
		this.needsSwap = true;
	}

	DepthPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {
		this.depthPass.render(renderer, null, this.depthTarget, delta);

		this.outPass.material.textures[0] = this.depthTarget;
		this.outPass.material.textures[1] = readBuffer;
		this.outPass.render(renderer, writeBuffer, readBuffer, delta);
	};

	var packDepth = {
		attributes : {
			vertexPosition : MeshData.POSITION,
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
		},
		vshader : [ //
		'attribute vec3 vertexPosition;', //

		'uniform mat4 viewMatrix;', //
		'uniform mat4 projectionMatrix;',//
		'uniform mat4 worldMatrix;',//

		'void main(void) {', //
		'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
		'}'//
		].join('\n'),
		fshader : [//
		'precision mediump float;',//

		ShaderFragments.methods.packDepth,//

		'void main(void)',//
		'{',//
		'	float depth = gl_FragCoord.z / gl_FragCoord.w;',//
		'	vec4 d = packDepth(depth);',//
		'	gl_FragColor = d;',//
		'}',//
		].join('\n')
	};

	var unpackDepth = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			depthMap : Shader.TEXTURE0,
			diffuseMap : Shader.TEXTURE1
		},
		vshader : [ //
		'attribute vec3 vertexPosition;', //
		'attribute vec2 vertexUV0;', //

		'uniform mat4 viewMatrix;', //
		'uniform mat4 projectionMatrix;',//
		'uniform mat4 worldMatrix;',//

		'varying vec2 texCoord0;',//

		'void main(void) {', //
		'	texCoord0 = vertexUV0;',//
		'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
		'}'//
		].join('\n'),
		fshader : [//
		'precision mediump float;',//

		'uniform sampler2D depthMap;',//
		'uniform sampler2D diffuseMap;',//

		'varying vec2 texCoord0;',//

		ShaderFragments.methods.unpackDepth,//

		'void main(void)',//
		'{',//
		'	vec4 depthCol = texture2D(depthMap, texCoord0);',//
		'	vec4 diffuseCol = texture2D(diffuseMap, texCoord0);',//
		'	float depth = unpackDepth(depthCol);',//
		'	gl_FragColor = diffuseCol * vec4(depth);',//
		'}',//
		].join('\n')
	};

	return DepthPass;
});