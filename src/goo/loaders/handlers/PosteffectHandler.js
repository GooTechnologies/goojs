define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/renderer/Util',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/BloomPass',
	'goo/util/ObjectUtil'
], function(
	ConfigHandler,
	RSVP,
	PromiseUtil,
	Util,
	ShaderLib,
	FullscreenPass,
	BloomPass,
	_
) {
	function PosteffectHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}

	PosteffectHandler.posteffects = {
		Vignette: function () { return new FullscreenPass(Util.clone(ShaderLib.sepia)); },
		Bloom: function (options) { return new BloomPass(options); },
		Grain: function (/*options*/) {
			var shader = Util.clone(ShaderLib.film);
			shader.uniforms.nIntensity = 1.0;
			shader.uniforms.sIntensity = 0.0;
			return new FullscreenPass(shader);
		}
		// populate this list
	};

	PosteffectHandler.prototype = Object.create(ConfigHandler.prototype);
	PosteffectHandler.prototype.constructor = PosteffectHandler;
	ConfigHandler._registerClass('posteffect', PosteffectHandler);

	PosteffectHandler.prototype._prepare = function(config) {
		_.defaults(config, {
			enabled: true
		});
	};

	PosteffectHandler.prototype._create = function(ref, config) {
		if (!config.name || !PosteffectHandler.posteffects[config.name]) {
			throw new Error('Unknown posteffect name: ' + config.name);
		}
		var name = config.name;
		return this._objects[ref] = PosteffectHandler.posteffects[name](config.options);
	};

	PosteffectHandler.prototype.update = function(ref, config) {
		var object = this._objects[ref] || this._create(ref, config);
		this._prepare(config);

		for (var name in config.options) {
			if (object.hasOwnProperty(name)) {
				object[name] = _.clone(config.options[name]);
			}
		}
		return PromiseUtil.createDummyPromise(object);
	};

	return PosteffectHandler;
});