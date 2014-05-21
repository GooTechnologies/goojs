define([
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/FullscreenUtil',
	'goo/renderer/MeshData',
	'goo/renderer/pass/RenderTarget',
	'goo/renderer/pass/FullscreenPass'
], function (
	Material,
	Shader,
	ShaderLib,
	FullscreenUtil,
	MeshData,
	RenderTarget,
	FullscreenPass
) {
	'use strict';

	function MotionBlurPass() {
		this.inPass = new FullscreenPass(blendShader);
		this.outPass = new FullscreenPass(ShaderLib.copyPure);

		var width = window.innerWidth || 1024;
		var height = window.innerHeight || 1024;
		this.updateSize({
			x: 0, y: 0, width: width, height: height
		});
		this.enabled = true;
		this.clear = false;
		this.needsSwap = true;
	}

	MotionBlurPass.prototype.updateSize = function(size) {
		var sizeX = size.width;
		var sizeY = size.height;
		this.targetSwap = [
			new RenderTarget(sizeX, sizeY),
			new RenderTarget(sizeX, sizeY)
		];
	};

	MotionBlurPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
		if (this.targetSwap[1].glTexture) {
			this.inPass.material.setTexture('MOTION_MAP', this.targetSwap[1]);
		}
		this.inPass.render(renderer, this.targetSwap[0], readBuffer);
		this.outPass.render(renderer, writeBuffer, this.targetSwap[0]);
		this.targetSwap.reverse();
	};

	var blendShader = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			blend : 0.90,
			scale: 1.0,
			diffuseMap : Shader.DIFFUSE_MAP,
			motionMap : 'MOTION_MAP'
		},
		vshader : [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec2 texCoord0;',

		'void main(void) {',
			'texCoord0 = vertexUV0;',
			'gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'
		].join('\n'),
		fshader : [
		'uniform sampler2D diffuseMap;',
		'uniform sampler2D motionMap;',
		'uniform float blend;',
		'uniform float scale;',

		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
			'vec4 colA = texture2D(diffuseMap, texCoord0);',
			'vec4 colB = texture2D(motionMap, (texCoord0 - 0.5) / scale + 0.5);',
			'float wBlend = blend;// * length(colB) / sqrt(3.0);',
			'gl_FragColor = mix(colA, colB, wBlend);',
		'}'
		].join('\n')
	};

	return MotionBlurPass;
});