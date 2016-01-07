define([
	'goo/addons/particlepack/components/ParticleComponent',
	'goo/addons/particlepack/curves/LinearCurve',
	'goo/addons/particlepack/curves/Vector4Curve',
	'goo/addons/particlepack/curves/Vector3Curve',
	'goo/math/Vector3',
	'goo/entities/World',
	'goo/entities/components/TransformComponent',
	'goo/entities/systems/TransformSystem',
	'goo/renderer/Texture',
	'goo/renderer/MeshData',
	'test/CustomMatchers'
], function (
	ParticleComponent,
	LinearCurve,
	Vector4Curve,
	Vector3Curve,
	Vector3,
	World,
	TransformComponent,
	TransformSystem,
	Texture,
	MeshData,
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