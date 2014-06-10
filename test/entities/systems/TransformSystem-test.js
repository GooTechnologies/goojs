define([
	'goo/entities/systems/TransformSystem',
	'goo/entities/World',
	'goo/math/Vector3',
], function (
	TransformSystem,
	World,
	Vector3
) {
	'use strict';

	describe('TransformSystem', function () {
		var world;
		var gooRunner;

		beforeEach(function() {
			world = new World();
			world.setSystem(new TransformSystem());
		});

		it('updates the world transform of a single entity', function () {
			var entity = world.createEntity();
			entity.addToWorld();
			entity.setTranslation(1, 2, 3);
			world.process();
			expect(entity.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
		});

		it('updates the world transform of a parent-child structure', function () {

			var grandParent = world.createEntity().addToWorld();
			var parent = world.createEntity().addToWorld();
			var child = world.createEntity().addToWorld();

			grandParent.setTranslation(1, 2, 3);
			parent.setTranslation(1, 2, 3);
			child.setTranslation(1, 2, 3);

			grandParent.attachChild(parent);
			parent.attachChild(child);

			world.process();
			expect(grandParent.transformComponent.worldTransform.translation).toEqual(new Vector3(1, 2, 3));
			expect(parent.transformComponent.worldTransform.translation).toEqual(new Vector3(2, 4, 6));
			expect(child.transformComponent.worldTransform.translation).toEqual(new Vector3(3, 6, 9));
		});

		it('updates all children correctly in a chain', function () {

			var entityA = world.createEntity().addToWorld();
			var entityB = world.createEntity().addToWorld();
			var entityC = world.createEntity().addToWorld();
			var entityD = world.createEntity().addToWorld();
			var entityE = world.createEntity().addToWorld();

			entityC.setTranslation(1, 2, 3);

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

			var entityE = world.createEntity().addToWorld();
			var entityD = world.createEntity().addToWorld();
			var entityC = world.createEntity().addToWorld();
			var entityB = world.createEntity().addToWorld();
			var entityA = world.createEntity().addToWorld();

			entityA.setTranslation(1, 2, 3);
			entityC.setTranslation(1, 2, 3);

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

});
