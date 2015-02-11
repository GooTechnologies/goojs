require([
	'lib/V',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/math/Vector3',
	'goo/util/combine/EntityCombiner'
], function (
	V,
	Material,
	ShaderLib,
	Box,
	Sphere,
	Vector3,
	EntityCombiner
) {
	'use strict';

	V.describe('4000 spheres spinning in an entity hierarchy. Leaf spheres have static set to true.\nPress 1 to combine and 2 to uncombine');

	var goo = V.initGoo({
		showStats: true
	});
	var world = goo.world;
	V.addOrbitCamera(new Vector3(40, Math.PI / 3, Math.PI / 5));
	V.addLights();

	var material1 = new Material(ShaderLib.uber);
	var material2 = new Material(ShaderLib.uber);
	material2.uniforms.materialDiffuse = [1.0, 0.0, 0.0, 1.0];

	var children = [];

	function createSphereGrid(pos, numBoxes, size, separation) {
		var parentEntity = world.createEntity(pos, 'Top'+pos).addToWorld();
		var sphere = new Sphere(16, 16, size);
		for (var i = 0; i < numBoxes; i++) {
			for (var j = 0; j < numBoxes; j++) {
				for (var k = 0; k < numBoxes; k++) {
					var position = [size * (i - numBoxes / 2) * separation, size * (j - numBoxes / 2) * separation, size * (k - numBoxes / 2) * separation];
					var material = Math.random() < 0.5 ? material1 : material2;
					var entity = world.createEntity(position, 'Child'+pos, sphere, material).addToWorld();
					(function (rand, j) {
						entity.set(function (entity) {
							entity.transformComponent.transform.translation.y = size * (j - numBoxes / 2) * separation + Math.sin(goo.world.time * 5 + rand) * 5;
							entity.transformComponent.setUpdated();
						});
					})(V.rng.nextFloat() * Math.PI*2, j);
					entity.static = true;
					parentEntity.attachChild(entity);
					children.push(entity);

				}
			}
		}
		parentEntity.set(function (entity) {
			entity.setRotation(0, world.time, 0);
		});
		return parentEntity;
	}

	var rootEntity = world.createEntity('Root').addToWorld();
	rootEntity.set(function (entity) {
		entity.setRotation(0, world.time, 0);
	});
	var sphereCount = 8;
	var grid1 = createSphereGrid([-5, 0, 5], sphereCount, 0.5, 1.5);
	rootEntity.attachChild(grid1);
	rootEntity.attachChild(createSphereGrid([5, 0, 5], sphereCount, 0.5, 1.5));
	rootEntity.attachChild(createSphereGrid([-5, 0, -5], sphereCount, 0.5, 1.5));
	rootEntity.attachChild(createSphereGrid([5, 0, -5], sphereCount, 0.5, 1.5));

	var entityCombiner = null;

	entityCombiner = new EntityCombiner(world, false);
	document.addEventListener('keydown', function (evt) {
		switch (evt.keyCode) {
			case 49: // 1
				entityCombiner.combine();
				break;
			case 50: // 2
				if (entityCombiner) {
					entityCombiner.uncombine();
				}
				break;
			case 51: // 3
				if (entityCombiner) {
					entityCombiner.uncombine(children[1]);
					children[1].static = false;
					entityCombiner.combine();
				}
				break;
			case 52: // 4
				if (entityCombiner) {
					entityCombiner.uncombine(children[1]);
				}
				break;
			case 53: // 5
				entityCombiner = new EntityCombiner(world, true);
				entityCombiner.combine();
				break;
			case 54: // 6
				entityCombiner.combineList(grid1);
				break;
			default:
				break;
		}
	}, false);

	V.button('Combine', function () {
		entityCombiner.combine();
	});
	V.button('Uncombine', function () {
		entityCombiner.uncombine();
	});
});
