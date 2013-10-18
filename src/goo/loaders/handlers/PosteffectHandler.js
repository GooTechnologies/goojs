define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/renderer/Util',
	'goo/renderer/pass/PassLib',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/BloomPass',
	'goo/util/ObjectUtil'
], function(
	ConfigHandler,
	RSVP,
	PromiseUtil,
	Util,
	PassLib,
	ShaderLib,
	FullscreenPass,
	BloomPass,
	_
) {
	"use strict";

	function PosteffectHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}


	PosteffectHandler.prototype = Object.create(ConfigHandler.prototype);
	PosteffectHandler.prototype.constructor = PosteffectHandler;
	ConfigHandler._registerClass('posteffect', PosteffectHandler);

	PosteffectHandler.prototype._prepare = function(config) {
		var pass = PassLib[config.name];
		_.defaults(config, {
			enabled: true,
			options: {}
		});
		var defaults = pass.options;
		for(var i = 0; i < defaults.length; i++) {
			var option = defaults[i];
			if(config.options[option.key] === undefined) {
				config.options[option.key] = option['default'];
			}
		}
	};

	PosteffectHandler.prototype._create = function(ref, config) {
		if (!config.name || !PassLib[config.name]) {
			throw new Error('Unknown posteffect name: ' + config.name);
		}
		this._objects[ref] = PassLib[config.name];
		this._objects[ref].create();
		return this._objects[ref];
	};

	PosteffectHandler.prototype.update = function(ref, config) {
		var object = this._objects[ref] || this._create(ref, config);
		this._prepare(config);
		object.update(config);

		return PromiseUtil.createDummyPromise(object);
	};

	return PosteffectHandler;
});