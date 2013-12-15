require([
	'goo/entities/GooRunner',
	'goo/entities/EntityUtils',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/shapes/ShapeCreator',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/World',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/addons/ammo/AmmoSystem',
	'goo/addons/ammo/AmmoComponent',
	'goo/renderer/light/PointLight'
], function (
	GooRunner,
	EntityUtils,
	Material,
	Camera,
	ShapeCreator,
	TextureCreator,
	ShaderLib,
	World,
	OrbitCamControlScript,
	Vector3,
	AmmoSystem,
	AmmoComponent,
	PointLight
) {
	"use strict";
	var Ammo = window.Ammo; // make jslint happy

	var ammoSystem;
	function init() {
		var goo = new GooRunner({showStats : true});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		ammoSystem = new AmmoSystem();
		goo.world.setSystem(ammoSystem);

		function addPrimitives(e) {
			for (var i=0;i<20;i++) {
				var x = Math.random() * 16 - 8, y = Math.random() * 16 + 8, z = Math.random() * 16 - 8;
				if (Math.random() < 0.5) {
					createEntity(goo, ShapeCreator.createBox(1+Math.random()*2, 1+Math.random()*2, 1+Math.random()*2), {mass:1}, [x,y,z]);
				} else {
					createEntity(goo, ShapeCreator.createSphere(10, 10, 1+Math.random()), {mass:1}, [x,y,z]);
				}
			}
		}
		addPrimitives();

		// some walls
		createEntity(goo, ShapeCreator.createBox(20, 10, 1), {mass: 0}, [0,-10,20]).transformComponent.transform.setRotationXYZ(-Math.PI/3, 0, 0);
		createEntity(goo, ShapeCreator.createBox(20, 10, 1), {mass: 0}, [0,-5,-10]);

		// the floor
		var planeEntity = createEntity(goo, ShapeCreator.createQuad(1000, 1000, 100, 100), {mass: 0}, [0,-10,0]);
		planeEntity.transformComponent.transform.setRotationXYZ(-Math.PI/2, 0, 0);

		var keys = new Array(127).join('0').split('').map(parseFloat); // prefill with 0s
		function keyHandler(e) {
			keys[e.keyCode] = e.type === "keydown" ? 1 : 0;
			if( keys[32]) {
				addPrimitives();
			}
		}
		document.body.addEventListener('keyup', keyHandler, false);
		document.body.addEventListener('keydown', keyHandler, false);

		EntityUtils.createTypicalEntity(goo.world, new PointLight(), [0, 100, -10]).addToWorld();

		var camScript=new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(40, 0, Math.PI/4)
		});
		EntityUtils.createTypicalEntity(goo.world, new Camera(45, 1, 0.1, 1000), camScript).addToWorld();

		var chassis = createEntity(goo, ShapeCreator.createBox(2, 1, 4), {mass: 150}, [13, 2, 10]);
		var vehicle = createVehicle( goo, chassis);

		goo.callbacksPreProcess.push(function() {
			var gEngineForce =  keys[38] * 500 + keys[40] * -300;
			var gVehicleSteering = keys[37] * 0.3 + keys[39] * -0.3;
			vehicle.setSteeringValue(gVehicleSteering,0);
			vehicle.setSteeringValue(gVehicleSteering,1);
			vehicle.applyEngineForce(gEngineForce,2);
			vehicle.applyEngineForce(gEngineForce,3);
			//vehicle.setBrake(gBreakingForce,2);
			//vehicle.setBrake(gBreakingForce,3);

			camScript.lookAtPoint.set( chassis.transformComponent.transform.translation);
			camScript.dirty = true;

			for(var i=0;i<vehicle.getNumWheels();i++){
			  // synchronize the wheels with the (interpolated) chassis worldtransform
			  vehicle.updateWheelTransform(i,true);
			}
		});

	}

	function createVehicle(goo, chassis) {
		goo.world.process(); // or body is undefined
		chassis.ammoComponent.body.setActivationState( 4); // 4 means to never deactivate the vehicle

		var tuning = new Ammo.btVehicleTuning();
		var vehicleRaycaster = new Ammo.btDefaultVehicleRaycaster(ammoSystem.ammoWorld);
		var vehicle = new Ammo.btRaycastVehicle(tuning, chassis.ammoComponent.body, vehicleRaycaster);
		ammoSystem.ammoWorld.addVehicle(vehicle);
		vehicle.setCoordinateSystem(0,1,2); // choose coordinate system

		var wheelDir = new Ammo.btVector3(0,-1,0);
		var wheelAxle = new Ammo.btVector3(-1,0,0);

		function addWheel( x,y,z, isFrontWheel, wheelRadius, suspension) {
			createTire( goo, wheelRadius, [x, y-suspension, z], chassis);
			var wheel = vehicle.addWheel(new Ammo.btVector3(x, y, z),wheelDir,wheelAxle,suspension,wheelRadius,tuning,isFrontWheel);
			wheel.set_m_suspensionStiffness(20);
			wheel.set_m_wheelsDampingRelaxation(2.3);
			wheel.set_m_wheelsDampingCompression(4.4);
			wheel.set_m_frictionSlip(1000);
			wheel.set_m_rollInfluence(0.1); // 1.0
		}
		addWheel( -1, 0.0,  1.0, true,  0.5, 0.3);
		addWheel(  1, 0.0,  1.0, true,  0.5, 0.3);
		addWheel( -1, 0.0, -1.0, false, 0.5, 0.3);
		addWheel(  1, 0.0, -1.0, false, 0.5, 0.3);
		return vehicle;
	}

	function createTire(goo, radius, pos, parent) {
		var material = Material.createMaterial(ShaderLib.simpleLit);
		var entity = EntityUtils.createTypicalEntity(goo.world, ShapeCreator.createCylinder(20, radius), material, pos);
		entity.transformComponent.transform.setRotationXYZ(0, -Math.PI/2, 0);
		entity.transformComponent.setScale( 1, 1, 0.5);
		entity.addToWorld();
		parent.transformComponent.attachChild( entity.transformComponent );
		return entity;
	}

	var texture = new TextureCreator().loadTexture2D('../../resources/goo.png');
	var material = Material.createMaterial(ShaderLib.texturedLit);
	material.setTexture('DIFFUSE_MAP', texture);
	function createEntity(goo, meshData, ammoSettings, pos) {
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData, material, pos);
		entity.setComponent(new AmmoComponent(ammoSettings));
		entity.addToWorld();
		return entity;
	}

	init();
});
