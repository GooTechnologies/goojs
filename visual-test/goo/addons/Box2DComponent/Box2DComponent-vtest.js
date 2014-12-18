require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Cylinder',
	'goo/math/Vector3',
	'goo/addons/box2dpack/systems/Box2DSystem',
	'goo/addons/box2dpack/components/Box2DComponent',
	'goo/math/MathUtils',
	'goo/geometrypack/FilledPolygon',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Cylinder,
	Vector3,
	Box2DSystem,
	Box2DComponent,
	MathUtils,
	FilledPolygon,
	V
	) {
	'use strict';

	V.describe('All entities in the scene have a box2d component which updates their transform.');

	function addStaticBox(width, x, y, angle) {
		var worldHeight = 0.1;
		var meshData = new Box(width, worldHeight, worldHeight * 5);
		var material = V.getColoredMaterial();
		var entity = world.createEntity(meshData, material, [x, y, 0]);
		entity.transformComponent.transform.rotation.rotateZ(angle);

		var box2DComponent = new Box2DComponent({
			width: width,
			height: worldHeight,
			shape: 'box',
			movable: false
		});
		entity.setComponent(box2DComponent);
		entity.addToWorld();
		return entity;
	}

	function addCircle(x, y) {
		var radius = V.rng.nextFloat() * 0.3 + 0.3;

		var meshData = new Cylinder(32, radius);
		var material = V.getColoredMaterial();
		var entity = world.createEntity(meshData, material, [x, y, 0]);

		var box2DComponent = new Box2DComponent({
			radius: radius,
			shape: 'circle'
		});
		entity.setComponent(box2DComponent);
		entity.addToWorld();
		return entity;
	}

	function addBox(x, y) {
		var width = V.rng.nextFloat() * 0.5 + 0.5;
		var height = V.rng.nextFloat() * 0.5 + 0.5;

		var meshData = new Box(width, height, width);
		var material = V.getColoredMaterial();
		var entity = world.createEntity(meshData, material, [x, y, 0]);

		var box2DComponent = new Box2DComponent({
			width: width,
			height: height,
			shape: 'box'
		});
		entity.setComponent(box2DComponent);
		entity.addToWorld();
		return entity;
	}

	function addPolygon(x, y) {
		var verts = [
			0, 0, 0,
			0.7, 0,0,
			1, 0.5,0,
			0.5, 1, 0,
			-0.3, 0.5, 0];
		var meshData = new FilledPolygon(verts);
		var material = V.getColoredMaterial();
		var entity = world.createEntity(meshData, material, [x, y, 0]);

		var verts = [
			0, 0,
			0.7, 0,
			1, 0.5,
			0.5, 1,
			-0.3, 0.5];
		var box2DComponent = new Box2DComponent({
			shape: 'polygon',
			vertices: verts
		});
		entity.setComponent(box2DComponent);
		entity.addToWorld();
		return entity;
	}

	function createPipe(pipeY) {
		var pipeScale = 200;
		var meshData = new Cylinder(32, 1);
		var material = V.getColoredMaterial();
		var moveAroundScript = function(entity/*, tpf*/) {
			var oldY = entity.transformComponent.transform.translation.y;
			entity.transformComponent.transform.translation.setDirect(Math.sin(world.time) * sceneWidth, oldY, 0);
			entity.transformComponent.setUpdated();
		};
		pipeEntity = world.createEntity(meshData, material, [0, pipeY + pipeScale / 2, 0], moveAroundScript);
		pipeEntity.transformComponent.transform.rotation.rotateX(Math.PI / 2);
		pipeEntity.transformComponent.transform.scale.setDirect(1, 1, pipeScale);
		pipeEntity.addToWorld();

	}

	function setupKeys(pipeY) {
		document.addEventListener('keypress', function(e) {
			switch (e.which) {
				case 49: // add circle
					console.log('add another circle');
					addCircle(pipeEntity.transformComponent.transform.translation.x, pipeY);
					break;
				case 50: // add box
					console.log('add another box');
					addBox(pipeEntity.transformComponent.transform.translation.x, pipeY);
					break;
				case 51: // add polygon
					addPolygon(pipeEntity.transformComponent.transform.translation.x, pipeY);
					break;
				default:
					console.log(
						'1 - add a random circle\n' +
						'2 - add a random box\n' +
						'3 - add a polygon'
					);
			}
		});

		V.button('Add Circle', function () {
			addCircle(pipeEntity.transformComponent.transform.translation.x, pipeY);
		});
		V.button('Add Box', function () {
			addBox(pipeEntity.transformComponent.transform.translation.x, pipeY);
		});
		V.button('Add Polygon', function () {
			addPolygon(pipeEntity.transformComponent.transform.translation.x, pipeY);
		});
	}


	var goo = V.initGoo();
	var world = goo.world;

	var pipeEntity;
	var sceneWidth = 3;

	// add box2D system to world
	world.setSystem(new Box2DSystem());

	// add the world
	var angle = 40 * MathUtils.DEG_TO_RAD;
	var hangingWidth = 4;
	var hangOffset = 1.3;
	addStaticBox(20, 0, 0, 0);
	addStaticBox(hangingWidth, hangOffset, 3, angle);
	addStaticBox(hangingWidth, -hangOffset, 6, -angle);
	addStaticBox(hangingWidth, hangOffset, 9, angle);

	// add a couple of primordial objects
	addCircle(0, 8);
	addCircle(0, 9);
	addCircle(0, 10);
	addBox(0, 5);
	addBox(0, 6);
	addBox(0, 7);

	// spawning altitude
	var pipeY = 14;

	// create the shape spawner
	createPipe(pipeY);

	// add light
	V.addLights();

	// add camera
	V.addOrbitCamera(new Vector3(20, Math.PI / 2, 0.3), new Vector3(0, 7.5, 0));

	// setup some interaction
	setupKeys(pipeY);

	V.process();
});
