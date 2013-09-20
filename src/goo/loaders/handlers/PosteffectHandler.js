define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/renderer/Util',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/BloomPass'
], function(
	ConfigHandler,
	RSVP,
	PromiseUtil,
	Util,
	ShaderLib,
	FullscreenPass,
	BloomPass
) {
	function PosteffectHandler() {
		ConfigHandler.apply(this, arguments);
	}

	PosteffectHandler.posteffects = {
		Vignette: function () { return new FullscreenPass(Util.clone(ShaderLib.sepia)); },
		Bloom: function (options) { return new BloomPass(options); }
		// populate this list
	};

	PosteffectHandler.prototype = Object.create(ConfigHandler.prototype);
	PosteffectHandler.prototype.constructor = PosteffectHandler;
	ConfigHandler._registerClass('posteffect', PosteffectHandler);

	PosteffectHandler.prototype._prepare = function(/*config*/) {};

	PosteffectHandler.prototype._create = function(/*ref*/) {};

	PosteffectHandler.prototype.update = function(ref, config) {
		var name = config.name;
		var posteffect = null;

		if(PosteffectHandler.posteffects[name] instanceof Function) {
			posteffect = PosteffectHandler.posteffects[name](config.options);
		}
		return PromiseUtil.createDummyPromise(posteffect);
	};

	return PosteffectHandler;
});