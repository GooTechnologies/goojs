(function () {
	'use strict';

	function makeDemo() {
		var world = v.initGoo().world;
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
					vertexNormal : goo.MeshData.NORMAL,
					vertexUV0 : goo.MeshData.TEXCOORD0
				},
				uniforms: {
					viewProjectionMatrix: goo.Shader.VIEW_PROJECTION_MATRIX,
					worldMatrix: goo.Shader.WORLD_MATRIX,
					time: function () {
						return world.time;
					},
					diffuseMap: goo.Shader.DIFFUSE_MAP
				},
				vshader: [
					'attribute vec3 vertexPosition;',
					'attribute vec2 vertexUV0;',

					'uniform mat4 viewProjectionMatrix;',
					'uniform mat4 worldMatrix;',

					'varying vec2 texCoord0;',

					'void main(void) {',
					'	texCoord0 = vertexUV0;',
					'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
					'}'
				].join('\n'),
				fshader: shaderSource
			});

			var texture = textureCreator.loadTexture2D('../../../visual-test/resources/check.png');

			material.setTexture('DIFFUSE_MAP', texture);

			box = world.createEntity(new goo.Box(), material).addToWorld();
		}

		return replaceBox;
	}

	window.shaderBitsCommon = window.shaderBitsCommon || {};
	window.shaderBitsCommon.makeDemo = makeDemo;
})();