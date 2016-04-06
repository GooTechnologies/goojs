var Vector3 = require('../../../../src/goo/math/Vector3');
var TransformSystem = require('../../../../src/goo/entities/systems/TransformSystem');
var World = require('../../../../src/goo/entities/World');

describe('TransformSystem', function () {
	var world;

	function createEntity(x, y, z) {
		var entity = world.createEntity().addToWorld();
		entity.setTranslation(new Vector3(x || 0, y || 0, z || 0));
		return entity;
	}

	beforeEach(function () {
		world = new World();
		world.setSystem(new TransformSystem());
	});

	it('updates the world transform of a single entity', function () {
		var entity = createEntity(1, 2, 3);
		world.process();
		expect(entity.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
	});

	it('updates the world transform of a parent-child structure and propagates correctly', function () {
		var grandParent = createEntity(1, 2, 3);
		var parent = createEntity(1, 2, 3);
		var child = createEntity(1, 2, 3);

		grandParent.attachChild(parent);
		parent.attachChild(child);

		world.process();

		expect(grandParent.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		expect(parent.transformComponent.worldTransform.translation).toEqual(new Vector3(2, 4, 6));
		expect(child.transformComponent.worldTransform.translation).toEqual(new Vector3(3, 6, 9));

		parent.setTranslation(0, 0, 0);

		world.process();

		expect(grandParent.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		expect(parent.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		expect(child.transformComponent.worldTransform.translation).toEqual(new Vector3(2, 4, 6));

		grandParent.setTranslation(0, 0, 0);
		parent.setTranslation(1, 2, 3);
		child.setTranslation(1, 2, 3);

		world.process();

		expect(grandParent.transformComponent.worldTransform.translation).toEqual(new Vector3(0, 0, 0));
		expect(parent.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		expect(child.transformComponent.worldTransform.translation).toEqual(new Vector3(2, 4, 6));
	});

	it('updates all children correctly in a chain', function () {
		var entityA = createEntity();
		var entityB = createEntity();
		var entityC = createEntity(1, 2, 3);
		var entityD = createEntity();
		var entityE = createEntity();

		entityA.attachChild(entityB);
		entityB.attachChild(entityC);
		entityC.attachChild(entityD);
		entityD.attachChild(entityE);

		world.process();

		expect(entityA.transformComponent.worldTransform.translation).toEqual(new Vector3(0, 0, 0));
		expect(entityB.transformComponent.worldTransform.translation).toEqual(new Vector3(0, 0, 0));
		expect(entityD.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		expect(entityE.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
	});

	it('updates all children correctly in a chain', function () {
		var entityE = createEntity();
		var entityD = createEntity();
		var entityC = createEntity(1, 2, 3);
		var entityB = createEntity();
		var entityA = createEntity(1, 2, 3);

		entityA.attachChild(entityB);
		entityB.attachChild(entityC);
		entityC.attachChild(entityD);
		entityD.attachChild(entityE);

		world.process();

		expect(entityA.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		expect(entityB.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		expect(entityD.transformComponent.worldTransform.translation).toEqual(new Vector3(2, 4, 6));
		expect(entityE.transformComponent.worldTransform.translation).toEqual(new Vector3(2, 4, 6));
	});
});
