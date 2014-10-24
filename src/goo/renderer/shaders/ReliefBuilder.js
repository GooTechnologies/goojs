define([
	'goo/renderer/MeshData',
	'goo/renderer/Texture',
	'goo/renderer/Shader',
	'goo/math/MathUtils',
	// 'goo/renderer/Material',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/RenderTarget'
],
/** @lends */
function(
	MeshData,
	Texture,
	Shader,
	MathUtils,
	// Material,
	FullscreenPass,
	RenderTarget
) {
	'use strict';

	/**
	 * @class Builds shaders
	 */
	function ReliefBuilder() {
	}

	ReliefBuilder.relaxedCone = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			tDiffuse : Shader.DIFFUSE_MAP,
			ResultSampler : 'RESULT_MAP',
			offset: [0, 0]
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec2 vUv;',
			'void main() {',
				'vUv = vertexUV0;',
				'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D tDiffuse;',
			'uniform sampler2D ResultSampler;',
			'uniform vec2 offset;',

			'varying vec2 vUv;',

			'const float search_steps = 128.0;',

			'void main() {',
				'vec3 src = vec3(vUv, -0.001);',
				'vec3 dst = src;',
				'dst.xy += offset;',
				'dst.z = texture2D(tDiffuse, dst.xy).r;',
				'vec3 vec = dst - src;',
				'vec /= vec.z;',
				'vec *= 1.0 - dst.z;',
				'vec3 step_fwd = vec / search_steps;',
				'vec3 ray_pos = dst + step_fwd;',
				'for (float i = 1.0; i < search_steps; i++) {',
					'float current_depth = texture2D(tDiffuse, ray_pos.xy).r;',
					'if (current_depth <= ray_pos.z)',
						'ray_pos += step_fwd;',
				'}',
				'float src_texel_depth = texture2D(tDiffuse, vUv).r;',
				'float cone_ratio = (ray_pos.z >= src_texel_depth) ? 1.0 : length(ray_pos.xy - vUv) / (src_texel_depth - ray_pos.z);',
				// 'float cone_ratio = length(ray_pos.xy - vUv) / (src_texel_depth - ray_pos.z);',

				// what is this?
				'float best_ratio = texture2D(ResultSampler, vUv).r;',
				'if (cone_ratio > best_ratio)',
					'cone_ratio = best_ratio;',

				'gl_FragColor = vec4(cone_ratio, cone_ratio, cone_ratio, src_texel_depth);',
				// 'gl_FragColor = texture2D(tDiffuse, vUv);',
				// 'gl_FragColor = vec4(src_texel_depth);',
			'}'
		].join('\n')
	};

	ReliefBuilder.fullscreenPass = new FullscreenPass(ReliefBuilder.relaxedCone);
	// ReliefBuilder.fullscreenPass.material.shader = Material.createShader(ReliefBuilder.relaxedCone, 'relaxedCone');
	var colorInfo = new Uint8Array([255, 255, 255, 255]);
	ReliefBuilder.WHITE = new Texture(colorInfo, null, 1, 1);

	ReliefBuilder.process = function (material, renderer) {
		var heightTex = material.getTexture('HEIGHT_MAP');
		if (heightTex && heightTex.checkDataReady && heightTex.checkDataReady() && heightTex !== material.height) {
			console.log('building ref');
			var w = heightTex.image.width;
			var h = heightTex.image.height;
			if (!material.heightTarget) {
				material.heightTarget = new RenderTarget(w, h, {
				// type: 'Float',
				// magFilter : 'NearestNeighbor',
				// minFilter : 'NearestNeighborNoMipMaps'
			});
				material.heightTarget2 = new RenderTarget(w, h, {
				// type: 'Float',
				// magFilter : 'NearestNeighbor',
				// minFilter : 'NearestNeighborNoMipMaps'
			});
			}

			ReliefBuilder.fullscreenPass.material.setTexture('RESULT_MAP', ReliefBuilder.WHITE);
			ReliefBuilder.fullscreenPass.material.uniforms.offset = [-1, -1];
			ReliefBuilder.fullscreenPass.render(renderer, material.heightTarget, heightTex);

			var input = material.heightTarget;
			var output = material.heightTarget2;
			for (var x = -10; x <= 10; x++) {
				for (var y = -10; y <= 10; y++) {
					var xx = x / 100;
					var yy = y / 100;

					ReliefBuilder.fullscreenPass.material.setTexture('RESULT_MAP', input);
					ReliefBuilder.fullscreenPass.material.uniforms.offset = [xx, yy];
					ReliefBuilder.fullscreenPass.render(renderer, output, heightTex);

					var tmp = input;
					input = output;
					output = tmp;
				}
			}

			material.setTexture('HEIGHT_MAP', output);
			ReliefBuilder.height = output;
			console.log('built relaxed', ReliefBuilder.height, heightTex);
		}
	}

	return ReliefBuilder;
});