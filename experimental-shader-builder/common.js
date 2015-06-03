(function () {
	'use strict';

	function makeDemo() {
		var world = v.initGoo().world;
		v.addOrbitCamera(new goo.Vector3(5, Math.PI / 2, 0));

		var box;

		function replaceBox(shaderSource) {
			if (box) {
				box.removeFromWorld();
			}

			var material = new goo.Material({
				attributes: {
					vertexPosition: goo.MeshData.POSITION
				},
				uniforms: {
					viewProjectionMatrix: goo.Shader.VIEW_PROJECTION_MATRIX,
					worldMatrix: goo.Shader.WORLD_MATRIX,
					time: function () {
						return world.time;
					}
				},
				vshader: [
					'attribute vec3 vertexPosition;',

					'uniform mat4 viewProjectionMatrix;',
					'uniform mat4 worldMatrix;',

					'void main(void) {',
					'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
					'}'
				].join('\n'),
				fshader: shaderSource
			});

			box = world.createEntity(new goo.Box(), material).addToWorld();
		}

		return replaceBox;
	}

	window.shaderBitsCommon = window.shaderBitsCommon || {};
	window.shaderBitsCommon.makeDemo = makeDemo;
})();