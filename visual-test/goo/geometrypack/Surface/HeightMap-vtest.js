require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/geometrypack/Surface',
	'goo/renderer/TextureCreator',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	Surface,
	TextureCreator,
	V
	) {
	'use strict';

	V.describe('A terrain-like surface generated from a heightmap stored as a matrix of floats');

	function getHeightMap(nLin, nCol) {
		var matrix = [];
		for (var i = 0; i < nLin; i++) {
			matrix.push([]);
			for (var j = 0; j < nCol; j++) {
				var value =
					Math.sin(i * 0.3) +
					Math.cos(j * 0.3) +
					Math.sin(Math.sqrt(i * i + j * j) * 0.7) * 2;
				matrix[i].push(value);
			}
		}
		return matrix;
	}

	var goo = V.initGoo();
	var world = goo.world;

	var heightMapSize = 64;

	var matrix = getHeightMap(heightMapSize, heightMapSize);
	var xScale = 1;
	var yScale = 1;
	var zScale = 1;
	var meshData = Surface.createFromHeightMap(matrix, xScale, yScale, zScale);

	var material = new Material(ShaderLib.texturedLit);
	new TextureCreator().loadTexture2D('../../../resources/check.png').then(function (texture) {
		material.setTexture('DIFFUSE_MAP', texture);
	});

	world.createEntity(meshData, material, [0, 0, -heightMapSize / 2]).addToWorld();


	var size = 64;
	var vertCount = 100;
	var meshData = Surface.createTessellatedFlat(size, size, vertCount, vertCount);
	world.createEntity(meshData, material, [-size * 0.5 , 0, 0]).addToWorld();

	V.addLights();

	V.addOrbitCamera(new Vector3(100, Math.PI / 2, 0));

	V.process();
});
