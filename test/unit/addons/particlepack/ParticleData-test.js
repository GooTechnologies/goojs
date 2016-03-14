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
			var entity = world.createEntity([0, 0, 0], component).addToWorld();
			var store = new Vector3();
			component.particles[0].getWorldPosition(store);
		});

	});
