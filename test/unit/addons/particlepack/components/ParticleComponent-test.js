define([
	'goo/addons/particlepack/components/ParticleComponent',
	'goo/addons/particlepack/curves/LinearCurve',
	'goo/math/Vector3',
	'goo/entities/World',
	'goo/entities/components/TransformComponent',
	'goo/entities/systems/TransformSystem',
	'test/CustomMatchers'
], function (
	ParticleComponent,
	LinearCurve,
	Vector3,
	World,
	TransformComponent,
	TransformSystem,
	CustomMatchers
) {
	'use strict';

	describe('ParticleComponent', function () {
		
		var world;

		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
			world = new World();
			world.registerComponent(TransformComponent);
			world.registerComponent(ParticleComponent);
		});

		it('can clone', function () {
			var component = new ParticleComponent();
			var clone = component.clone();
			expect(component.maxParticles).toBe(clone.maxParticles);
			expect(component.time).toBe(clone.time);
			expect(component.gravity).toEqual(clone.gravity);
			expect(component.seed).toBe(clone.seed);
			expect(component.shapeType).toBe(clone.shapeType);
			expect(component.sphereRadius).toBe(clone.sphereRadius);
			expect(component.sphereEmitFromShell).toBe(clone.sphereEmitFromShell);
			expect(component.randomDirection).toBe(clone.randomDirection);
			expect(component.coneEmitFrom).toBe(clone.coneEmitFrom);
			expect(component.boxExtents).toEqual(clone.boxExtents);
			expect(component.coneRadius).toBe(clone.coneRadius);
			expect(component.coneAngle).toBe(clone.coneAngle);
			expect(component.coneLength).toBe(clone.coneLength);
			expect(component.preWarm).toBe(clone.preWarm);
		});

		it('can emit one', function () {
			var component = new ParticleComponent();
			var entity = world.createEntity([0, 0, 0], component).addToWorld();
			var position = new Vector3();
			var direction = new Vector3(0,1,0);
			component.emitOne(position, direction);
		});
	});
});