var World = require('../../../../src/goo/entities/World');
var DynamicLoader = require('../../../../src/goo/loaders/DynamicLoader');
var AnimationClip = require('../../../../src/goo/animationpack/clip/AnimationClip');
var Configs = require('../../../../test/unit/loaders/Configs');

require('../../../../src/goo/animationpack/handlers/AnimationHandlers');

describe('AnimationClipHandler', function () {
	var loader;

	beforeEach(function () {
		var world = new World();
		loader = new DynamicLoader({
			world: world,
			rootPath: './',
			ajax: false
		});
	});

	it('loads a clip', function (done) {
		var config = Configs.clip();
		loader.preload(Configs.get());
		loader.load(config.id).then(function (clip) {
			expect(clip).toEqual(jasmine.any(AnimationClip));
			done();
		});
	});
});