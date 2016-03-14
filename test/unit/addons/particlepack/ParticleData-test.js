	describe('ParticleData', function () {

		var Vector3 = require('src/goo/math/Vector3');
		var CustomMatchers = require('test/unit/CustomMatchers');
		var World = require('src/goo/entities/World');
		var TransformComponent = require('src/goo/entities/components/TransformComponent');
		var ParticleSystemComponent = require('src/goo/addons/particlepack/components/ParticleSystemComponent');

		var world;

		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
			world = new World();
			world.registerComponent(TransformComponent);
			world.registerComponent(ParticleSystemComponent);
		});

		it('can get world position', function () {
			var component = new ParticleSystemComponent();
			world.createEntity([0, 0, 0], component).addToWorld();
			var store = new Vector3();
			component.particles[0].getWorldPosition(store);
		});

	});
