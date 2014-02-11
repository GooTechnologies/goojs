require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/ShapeCreator',
	'goo/math/Vector3',
	'goo/addons/box2d/systems/Box2DSystem',
	'goo/addons/box2d/components/Box2DComponent',
	'goo/math/MathUtils',
	'goo/geometrypack/FilledPolygon',
	'../../lib/V'
], function (
	Material,
	ShaderLib,
	ShapeCreator,
	Vector3,
	Box2DSystem,
	Box2DComponent,
	MathUtils,
	FilledPolygon,
	V
	) {
	'use strict';

	var gooRunner;
	var pipeEntity;
	var sceneWidth = 3;

	function getRandomColor() {
		var k = Math.random() * Math.PI * 2;
		var col = [Math.sin(k),
			Math.sin(k + Math.PI * 2 / 3),
			Math.sin(k + Math.PI * 4 / 3)].map(function(v) { return v / 2 + 0.5; });
		col.push(1);
		return col;
	}

	function getRandomColoredMaterial() {
		var material = Material.createMaterial(ShaderLib.simpleLit, 'Floormaterial');
		material.materialState.diffuse = getRandomColor();
		return material;
	}

	function addStaticBox(width, x, y, angle) {
		var worldHeight = 0.1;
		var meshData = ShapeCreator.createBox(width, worldHeight, worldHeight * 5);
		var material = getRandomColoredMaterial();
		var entity = gooRunner.world.createEntity(meshData, material, [x, y, 0]);
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
		var radius = Math.random() * 0.3 + 0.3;

		var meshData = ShapeCreator.createCylinder(32, radius);
		var material = getRandomColoredMaterial();
		var entity = gooRunner.world.createEntity(meshData, material, [x, y, 0]);

		var box2DComponent = new Box2DComponent({
			radius: radius,
			shape: 'circle'
		});
		entity.setComponent(box2DComponent);
		entity.addToWorld();
		return entity;
	}

	function addBox(x, y) {
		var width = Math.random() * 0.5 + 0.5;
		var height = Math.random() * 0.5 + 0.5;

		var meshData = ShapeCreator.createBox(width, height, width);
		var material = getRandomColoredMaterial();
		var entity = gooRunner.world.createEntity(meshData, material, [x, y, 0]);

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
		var material = getRandomColoredMaterial();
		var entity = gooRunner.world.createEntity(meshData, material, [x, y, 0]);

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
		var meshData = ShapeCreator.createCylinder(32, 1);
		var material = getRandomColoredMaterial();
		var moveAroundScript = function(entity/*, tpf*/) {
			var oldY = entity.transformComponent.transform.translation.y;
			entity.transformComponent.transform.translation.setd(Math.sin(gooRunner.world.time) * sceneWidth, oldY, 0);
			entity.transformComponent.setUpdated();
		};
		pipeEntity = gooRunner.world.createEntity(meshData, material, [0, pipeY + pipeScale / 2, 0], moveAroundScript);
		pipeEntity.transformComponent.transform.rotation.rotateX(Math.PI / 2);
		pipeEntity.transformComponent.transform.scale.setd(1, 1, pipeScale);
		pipeEntity.addToWorld();

	}

	function box2DDemo() {
		gooRunner = V.initGoo();

		// add box2D system to world
		gooRunner.world.setSystem(new Box2DSystem());

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
	}

	box2DDemo();
});
