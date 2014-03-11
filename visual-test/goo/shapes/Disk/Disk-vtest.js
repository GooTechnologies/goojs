require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/math/Vector3',
	'goo/shapes/Disk',
	'../../lib/V'
], function (
	Material,
	ShaderLib,
	Vector3,
	Disk,
	V
	) {
	'use strict';

	function diskDemo() {
		var goo = V.initGoo();

		var material = new Material(ShaderLib.simpleLit);

		// add pointy disk
		var pointyDiskMeshData = new Disk(64, 4, 8);
		var pointyDiskEntity = goo.world.createEntity(pointyDiskMeshData, material, [-9, 0, 0], 'Pointy Disk').addToWorld();
		V.showNormals(pointyDiskEntity);

		// add flat disk
		var flatDiskMeshData = new Disk(64, 4, 0);
		var flatDiskEntity = goo.world.createEntity(flatDiskMeshData, material, 'Flat Disk').addToWorld();
		V.showNormals(flatDiskEntity);

		// add inversely pointy disk
		var ipointyDiskMeshData = new Disk(64, 4, -4);
		var iPointyDiskEntity = goo.world.createEntity(ipointyDiskMeshData, material, [9, 0, 0], '-Pointy Disk').addToWorld();
		V.showNormals(iPointyDiskEntity);

		V.addLights();

		V.addOrbitCamera(new Vector3(25, Math.PI / 2, 0));
	}

	diskDemo();
});
