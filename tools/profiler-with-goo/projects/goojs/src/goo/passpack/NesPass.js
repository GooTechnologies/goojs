define([
	'goo/renderer/TextureCreator',
	'goo/renderer/Material',
	'goo/renderer/pass/FullscreenUtil',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/Pass'
],
/** @lends */
function (
	TextureCreator,
	Material,
	FullscreenUtil,
	ShaderLib,
	Pass
) {
	'use strict';

	/**
	* @class
	*/
	function NesPass(textureUrl) {
		this.material = new Material(nesShader);

		this.renderToScreen = false;

		this.renderable = {
			meshData : FullscreenUtil.quad,
			materials : [this.material]
		};

		this.mapping = new TextureCreator().loadTexture2D(textureUrl);
		this.mapping.minFilter = 'NearestNeighborNoMipMaps';
		this.mapping.magFilter = 'NearestNeighbor';
		this.mapping.generateMipmaps = false;

		this.enabled = true;
		this.clear = false;
		this.needsSwap = true;
	}

	NesPass.prototype = Object.create(Pass.prototype);
	NesPass.prototype.constructor = NesPass;

	NesPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
		this.material.setTexture('DIFFUSE_MAP', readBuffer);
		this.material.setTexture('COLOR_MAPPING', this.mapping);

		if (this.renderToScreen) {
			renderer.render(this.renderable, FullscreenUtil.camera, [], null, this.clear);
		} else {
			renderer.render(this.renderable, FullscreenUtil.camera, [], writeBuffer, this.clear);
		}
	};

	var nesShader = {
		attributes : ShaderLib.copy.attributes,
		uniforms : {
			diffuse : 'DIFFUSE_MAP',
			mapping : 'COLOR_MAPPING',
			$link : ShaderLib.copy.uniforms
		},
		vshader : ShaderLib.copy.vshader,
		fshader : [//
			'precision mediump float;',//

			'uniform sampler2D diffuse;',//
			'uniform sampler2D mapping;',//

			'varying vec2 texCoord0;',//

			'void main() {',//
			'	vec4 texCol = texture2D( diffuse, texCoord0 );',//
			'	float r = floor(texCol.r * 31.0);',//
			'	float g = floor(texCol.g * 31.0);',//
			'	float b = floor(texCol.b * 31.0);',//
			'	vec4 texPalette = texture2D( mapping, vec2((r * 32.0 + g)/1024.0, b / 32.0) );',//

			'	gl_FragColor = vec4( texPalette.rgb, 1.0 );',//
			'}'
		].join('\n')
	};

	return NesPass;
});