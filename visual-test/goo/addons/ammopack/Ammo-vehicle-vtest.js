/* global goo */

var Material = goo.Material;
var AmmoSystem = goo.AmmoSystem;
var AmmoComponent = goo.AmmoComponent;
var Box = goo.Box;
var Sphere = goo.Sphere;
var PointLight = goo.PointLight;
var Quad = goo.Quad;
var Vector3 = goo.Vector3;
var TextureCreator = goo.TextureCreator;
var Camera = goo.Camera;
var ShaderLib = goo.ShaderLib;

goo.V.describe('Ammo.js Vehicle test. Use the arrow keys to steer. Press "R" to reset the vehicle. Press "SPACE" to add entities');

var ammoSystem;
function init() {
	ammoSystem = new AmmoSystem();
	gooRunner.world.setSystem(ammoSystem);

	function addPrimitives() {
		for (var i=0;i<20;i++) {
			var x = goo.V.rng.nextFloat() * 16 - 8, y = goo.V.rng.nextFloat() * 16 + 8, z = goo.V.rng.nextFloat() * 16 - 8;
			if (goo.V.rng.nextFloat() < 0.5) {
				createEntity(goo, new Box(1+goo.V.rng.nextFloat()*2, 1+goo.V.rng.nextFloat()*2, 1+goo.V.rng.nextFloat()*2), {mass:1}, [x,y,z]);
			} else {
				createEntity(goo, new Sphere(10, 10, 1+goo.V.rng.nextFloat()), {mass:1}, [x,y,z]);
			}
		}
	}
	addPrimitives();

	// some walls
	createEntity(goo, new Box(20, 10, 1), {mass: 0}, [0,-10,20]).transformComponent.transform.setRotationXYZ(-Math.PI/3, 0, 0);
	createEntity(goo, new Box(20, 10, 1), {mass: 0}, [0,-5,-10]);

	// the floor
	var planeEntity = createEntity(goo, new Quad(1000, 1000, 100, 100), {mass: 0}, [0,-10,0]);
	planeEntity.transformComponent.transform.setRotationXYZ(-Math.PI/2, 0, 0);

	var keys = new Array(127).join('0').split('').map(parseFloat); // prefill with 0s
	function keyHandler(e) {
		keys[e.keyCode] = e.type === "keydown" ? 1 : 0;
		if( keys[32]) {
			addPrimitives();
		}
		if( keys[82]) { // r
			vehicleHelper.resetAtPos(0, 4, 0);
		}
	}
	document.body.addEventListener('keyup', keyHandler, false);
	document.body.addEventListener('keydown', keyHandler, false);

	gooRunner.world.createEntity(new PointLight(), [0, 100, -10]).addToWorld();

	var chassis = createEntity(goo, new Box(2, 1, 4), {mass: 150, showBounds:true, useWorldBounds:true}, [13, 2, 10]);
	var vehicleHelper = new VehicleHelper( goo, ammoSystem, chassis, 0.5, 0.3, true);
	vehicleHelper.setWheelAxle( -1, 0, 0);
	vehicleHelper.addFrontWheel( [ -1, 0.0,  1.0] );
	vehicleHelper.addFrontWheel( [  1, 0.0,  1.0]);
	vehicleHelper.addRearWheel(  [ -1, 0.0, -1.0]);
	vehicleHelper.addRearWheel(  [  1, 0.0, -1.0]);

	gooRunner.callbacksPreRender.push(function() {
		vehicleHelper.setSteeringValue( keys[37] * 0.3 + keys[39] * -0.3);
		vehicleHelper.applyEngineForce( keys[38] * 1500 + keys[40] * -500, true);
		vehicleHelper.updateWheelTransform();
	});

	var aboveCar = new Vector3();
	var behindCar = new Vector3();
	var camScriptObject = {};

	camScriptObject.run = function(entity) {
		var transform = chassis.transformComponent.transform;
		var pos = transform.translation;
		behindCar.setDirect(0,0,-16);
		behindCar.applyPost(transform.rotation);
		behindCar.add(pos).addDirect(0,15,0);
		// TODO: this will always produce some lag. Should be in a fixed update loop
		entity.transformComponent.transform.translation.lerp(behindCar,0.05);
		entity.lookAt(aboveCar.set(pos).addDirect(0,1,0),Vector3.UNIT_Y);
	};

	gooRunner.world.createEntity(new Camera(45, 1, 0.1, 1000), camScriptObject).addToWorld();
}

var material = new Material(ShaderLib.texturedLit);
new TextureCreator().loadTexture2D('../../../resources/goo.png').then(function (texture) {
	material.setTexture('DIFFUSE_MAP', texture);
});
function createEntity(goo, meshData, ammoSettings, pos) {
	var entity = gooRunner.world.createEntity(meshData, material, pos);
	if (ammoSettings !== undefined) {
		entity.setComponent(new AmmoComponent(ammoSettings));
	}
	entity.addToWorld();
	return entity;
}


var gooRunner = goo.V.initGoo();

init();

goo.V.process();
