require([
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/shapes/Quad',
	'goo/renderer/TextureCreator',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/World',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/addons/ammo/AmmoSystem',
	'goo/addons/ammo/AmmoComponent',
	'goo/renderer/light/PointLight',
	'VehicleHelper',
	'../../lib/V'
], function (
	Material,
	Camera,
	Box,
	Sphere,
	Quad,
	TextureCreator,
	ShaderLib,
	World,
	OrbitCamControlScript,
	Vector3,
	AmmoSystem,
	AmmoComponent,
	PointLight,
	VehicleHelper,
	V
) {
	'use strict';

	var ammoSystem;
	function init() {
		ammoSystem = new AmmoSystem();
		goo.world.setSystem(ammoSystem);

		function addPrimitives() {
			for (var i=0;i<20;i++) {
				var x = V.rng.nextFloat() * 16 - 8, y = V.rng.nextFloat() * 16 + 8, z = V.rng.nextFloat() * 16 - 8;
				if (V.rng.nextFloat() < 0.5) {
					createEntity(goo, new Box(1+V.rng.nextFloat()*2, 1+V.rng.nextFloat()*2, 1+V.rng.nextFloat()*2), {mass:1}, [x,y,z]);
				} else {
					createEntity(goo, new Sphere(10, 10, 1+V.rng.nextFloat()), {mass:1}, [x,y,z]);
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

		goo.world.createEntity(new PointLight(), [0, 100, -10]).addToWorld();

		var camScript = new OrbitCamControlScript({
			domElement: goo.renderer.domElement,
			spherical: new Vector3(40, 0, Math.PI/4)
		});
		goo.world.createEntity(new Camera(45, 1, 0.1, 1000), camScript).addToWorld();

		/* shift center of gravity, felt kinda useless to me
			var box = createEntity(goo, new Box(2, 2, 4), undefined, [0, 0.6, 0]);
			var compound = goo.world.createEntity([0,7,0]);
			compound.transformComponent.attachChild(box.transformComponent);
			compound.setComponent(new AmmoComponent({mass:150}));
			compound.addToWorld();
			goo.world.process();
			var chassis = compound;
		*/

		var chassis = createEntity(goo, new Box(2, 1, 4), {mass: 150, showBounds:true, useWorldBounds:true}, [13, 2, 10]);
		var vehicleHelper = new VehicleHelper( goo, ammoSystem, chassis, 0.5, 0.3, true);
		vehicleHelper.setWheelAxle( -1, 0, 0);
		vehicleHelper.addFrontWheel( [ -1, 0.0,  1.0] );
		vehicleHelper.addFrontWheel( [  1, 0.0,  1.0]);
		vehicleHelper.addRearWheel(  [ -1, 0.0, -1.0]);
		vehicleHelper.addRearWheel(  [  1, 0.0, -1.0]);

		goo.callbacksPreProcess.push(function() {
			vehicleHelper.setSteeringValue( keys[37] * 0.3 + keys[39] * -0.3);
			vehicleHelper.applyEngineForce( keys[38] * 1500 + keys[40] * -500, true);
			vehicleHelper.updateWheelTransform();

			camScript.lookAtPoint.set( chassis.transformComponent.transform.translation);
			camScript.dirty = true;
		});
	}

	var texture = new TextureCreator().loadTexture2D('../../resources/goo.png');
	var material = new Material(ShaderLib.texturedLit);
	material.setTexture('DIFFUSE_MAP', texture);
	function createEntity(goo, meshData, ammoSettings, pos) {
		var entity = goo.world.createEntity(meshData, material, pos);
		if (ammoSettings !== undefined) {
			entity.setComponent(new AmmoComponent(ammoSettings));
		}
		entity.addToWorld();
		return entity;
	}

	var goo = V.initGoo();
	var world = goo.world;

	init();
});
