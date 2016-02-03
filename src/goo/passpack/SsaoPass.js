define([
	'goo/renderer/Material',
	'goo/renderer/pass/RenderTarget',
	'goo/util/ObjectUtils',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderFragment',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/FullscreenPass',
	'goo/passpack/BlurPass',
	'goo/passpack/ShaderLibExtra',
	'goo/renderer/pass/Pass'
], function (
	Material,
	RenderTarget,
	ObjectUtils,
	MeshData,
	Shader,
	ShaderFragment,
	RenderPass,
	FullscreenPass,
	BlurPass,
	ShaderLibExtra,
	Pass
) {
	'use strict';

	/**
	 * @class
	 * Screen Space Ambient Occlusion pass
	 * @param renderList
	 * @hidden
	 */
	function SsaoPass(renderList) {
		this.depthPass = new RenderPass(renderList);
		this.depthPass.clearColor.setDirect(1, 1, 1, 1);
		var packDepthMaterial = new Material(packDepth);
		this.depthPass.overrideMaterial = packDepthMaterial;

		this.downsampleAmount = 4;
		var width = window.innerWidth || 1024;
		var height = window.innerHeight || 1024;
		this.updateSize({
			x: 0, y: 0, width: width, height: height
		});

		this.enabled = true;
		this.clear = false;
		this.needsSwap = true;
	}

	SsaoPass.prototype = Object.create(Pass.prototype);
	SsaoPass.prototype.constructor = SsaoPass;

	SsaoPass.prototype.updateSize = function (size) {
		var width = Math.floor(size.width / this.downsampleAmount);
		var height = Math.floor(size.height / this.downsampleAmount);
		var shader = ObjectUtils.deepClone(ShaderLibExtra.ssao);
		shader.uniforms.size = [width, height];
		this.outPass = new FullscreenPass(shader);
		this.outPass.useReadBuffer = false;
//			 this.outPass.clear = true;
//			this.outPass.renderToScreen = true;

		this.blurPass = new BlurPass({
			sizeX: width,
			sizeY: height
		});
//			this.blurPass.needsSwap = true;

		this.depthTarget = new RenderTarget(width, height, {
			magFilter: 'NearestNeighbor',
			minFilter: 'NearestNeighborNoMipMaps'
		});
		console.log('UPDATE SSAOPASS: ', width, height);
	};

	SsaoPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta) {
		this.depthPass.render(renderer, null, this.depthTarget, delta);

		// this.blurPass.render(renderer, this.depthTarget, this.depthTarget, delta);

		this.outPass.material.setTexture(Shader.DIFFUSE_MAP, readBuffer);
		this.outPass.material.setTexture(Shader.DEPTH_MAP, this.depthTarget);
		this.outPass.render(renderer, writeBuffer, readBuffer, delta);
	};

	var packDepth = {
		attributes: {
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX
//				nearPlane: Shader.NEAR_PLANE,
//				farPlane: Shader.FAR_PLANE
		},
		vshader: [
			'attribute vec3 vertexPosition;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'void main(void) {',
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
			'}'//
		].join('\n'),
		fshader: [
			'precision mediump float;',

//				'uniform float nearPlane;',
//				'uniform float farPlane;',

			ShaderFragment.methods.packDepth,

			'void main(void) {',
			'	gl_FragColor = packDepth(gl_FragCoord.z);',
			'}'//
		].join('\n')
	};

	return SsaoPass;
});