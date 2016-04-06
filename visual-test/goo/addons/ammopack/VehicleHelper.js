/* global Ammo, gooRunner */

function VehicleHelper(goo, ammoSystem, chassis, wheelRadius, suspensionLength, doCreateDebugTire) {
	this.goo = goo;
	this.chassis = chassis;
	this.wheelRadius = wheelRadius;
	this.suspension = suspensionLength;
	this.doCreateDebugTire = doCreateDebugTire;
	this.debugTires = [];

	gooRunner.world.process(); // or body might be undefined
	chassis.ammoComponent.body.setActivationState( 4); // 4 means to never deactivate the vehicle
	this.tuning = new Ammo.btVehicleTuning();
	var vehicleRaycaster = new Ammo.btDefaultVehicleRaycaster(ammoSystem.ammoWorld);
	this.vehicle = new Ammo.btRaycastVehicle(this.tuning, chassis.ammoComponent.body, vehicleRaycaster);
	ammoSystem.ammoWorld.addVehicle(this.vehicle);
	this.vehicle.setCoordinateSystem(0,1,2); // choose coordinate system
	this.wheelDir = new Ammo.btVector3(0,-1,0);
	this.wheelAxle = new Ammo.btVector3(-1,0,0);

	//chassis.ammoComponent.body.setAngularFactor(new Ammo.btVector3(0,1,0)); restrict angular movement
}
VehicleHelper.prototype.resetAtPos = function( x, y, z) {
	var b = this.chassis.ammoComponent.body;
	var t = b.getCenterOfMassTransform();
	t.setIdentity();
	t.setOrigin(new Ammo.btVector3( x, y, z));
	b.setCenterOfMassTransform(t);
	b.setAngularVelocity( new Ammo.btVector3( 0, 0, 0));
	b.setLinearVelocity( new Ammo.btVector3( 0, 0, 0));
};
VehicleHelper.prototype.setSteeringValue = function( steering) {
	for(var i=0;i<this.vehicle.getNumWheels();i++){
		if( this.vehicle.getWheelInfo(i).get_m_bIsFrontWheel() ) {
			this.vehicle.setSteeringValue(steering,i);
		}
	}
};
VehicleHelper.prototype.applyEngineForce = function( force, front) {
	for(var i=0;i<this.vehicle.getNumWheels();i++){
		if( front === undefined || this.vehicle.getWheelInfo(i).get_m_bIsFrontWheel() === front) {
			this.vehicle.applyEngineForce(force,i);
		}
	}
};
VehicleHelper.prototype.setBrake = function( force) {
	for(var i=0;i<this.vehicle.getNumWheels();i++){
		this.vehicle.setBrake(force,i);
	}
};
VehicleHelper.prototype.setWheelAxle = function( x, y, z) {
	this.wheelAxle = new Ammo.btVector3( x, y, z);
};
VehicleHelper.prototype.addFrontWheel = function( pos) {
	this.addWheel( pos[0], pos[1], pos[2], true);
};
VehicleHelper.prototype.addRearWheel = function( pos) {
	this.addWheel( pos[0], pos[1], pos[2], false);
};
VehicleHelper.prototype.addWheel = function( x,y,z, isFrontWheel) {
	if( this.doCreateDebugTire) {
		this.createDebugTire([x, y-this.suspension, z], isFrontWheel);
	}
	var wheel = this.vehicle.addWheel(new Ammo.btVector3(x, y, z),this.wheelDir,this.wheelAxle,this.suspension,this.wheelRadius,this.tuning,isFrontWheel);
	wheel.set_m_suspensionStiffness(20);
	wheel.set_m_wheelsDampingRelaxation(2.3);
	wheel.set_m_wheelsDampingCompression(4.4);
	wheel.set_m_frictionSlip(1000);
	wheel.set_m_rollInfluence(0.01); // this value controls how easily a vehicle can tipp over. Lower values tipp less :)
};
VehicleHelper.prototype.updateWheelTransform = function() {
	for(var i=0;i<this.vehicle.getNumWheels();i++){
		// synchronize the wheels with the (interpolated) chassis worldtransform
		this.vehicle.updateWheelTransform(i, true);
		var origin = this.vehicle.getWheelInfo(i).get_m_worldTransform().getOrigin();
		var dt = this.debugTires[i];
		if (dt) {
			dt.transformComponent.setTranslation(origin.x(),origin.y(),origin.z());
		}
	}
};
VehicleHelper.prototype.addDefaultWheels = function() {
	// var bound = entity.meshDataComponent.modelBound;
	var bound = EntityUtils.getTotalBoundingBox( this.chassis);
	this.wheelRadius = bound.xExtent / 3;
	this.addFrontWheel( [bound.xExtent, 0.0,  bound.zExtent]);
	this.addFrontWheel([-bound.xExtent, 0.0,  bound.zExtent]);
	this.addRearWheel(  [bound.xExtent, 0.0, -bound.zExtent]);
	this.addRearWheel( [-bound.xExtent, 0.0, -bound.zExtent]);
};
VehicleHelper.prototype.createDebugTire = function(pos, isFrontWheel) {
	var material = new Material(ShaderLib.simpleLit);
	if( isFrontWheel) {
		material.uniforms.materialAmbient = [1,0,0,1];
	}
	// TODO: use cylinder shape
	var entity = gooRunner.world.createEntity(new Sphere(20, 20, this.wheelRadius), material, pos);
	//var entity = gooRunner.world.createEntity(new Cylinder(20, radius), material, pos);
	//entity.transformComponent.transform.setRotationXYZ(0, -Math.PI/2, 0);
	//entity.transformComponent.setScale( 1, 1, 0.5);
	entity.addToWorld();
	this.debugTires.push(entity);
};
