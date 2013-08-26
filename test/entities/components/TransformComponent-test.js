define([
	'goo/entities/World',
	'goo/entities/systems/TransformSystem'
], function(
	World,
	TransformSystem
) {
	'use strict';

	describe('TransformComponent', function() {
		var world;
		beforeEach(function() {
			world = new World();
			world.setSystem(new TransformSystem());
		});

		it('can attach a child component via the transformComponent', function() {
			var parentEntity = world.createEntity();
			var childEntity = world.createEntity();
			parentEntity.addToWorld();
			childEntity.addToWorld();
			parentEntity.transformComponent.attachChild(childEntity.transformComponent);
			world.process();

			expect(parentEntity.transformComponent.children)
				.toContain(childEntity.transformComponent);

			expect(childEntity.transformComponent.parent).toBe(parentEntity.transformComponent);
		});

		it('correctly removes parent reference of child on its removal from the world', function() {
			var parentEntity = world.createEntity();
			var childEntity = world.createEntity();
			parentEntity.addToWorld();
			childEntity.addToWorld();
			parentEntity.transformComponent.attachChild(childEntity.transformComponent);
			world.process();
			childEntity.removeFromWorld();
			world.process();
			expect(parentEntity.transformComponent.children)
				.not.toContain(childEntity.transformComponent);
			expect(childEntity.transformComponent.parent).toBeNull();
		});

		it('correctly removes child reference of parent on its removal from the world', function() {
			var parentEntity = world.createEntity();
			var childEntity = world.createEntity();
			parentEntity.addToWorld();
			childEntity.addToWorld();
			parentEntity.transformComponent.attachChild(childEntity.transformComponent);
			world.process();
			parentEntity.removeFromWorld();
			world.process();
			expect(childEntity.transformComponent.parent).toBeNull();
			expect(parentEntity.transformComponent.children)
				.not.toContain(childEntity.transformComponent);
		});
	});
});
