
	'use strict';

	V.describe('3 disks of different height (positive, zero and negative)');

	var gooRunner = V.initGoo();
	var world = gooRunner.world;

	var material = new Material(ShaderLib.simpleLit);

	// add pointy disk
	var pointyDiskMeshData = new Disk(64, 4, 8);
	var pointyDiskEntity = world.createEntity(pointyDiskMeshData, material, [-9, 0, 0], 'Pointy Disk').addToWorld();
	V.showNormals(pointyDiskEntity);

	// add flat disk
	var flatDiskMeshData = new Disk(64, 4, 0);
	var flatDiskEntity = world.createEntity(flatDiskMeshData, material, 'Flat Disk').addToWorld();
	V.showNormals(flatDiskEntity);

	// add inversely pointy disk
	var iPointyDiskMeshData = new Disk(64, 4, -4);
	var iPointyDiskEntity = world.createEntity(iPointyDiskMeshData, material, [9, 0, 0], '-Pointy Disk').addToWorld();
	V.showNormals(iPointyDiskEntity);

	V.addLights();

	V.addOrbitCamera(new Vector3(25, Math.PI / 2, 0));

	V.process();
});
