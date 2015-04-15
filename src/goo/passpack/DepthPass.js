define([
	'goo/renderer/Material',
	'goo/renderer/pass/RenderTarget',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderFragment',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/Pass',
	'goo/passpack/BlurPass'
],


function (
	Material,
	RenderTarget,
	MeshData,
	Shader,
	ShaderFragment,
	RenderPass,
	FullscreenPass,
	Pass,
	BlurPass
) {
	'use strict';

	/**
	 * Depth pass
	 * @param renderList
	 * @param outShader
	 */
	function DepthPass(renderList, outShader) {
		this.depthPass = new RenderPass(renderList);
		var packDepthMaterial = new Material(packDepth);
		this.depthPass.overrideMaterial = packDepthMaterial;

		this.blurTarget = new RenderTarget(256, 256);
		this.blurPass = new BlurPass({
			target : this.blurTarget
		});

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

	DepthPass.prototype = Object.create(Pass.prototype);
	DepthPass.prototype.constructor = DepthPass;

	DepthPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta) {
		this.depthPass.render(renderer, null, this.depthTarget, delta);

		this.blurPass.render(renderer, writeBuffer, readBuffer, delta);

		this.outPass.material.setTexture(Shader.DEPTH_MAP, this.depthTarget);
		this.outPass.material.setTexture(Shader.DIFFUSE_MAP, readBuffer);
		this.outPass.material.setTexture('BLUR_MAP', this.blurTarget);
		this.outPass.render(renderer, writeBuffer, readBuffer, delta);
	};

	var packDepth = {
		attributes : {
			vertexPosition : MeshData.POSITION
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
//				nearPlane : Shader.NEAR_PLANE,
			farPlane : Shader.FAR_PLANE
		},
		vshader : [
			'attribute vec3 vertexPosition;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec4 vPosition;',

			'void main(void) {',
			'	vPosition = viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
			'	gl_Position = projectionMatrix * vPosition;',
			'}'//
		].join('\n'),
		fshader : [
			'precision mediump float;',

//				'uniform float nearPlane;',
			'uniform float farPlane;',

			ShaderFragment.methods.packDepth,

			'varying vec4 vPosition;',

			'void main(void)',
			'{',
			// ' float linearDepth = min(length(vPosition), farPlane) / (farPlane - nearPlane);',
			'	float linearDepth = min(length(vPosition), farPlane) / farPlane;',
			'	gl_FragColor = packDepth(linearDepth);',
			'}'//
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
			depthMap : Shader.DEPTH_MAP,
			diffuseMap : Shader.DIFFUSE_MAP
		},
		vshader : [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec2 texCoord0;',

			'void main(void) {',
			'	texCoord0 = vertexUV0;',
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
			'}'//
		].join('\n'),
		fshader : [
			'precision mediump float;',

			'uniform sampler2D depthMap;',
			'uniform sampler2D diffuseMap;',

			'varying vec2 texCoord0;',

			ShaderFragment.methods.unpackDepth,

			'void main(void)',
			'{',
			'	vec4 depthCol = texture2D(depthMap, texCoord0);',
			'	vec4 diffuseCol = texture2D(diffuseMap, texCoord0);',
			'	float depth = unpackDepth(depthCol);',
			'	gl_FragColor = diffuseCol * vec4(depth);',
			'}'//
		].join('\n')
	};

	return DepthPass;
});