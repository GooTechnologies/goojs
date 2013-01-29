define(['goo/renderer/Renderer', 
		'goo/renderer/Camera', 
		'goo/renderer/TextureCreator', 
		'goo/renderer/Material', 
		'goo/renderer/pass/FullscreenUtil',
		'goo/renderer/pass/RenderTarget', 
		'goo/renderer/Util', 
		'goo/renderer/MeshData', 
		'goo/renderer/Shader',
		'goo/renderer/shaders/ShaderFragments', 
		'goo/renderer/pass/RenderPass', 
		'goo/renderer/pass/FullscreenPass', 
		'goo/renderer/pass/BlurPass'],

function ( Renderer, Camera, TextureCreator, Material, FullscreenUtil, RenderTarget, Util, MeshData, Shader, ShaderFragments, RenderPass, FullscreenPass, BlurPass ) {
		"use strict";

	function HierarchicalZPass(renderList)
	{
		this.depthPass = new RenderPass(renderList);

		var depthMaterial = Material.createMaterial(depthShader);
		this.depthPass.overrideMaterial = depthMaterial;

		this.enabled = true;
		// this.clear = true; // This does something where?
		this.needsSwap = false;
	}

	HierarchicalZPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta) {

			this.depthPass.render(renderer, writeBuffer, readBuffer, delta);
	};

	var depthShader = {
			attributes : {
				vertexPosition : MeshData.POSITION
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				nearPlane : Shader.NEAR_PLANE,
				farPlane : Shader.FAR_PLANE
			},
			vshader : [ //
				'attribute vec3 vertexPosition;', //

				'uniform mat4 viewMatrix;', //
				'uniform mat4 projectionMatrix;',//
				'uniform mat4 worldMatrix;',//

				'varying vec4 vPosition;',//

				'void main(void) {', //
				'	vPosition = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
				'	gl_Position = vPosition;', //
				'}'//
			].join('\n'),
			fshader : [//
				'precision mediump float;',//

				'uniform float nearPlane;',//
				'uniform float farPlane;',//

				'varying vec4 vPosition;',//

				'void main(void)',//
				'{',//
					'float z = vPosition.z/vPosition.w;',//
					//http://www.codermind.com/articles/Depth-buffer-tutorial.html
					'float linearizedDepth = (2.0*nearPlane) / (farPlane + nearPlane - z * (farPlane - nearPlane) );',//
				'	gl_FragColor = vec4(vec3(linearizedDepth), 1.0);',//
				'}'//
			].join('\n')
		};


	return HierarchicalZPass;
});
