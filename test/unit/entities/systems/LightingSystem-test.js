define([
	'goo/entities/Entity',
	'goo/entities/components/TransformComponent',
	'goo/entities/components/LightComponent',
	'goo/entities/systems/LightingSystem'
], function (
	Entity,
	TransformComponent,
	LightComponent,
	LightingSystem
) {
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
	});
});