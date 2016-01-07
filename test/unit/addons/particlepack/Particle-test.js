define([
	'goo/addons/particlepack/components/ParticleComponent',
	'goo/math/Vector3',
	'goo/entities/World',
	'goo/entities/components/TransformComponent',
	'test/CustomMatchers'
], function (
	ParticleComponent,
	Vector3,
	World,
	TransformComponent,
	CustomMatchers
) {
	'use strict';

	describe('Particle', function () {
		
		var world;

		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
			world = new World();
			world.registerComponent(TransformComponent);
			world.registerComponent(ParticleComponent);
		});

		it('can get world position', function () {
			var component = new ParticleComponent();
			var entity = world.createEntity([0, 0, 0], component).addToWorld();
			var store = new Vector3();
			component.particles[0].getWorldPosition(store);
		});

	});
});