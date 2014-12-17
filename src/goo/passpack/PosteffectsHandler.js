define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/util/ArrayUtil',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil',
	'goo/renderer/pass/Composer',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Util',
	'goo/passpack/PassLib'
], function (
	ConfigHandler,
	ArrayUtil,
	RSVP,
	PromiseUtil,
	_,
	Composer,
	RenderPass,
	FullscreenPass,
	ShaderLib,
	Util,
	PassLib
) {
	'use strict';

	/**
	 * @class Handler for loading posteffects into engine
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @private
	 */
	function PosteffectsHandler() {
		ConfigHandler.apply(this, arguments);
		this._composer = new Composer();
		var renderSystem = this.world.getSystem('RenderSystem');
		this._renderPass = new RenderPass(renderSystem.renderList);
		this._outPass = new FullscreenPass(Util.clone(ShaderLib.copy));
		this._outPass.renderToScreen = true;
	}


	PosteffectsHandler.prototype = Object.create(ConfigHandler.prototype);
	PosteffectsHandler.prototype.constructor = PosteffectsHandler;
	ConfigHandler._registerClass('posteffects', PosteffectsHandler);

	/**
	 * Removes the posteffects, i e removes the composer from rendersystem.
	 * @param {ref}
	 */
	PosteffectsHandler.prototype._remove = function (ref) {
		var renderSystem = this.world.getSystem('RenderSystem');
		ArrayUtil.remove(renderSystem.composers, this._composer);

		delete this._objects[ref];

		if (this.world) {
			this._composer.destroy(this.world.gooRunner.renderer);
		}

		this._composer = new Composer();
	};

	/**
	 * Creates an empty array which will hold the posteffects/RenderPasses
	 * @returns {Entity}
	 * @private
	 */
	PosteffectsHandler.prototype._create = function () {
		return [];
	};

	/**
	 * Creates/updates/removes a posteffectconfig
	 * @param {string} ref
	 * @param {object|null} config
	 * @param {object} options
	 * @returns {RSVP.Promise} Resolves with the updated posteffectsarray or null if removed
	 */
	PosteffectsHandler.prototype._update = function (ref, config, options) {
		var that = this;
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (posteffects) {
			if (!posteffects) { return; }
//			var i = 0;
//			_.forEach(config.posteffects, function (effectConfig) {
//				posteffects[i++] = that._updateEffect(effectConfig, posteffects, options);
//			}, null, 'sortValue');
//			posteffects.length = i;
//			return RSVP.all(posteffects);
			var oldEffects = posteffects.slice();
			var promises = [];
			_.forEach(config.posteffects, function (effectConfig) {
				promises.push(that._updateEffect(effectConfig, oldEffects, options));
			}, null, 'sortValue');
			return RSVP.all(promises).then(function (effects) {
				for (var i = 0; i < effects.length; i++) {
					posteffects[i] = effects[i];
				}
				posteffects.length = i;
				/*
				for (var i = 0; i < oldEffects.length; i++) {
					var effect = oldEffects[i];
					if (posteffects.indexOf(effect) === -1) {
						// Destroy posteffect rendertargets
					}
				}
				*/
				return posteffects;
			});
		}).then(function (posteffects) {
			if (!posteffects) { return; }
			var enabled = posteffects.some(function (effect) { return effect.enabled; });
			var renderSystem = that.world.getSystem('RenderSystem');
			var composer = that._composer;
			// If there are any enabled, add them
			if (enabled) {
				composer.passes = [];
				composer.addPass(that._renderPass);
				for (var i = 0; i < posteffects.length; i++) {
					var posteffect = posteffects[i];
					if (posteffect && posteffect.enabled) {
						composer.addPass(posteffects[i], that.world.gooRunner.renderer);
					}
				}
				composer.addPass(that._outPass);
				if (renderSystem.composers.indexOf(composer) === -1) {
					renderSystem.composers.push(composer);
				}
			} else {
				// No posteffects, remove composer
				ArrayUtil.remove(renderSystem.composers, that._composer);
			}
			return posteffects;
		});
	};

	/**
	 * Finds the already created effect from the configs id or creates a new one and updates it
	 * according to config
	 * @param {object} config
	 * @param {RenderPass[]} array of engine posteffects/Renderpasses
	 * @returns {RenderPass} effect
	 */
	PosteffectsHandler.prototype._updateEffect = function (config, posteffects, options) {
		var that = this;
		function loadConfig(key, id) {
			return that._load(id, options).then(function (object) {
				config.options[key] = object;
			});
		}
		var effect;
		for (var i = 0; i < posteffects.length; i++) {
			if (posteffects[i].id === config.id) {
				effect = posteffects[i];
				break;
			}
		}
		if (!effect) {
			if (!PassLib[config.type]) {
				return null;
			}
			effect = new PassLib[config.type](config.id);
		}
		var promises = [];
		for (var i = 0; i < PassLib[config.type].options.length; i++) {
			var option = PassLib[config.type].options[i];
			var key = option.key;
			var type = option.type;
			if (type === 'texture') {
				if (config.options[key] && config.options[key].textureRef && config.options[key].enabled) {
					promises.push(loadConfig(key, config.options[key].textureRef));
				} else {
					config.options[key] = null;
				}
			} else if (type === 'entity') {
				if (config.options[key] && config.options[key].entityRef && config.options[key].enabled) {
					promises.push(loadConfig(key, config.options[key].entityRef));
				} else {
					config.options[key] = null;
				}
			}
		}
		return RSVP.all(promises).then(function () {
			effect.update(config);
			return effect;
		});
	};

	return PosteffectsHandler;
});