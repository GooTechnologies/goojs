Terrain.prototype.initAmmoBody = function () {
	var heightBuffer = this.heightBuffer = Ammo.allocate(4 * this.size * this.size, 'float', Ammo.ALLOC_NORMAL);

	this.updateAmmoBody();

	var heightScale = 1.0;
	var minHeight = -500;
	var maxHeight = 500;
	var upAxis = 1; // 0 => x, 1 => y, 2 => z
	var heightDataType = 0; //PHY_FLOAT;
	var flipQuadEdges = false;

	var shape = new Ammo.btHeightfieldTerrainShape(
		this.size,
		this.size,
		heightBuffer,
		heightScale,
		minHeight,
		maxHeight,
		upAxis,
		heightDataType,
		flipQuadEdges
	);

	// var sx = xw / widthPoints;
	// var sz = zw / lengthPoints;
	// var sy = 1.0;

	// var sizeVector = new Ammo.btVector3(sx, sy, sz);
	// shape.setLocalScaling(sizeVector);

	var ammoTransform = new Ammo.btTransform();
	ammoTransform.setIdentity(); // TODO: is this needed ?
	ammoTransform.setOrigin(new Ammo.btVector3( this.size / 2, 0, this.size / 2 ));
	var motionState = new Ammo.btDefaultMotionState( ammoTransform );
	var localInertia = new Ammo.btVector3(0, 0, 0);

	var mass = 0;

	var info = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
	var body = new Ammo.btRigidBody(info);
	body.setFriction(1);

	this.world.getSystem('AmmoSystem').ammoWorld.addRigidBody(body);

	return body;
};

Terrain.prototype.updateAmmoBody = function () {
	var heights = this.getTerrainData().heights;
	var heightBuffer = this.heightBuffer;
	for (var z = 0; z < this.size; z++) {
		for (var x = 0; x < this.size; x++) {
			Ammo.setValue(heightBuffer + (z * this.size + x) * 4, heights[(this.size - z - 1) * this.size + x], 'float');
		}
	}
};
