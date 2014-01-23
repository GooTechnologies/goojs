define([
	'goo/util/ObjectUtil'
], function(
	_
) {
	'use strict';
	return {
		material: function() {
			var material = this.gooObject('material', 'Dummy');
			_.extend(material, {
				uniforms: {
					materialAmbient: {
						value: [0,0,0,1],
						enabled: true
					},
					materialDiffuse: {
						value: [1,1,1,1],
						enabled: true
					}
				},
				shaderRef: this.shader().id,
				blendState: {
					blending: 'NoBlending',
					blendEquation: 'AddEquation',
					blendSrc: 'SrcAlphaFactor',
					blendDst: 'OneMinusSrcAlhphaFactor'
				},
				cullState: {
					enabled: true,
					cullFace: 'Back',
					frontFace: 'CCW'
				},
				depthState: {
					enabled: true,
					write: true
				},
				renderQueue: -1
			});
			return material;
		},
		shader: function() {
			var shader = this.gooObject('shader', 'Dummy');
			_.extend(shader, {
				attributes: {
					vertexPoisition: 'POSITION',
					vertexNormal: 'NORMAL',
					vertexUV0: 'TEXCOORD0'
				},
				uniforms: {
					viewMatrix: 'VIEW_MATRIX',
					projectionMatrix: 'PROJECTION_MATRIX',
					worldMatrix: 'WORLD_MATRIX',
					cameraPosition: 'CAMERA'
				},
				vshaderRef: this.vshader(),
				fshaderRef: this.fshader(),
				processors: [
					'uber'
				]
			});
			return shader;
		},
		vshader: function() {
			var ref = this.randomRef('vert');
			var code = "void main() { gl_Position = vec4(1.0); }";
			this.addToBundle(code, ref);
			return ref;
		},
		fshader: function() {
			var ref = this.randomRef('frag');
			var code = "void main() { gl_FragColor = vec4(1.0); }";
			this.addToBundle(code, ref);
			return ref;
		}
	};
});