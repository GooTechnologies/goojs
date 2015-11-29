describe('AnimationStateHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads an animation state', function (done) {
		var stateConfig = Configs.animstate();
		loader.preload(Configs.get());
		loader.load(stateConfig.id).then(function (state) {
			expect(state).toEqual(jasmine.any(SteadyState));
			expect(state._sourceTree).toEqual(jasmine.any(ClipSource));
			expect(state._sourceTree._clip).toEqual(jasmine.any(AnimationClip));
			done();
		});
	});
});