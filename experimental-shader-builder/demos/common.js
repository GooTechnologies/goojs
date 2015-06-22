(function () {
	'use strict';

	function makeDemo() {
		var gooRunner = v.initGoo();
		var world = gooRunner.world;
		v.addOrbitCamera(new goo.Vector3(5, Math.PI / 2, 0));

		var textureCreator = new goo.TextureCreator();

		var box;

		function replaceBox(shaderSource) {
			if (box) {
				box.removeFromWorld();
			}

			var material = new goo.Material({
				attributes: {
					vertexPosition: goo.MeshData.POSITION,
					vertexNormal: goo.MeshData.NORMAL,
					vertexUV0: goo.MeshData.TEXCOORD0
				},
				uniforms: {
					viewProjectionMatrix: goo.Shader.VIEW_PROJECTION_MATRIX,
					worldMatrix: goo.Shader.WORLD_MATRIX,
					time: function () {
						return world.time;
					},
					diffuseMap: goo.Shader.DIFFUSE_MAP,

					light0Pos: [1, 1, 1],
					light0Color: [1, 0, 0.3],

					light1Pos: [1, -1, -1],
					light1Color: [0, 1, 0.3]
				},
				vshader: [
					'attribute vec3 vertexPosition;',
					'attribute vec3 vertexNormal;',
					'attribute vec2 vertexUV0;',

					'uniform mat4 viewProjectionMatrix;',
					'uniform mat4 worldMatrix;',

					'varying vec3 normal;',
					'varying vec2 texCoord0;',

					'void main(void) {',
					'	normal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;',
					'	texCoord0 = vertexUV0;',
					'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
					'}'
				].join('\n'),
				fshader: shaderSource
			});

			var texture = textureCreator.loadTexture2D('../../../visual-test/resources/check-alt.png');

			material.setTexture('DIFFUSE_MAP', texture);

			box = world.createEntity(new goo.Torus(32, 32, 0.3, 1.0), material).addToWorld();

			var uniforms = box.meshRendererComponent.materials[0].uniforms;
			uniforms.light0Pos = [5, 5, 5];
			uniforms.light1Pos = [5, 5, 5];

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