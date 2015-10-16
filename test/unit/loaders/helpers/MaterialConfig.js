define([
	'goo/util/ObjectUtil'
], function (
	_
) {
	'use strict';
	return {
		material: function () {
			var material = this.gooObject('material', 'Dummy');
			_.extend(material, {
				uniforms: {
					materialAmbient: {
						value: [0, 0, 0, 1],
						enabled: true
					},
					materialDiffuse: {
						value: [1, 1, 1, 1],
						enabled: true
					}
				},
				texturesMapping: {},
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
		texture: function () {
			var texture = this.gooObject('texture', 'Dummy');
			_.extend(texture, {
				magFilter: 'Bilinear',
				minFilter: 'Trilinear',
				offset: [0, 0],
				repeat: [1, 1],
				imageRef: (window.__karma__ ? 'base/test/unit/loaders/res/' : '') + 'checker.png',
				wrapS: 'Repeat',
				wrapT: 'Repeat',
				anisotropy: 1,
				flipY: true
			});
			return texture;
		},
		textureSVG: function () {
			var texture = this.gooObject('texture', 'Dummy');
			_.extend(texture, {
				magFilter: 'Bilinear',
				minFilter: 'Trilinear',
				offset: [0, 0],
				repeat: [1, 1],
				svgData: "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='100'><rect x='0' y='0' width='200' height='100' fill='blue' /></svg>",
				wrapS: 'Repeat',
				wrapT: 'Repeat',
				anisotropy: 1,
				flipY: true
			});
			return texture;
		},
		shader: function () {
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
		vshader: function () {
			var ref = this.randomRef('vert');
			var code = "void main() { gl_Position = vec4(1.0); }";
			this.addToBundle(code, ref);
			return ref;
		},
		fshader: function () {
			var ref = this.randomRef('frag');
			var code = "void main() { gl_FragColor = vec4(1.0); }";
			this.addToBundle(code, ref);
			return ref;
		}
	};
});