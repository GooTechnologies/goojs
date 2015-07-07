(function () {
	'use strict';

	function makeDemo() {
		var gooRunner = v.initGoo();
		var world = gooRunner.world;
		v.addOrbitCamera(new goo.Vector3(5, Math.PI / 2, 0));

		var textureCreator = new goo.TextureCreator();

		var box;

		function replaceBox(shaderSource, vertexShader) {
			vertexShader = vertexShader || [
					'attribute vec3 vertexPosition;',
					'attribute vec3 vertexNormal;',
					'attribute vec2 vertexUV0;',
					'attribute vec4 vertexTangent;',

					'uniform mat4 viewProjectionMatrix;',
					'uniform mat4 worldMatrix;',

					'varying vec3 normal;',
					'varying vec2 texCoord0;',
					'varying vec3 binormal;',
					'varying vec3 tangent;',

					'void main(void) {',
					'	normal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;',
					'	texCoord0 = vertexUV0;',
					//'	tangent = normalize(nMatrix * vertexTangent.xyz);', // it's identity
					'	tangent = vertexTangent.xyz;',
					'	binormal = cross(normal, tangent) * vec3(vertexTangent.w);',
					'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
					'}'
				].join('\n');

			if (box) {
				box.removeFromWorld();
			}

			var material = new goo.Material({
				attributes: {
					vertexPosition: goo.MeshData.POSITION,
					vertexNormal: goo.MeshData.NORMAL,
					vertexUV0: goo.MeshData.TEXCOORD0,
					vertexTangent: goo.MeshData.TANGENT
				},
				uniforms: {
					viewProjectionMatrix: goo.Shader.VIEW_PROJECTION_MATRIX,
					worldMatrix: goo.Shader.WORLD_MATRIX,
					time: function () {
						return world.time;
					},
					diffuseMap: goo.Shader.DIFFUSE_MAP,
					normalMap: goo.Shader.NORMAL_MAP,

					light0Pos: [1, 1, 1],
					light0Color: [1, 1, 1],

					light1Pos: [1, -1, -1],
					light1Color: [0, 1, 0.3]
				},
				vshader: vertexShader,
				fshader: shaderSource
			});

			textureCreator.loadTexture2D('../../../visual-test/resources/check-alt.png', { anisotropy: 16 })
				.then(function (diffuseMap) {
					material.setTexture('DIFFUSE_MAP', diffuseMap);
				});

			textureCreator.loadTexture2D('../../../visual-test/resources/normal-map2.jpg', { anisotropy: 16 })
				.then(function (normalMap) {
					material.setTexture('NORMAL_MAP', normalMap);
				});


			//var meshData = new goo.Torus(32, 32, 0.3, 1.0);
			var meshData = new goo.Box();
			goo.TangentGenerator.addTangentBuffer(meshData);

			box = world.createEntity(meshData, material).addToWorld();

			var uniforms = box.meshRendererComponent.materials[0].uniforms;
			uniforms.light0Pos = [2, 3, 5];
			uniforms.light1Pos = [-3, -5, 7];

			gooRunner.callbacks.push(function () {
				uniforms.light0Pos[2] = Math.sin(world.time) * 5;

				uniforms.light1Pos[1] = Math.cos(world.time) * 5;
			})
		}

		return replaceBox;
	}

	window.shaderBitsCommon = window.shaderBitsCommon || {};
	window.shaderBitsCommon.makeDemo = makeDemo;
})();