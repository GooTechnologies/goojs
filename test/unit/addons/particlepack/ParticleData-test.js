import Vector3 from 'src/goo/math/Vector3';
import CustomMatchers from 'test/unit/CustomMatchers';
import World from 'src/goo/entities/World';
import TransformComponent from 'src/goo/entities/components/TransformComponent';
import ParticleSystemComponent from 'src/goo/addons/particlepack/components/ParticleSystemComponent';

	describe('ParticleData', function () {

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
