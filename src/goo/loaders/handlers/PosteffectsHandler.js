define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/renderer/pass/PassLib'
], function(
	ConfigHandler,
	RSVP,
	PromiseUtil,
	_,
	PassLib
) {
	"use strict";

	function PosteffectsHandler() {
		ConfigHandler.apply(this, arguments);
	}


	PosteffectsHandler.prototype = Object.create(ConfigHandler.prototype);
	PosteffectsHandler.prototype.constructor = PosteffectsHandler;
	ConfigHandler._registerClass('posteffects', PosteffectsHandler);

	PosteffectsHandler.prototype._create = function() {
		return [];
	};

	PosteffectsHandler.prototype.update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype.update.call(this, ref, config, options).then(function(posteffects) {
			var newEffects = [];
			_.forEach(config.posteffects, function(effectConfig) {
				newEffects.push(that._updateEffect(effectConfig, posteffects));
			}, 'sortValue');

			for (var i = 0; i < newEffects.length; i++) {
				posteffects[i] = newEffects[i];
			}
			posteffects.length = i;
			return posteffects;
		});
	};

	PosteffectsHandler.prototype._updateEffect = function(config, posteffects) {
		var effect;
		for (var i = 0; i < posteffects.length; i++) {
			if (posteffects[i].id === config.id) {
				effect = posteffects[i].id;
				break;
			}
		}
		if (!effect) {
			if (!PassLib[config.type]) {
				return null;
			}
			effect = new PassLib[config.type](config.id);
		}
		effect.update(config);
		return effect;
	};

	return PosteffectsHandler;
});