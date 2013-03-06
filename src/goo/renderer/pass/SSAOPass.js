define([
	'goo/renderer/Material',
	'goo/renderer/pass/RenderTarget', 'goo/renderer/Util', 'goo/renderer/MeshData', 'goo/renderer/Shader',
		'goo/renderer/shaders/ShaderFragments', 'goo/renderer/pass/RenderPass', 'goo/renderer/pass/FullscreenPass', 'goo/renderer/pass/BlurPass',
		'goo/renderer/shaders/ShaderLib'],
	function (
	Material,
	RenderTarget, Util, MeshData, Shader, ShaderFragments, RenderPass,
		FullscreenPass, BlurPass, ShaderLib) {
		"use strict";

		function SSAOPass(renderList) {
			this.depthPass = new RenderPass(renderList);
			this.depthPass.clearColor.set(1,1,1,1);
			var packDepthMaterial = Material.createMaterial(packDepth);
			this.depthPass.overrideMaterial = packDepthMaterial;

			var width = window.innerWidth/4;
			var height = window.innerHeight/4;
			var shader = Util.clone(ShaderLib.ssao);
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
				magFilter : 'NearestNeighbor',
				minFilter : 'NearestNeighborNoMipMaps'
			});

			this.enabled = true;
			this.clear = false;
			this.needsSwap = true;
		}

		SSAOPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta) {
			this.depthPass.render(renderer, null, this.depthTarget, delta);

			this.outPass.material.textures[0] = readBuffer;
			this.outPass.material.textures[1] = this.depthTarget;
			this.outPass.render(renderer, writeBuffer, readBuffer, delta);

//			this.blurPass.render(renderer, writeBuffer, readBuffer, delta);
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
//				farPlane : Shader.FAR_PLANE
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

//				'uniform float nearPlane;',//
//				'uniform float farPlane;',//

				ShaderFragments.methods.packDepth,//

				'void main(void) {',//
				'	gl_FragColor = packDepth(gl_FragCoord.z);',//
				'}'//
			].join('\n')
		};

		return SSAOPass;
	});