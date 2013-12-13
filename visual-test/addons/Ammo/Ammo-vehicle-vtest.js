require([
	'goo/entities/GooRunner',
	'goo/entities/EntityUtils',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/shapes/ShapeCreator',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/World',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/addons/ammo/AmmoSystem',
	'goo/addons/ammo/AmmoComponent',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent'
], function (
	GooRunner,
	EntityUtils,
	Material,
	Camera,
	CameraComponent,
	ShapeCreator,
	TextureCreator,
	ScriptComponent,
	ShaderLib,
	World,
	OrbitCamControlScript,
	Vector3,
	AmmoSystem,
	AmmoComponent,
	PointLight,
	LightComponent
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
			if( e.keyCode !== 32) {// space
				return;
			}

			for (var i=0;i<20;i++) {
				var x = Math.random() * 16 - 8;
				var y = Math.random() * 16 + 8;
				var z = Math.random() * 16 - 8;
				if (Math.random() < 0.5) {
					createEntity(goo, ShapeCreator.createBox(1+Math.random()*2, 1+Math.random()*2, 1+Math.random()*2), {mass:1}, [x,y,z]);
				} else {
					createEntity(goo, ShapeCreator.createSphere(10, 10, 1+Math.random()), {mass:1}, [x,y,z]);
				}
			}
		}

		addPrimitives({keyCode:20});
		document.addEventListener('keypress', addPrimitives, false);

		createEntity(goo, ShapeCreator.createBox(5, 5, 5), {mass: 0}, [0,-7.5,0]);
		createEntity(goo, ShapeCreator.createBox(20, 10, 1), {mass: 0}, [0,-5,10]);
		createEntity(goo, ShapeCreator.createBox(20, 10, 1), {mass: 0}, [0,-5,-10]);
		createEntity(goo, ShapeCreator.createBox(1, 10, 20), {mass: 0}, [10,-5,0]);
		createEntity(goo, ShapeCreator.createBox(1, 10, 20), {mass: 0}, [-10,-5,0]);

		var planeEntity = createEntity(goo, ShapeCreator.createQuad(1000, 1000, 100, 100), {mass: 0}, [0,-10,0]);
		planeEntity.transformComponent.transform.setRotationXYZ(-Math.PI/2, 0, 0);

		var vehicle = createVehicle( goo, [13, 2, 10]);

		var keys = new Array(127).join('0').split('').map(parseFloat); // prefill with 0s
		function keyHandler(e) {
			keys[e.keyCode] = e.type === "keydown" ? 1 : 0;
		}
		document.body.addEventListener('keyup', keyHandler, false);
		document.body.addEventListener('keydown', keyHandler, false);

		var gEngineForce = 0;
		var gBreakingForce = 0;
		var gVehicleSteering = 0;
		var maxEngineForce = 500.0;

		goo.callbacksPreProcess.push(function() {
			if(keys[38]) {
				gEngineForce = -maxEngineForce;
				gBreakingForce = 0.0;
			} else if(keys[40]) {
				gEngineForce = 0.5*maxEngineForce;
			} else {
				gEngineForce = 0.0;
			}
			if(keys[37]) {
				gVehicleSteering = -0.3;
			} else if(keys[39]) {
				gVehicleSteering = 0.3;
			} else {
				gVehicleSteering = 0.0;
			}
			vehicle.applyEngineForce(gEngineForce,2);
			vehicle.setBrake(gBreakingForce,2);
			vehicle.applyEngineForce(gEngineForce,3);
			vehicle.setBrake(gBreakingForce,3);
			vehicle.setSteeringValue(gVehicleSteering,0);
			vehicle.setSteeringValue(gVehicleSteering,1);

			for(var i=0;i<vehicle.getNumWheels();i++){
			  // synchronize the wheels with the (interpolated) chassis worldtransform
			  vehicle.updateWheelTransform(i,true);
			}
		});

		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.setTranslation(0, 100, -10);
		lightEntity.addToWorld();

		var camera = new Camera(45, 1, 0.1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(40, 0, Math.PI/4)
		}));
		cameraEntity.setComponent(scripts);
		cameraEntity.addToWorld();
	}

	function createVehicle(goo, pos) {
		// activationState 4 means to never deactivate the vehicle
		var chassis = createEntity(goo, ShapeCreator.createBox(2, 1, 4), {mass: 50, activationState: 4}, pos);

		//chassis.ammoComponent.body.setLinearVelocity(new Ammo.btVector3(0,0,0));
		//chassis.ammoComponent.body.setAngularVelocity(new Ammo.btVector3(0,0,0));
		//chassis.ammoComponent.body.setContactProcessingThreshold(1000000.0);

		goo.world.process(); // or body is undefined
		console.log( chassis.ammoComponent.body);

		var tuning = new Ammo.btVehicleTuning();
		var vehicleRaycaster = new Ammo.btDefaultVehicleRaycaster(ammoSystem.ammoWorld);
		var vehicle = new Ammo.btRaycastVehicle(tuning, chassis.ammoComponent.body, vehicleRaycaster);
		vehicle.setCoordinateSystem(0,1,2); // choose coordinate system

		var wheelRadius = 0.5;
		var suspensionRestLength = 0.6;
		var wheelDir = new Ammo.btVector3(0,-1,0);
		var wheelAxleCS = new Ammo.btVector3(-1,0,0);

		var isFrontWheel = true;
		var pos = new Ammo.btVector3(-0.5, 0.0, 1.0);
		vehicle.addWheel(pos,wheelDir,wheelAxleCS,suspensionRestLength,wheelRadius,tuning,isFrontWheel);
		pos = new Ammo.btVector3(0.5, 0.0, 1.0);
		vehicle.addWheel(pos,wheelDir,wheelAxleCS,suspensionRestLength,wheelRadius,tuning,isFrontWheel);

		isFrontWheel = false;
		pos = new Ammo.btVector3(-0.5, 0.0, -1.0);
		vehicle.addWheel(pos,wheelDir,wheelAxleCS,suspensionRestLength,wheelRadius,tuning,isFrontWheel);
		pos = new Ammo.btVector3(0.5, 0.0, -1.0);
		vehicle.addWheel(pos,wheelDir,wheelAxleCS,suspensionRestLength,wheelRadius,tuning,isFrontWheel);

		for (var i=0; i<vehicle.getNumWheels(); i++){
			var wheel = vehicle.getWheelInfo(i);
			wheel.set_m_suspensionStiffness(20);
			wheel.set_m_wheelsDampingRelaxation(2.3);
			wheel.set_m_wheelsDampingCompression(4.4);
			wheel.set_m_frictionSlip(1000);
			wheel.set_m_rollInfluence(0.1); // 1.0
		}
		ammoSystem.ammoWorld.addVehicle(vehicle);

		return vehicle;
	}

	function createEntity(goo, meshData, ammoSettings, pos) {
		var material = Material.createMaterial(ShaderLib.simpleLit);
		var entity = EntityUtils.createTypicalEntity(goo.world, meshData, material, pos);
		entity.setComponent(new AmmoComponent(ammoSettings));
		entity.addToWorld();
		return entity;
	}

	init();
});
