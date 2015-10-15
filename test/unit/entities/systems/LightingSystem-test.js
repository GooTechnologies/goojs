define([
	'goo/entities/Entity',
	'goo/entities/World',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/LightComponent',
	'goo/entities/systems/LightingSystem'
], function (
	Entity,
	World,
	TransformComponent,
	LightComponent,
	LightingSystem
) {
	'use strict';

	describe('LightingSystem', function () {
		describe('inserted', function () {
			it('will update a light\'s transform', function () {
				var light = jasmine.createSpyObj('Light', ['update']);
				var lightComponent = new LightComponent(light);
				var entity = new Entity().setComponent(lightComponent).setComponent(new TransformComponent());
				var lightingSystem = new LightingSystem();

				lightingSystem.inserted(entity);

				expect(light.update).toHaveBeenCalledWith(entity.transformComponent.worldTransform);
			});
		});

		// testing interaction coming from 'world-space'
		describe('+World', function () {
			it('adds and updates a light when adding an entity with a light component to the world', function () {
				var light = jasmine.createSpyObj('Light', ['update']);
				var lightComponent = new LightComponent(light);
				var lightingSystem = new LightingSystem();

				var world = new World();
				world.setSystem(lightingSystem);
				var entity = world.createEntity(lightComponent).addToWorld();

				world.process();

				expect(lightingSystem.lights).toContain(light);
				expect(light.update).toHaveBeenCalledWith(entity.transformComponent.worldTransform);
			});

			it('adds and updates a light when adding a light component on an existing entity', function () {
				var light = jasmine.createSpyObj('Light', ['update']);
				var lightComponent = new LightComponent(light);
				var lightingSystem = new LightingSystem();

				var world = new World();
				world.setSystem(lightingSystem);
				var entity = world.createEntity().addToWorld();

				world.process();

				entity.setComponent(lightComponent);

				world.process();

				expect(lightingSystem.lights).toContain(light);
				expect(light.update).toHaveBeenCalledWith(entity.transformComponent.worldTransform);
			});
		});
	});
});