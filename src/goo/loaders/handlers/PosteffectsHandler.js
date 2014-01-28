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
	'goo/renderer/pass/PassLib'
], function(
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
	"use strict";

	/*
	 * @class Handler for loading posteffects into engine
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 */
	function PosteffectsHandler() {
		ConfigHandler.apply(this, arguments);
		this._composer = new Composer();
		var renderSystem = this.world.getSystem('RenderSystem');
		this._renderPass = new RenderPass(renderSystem.renderList),
		this._outPass = new FullscreenPass(Util.clone(ShaderLib.copy));
		this._outPass.renderToScreen = true;
	}


	PosteffectsHandler.prototype = Object.create(ConfigHandler.prototype);
	PosteffectsHandler.prototype.constructor = PosteffectsHandler;
	ConfigHandler._registerClass('posteffects', PosteffectsHandler);

	/*
	 * Removes the posteffects, i e removes the composer from rendersystem.
	 * @param {ref}
	 */
	PosteffectsHandler.prototype._remove = function(ref) {
		var renderSystem = this.world.getSystem('RenderSystem');
		ArrayUtil.remove(renderSystem.composers, this._composer);
		delete this._objects[ref];
	};

	/*
	 * Creates an empty array which will hold the posteffects/RenderPasses
	 * @returns {Entity}
	 * @private
	 */
	PosteffectsHandler.prototype._create = function() {
		return [];
	};

	/*
	 * Creates/updates/removes a posteffectconfig
	 * @param {string} ref
	 * @param {object|null} config
	 * @param {object} options
	 * @returns {RSVP.Promise} Resolves with the updated posteffectsarray or null if removed
	 */
	PosteffectsHandler.prototype.update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype.update.call(this, ref, config, options).then(function(posteffects) {
			var i = 0;
			_.forEach(config.posteffects, function(effectConfig) {
				posteffects[i++] = that._updateEffect(effectConfig, posteffects);
			}, 'sortValue');
			posteffects.length = i;
			return posteffects;
		}).then(function(posteffects) {
			var enabled = posteffects.some(function(effect) { return effect.enabled; });
			var renderSystem = that.world.getSystem('RenderSystem');
			var composer = that._composer;
			// If there are any enabled, add them
			if (enabled) {
				composer.passes = [];
				composer.addPass(that._renderPass);
				for(var i = 0; i < posteffects.length; i++) {
					var posteffect = posteffects[i];
					if (posteffect && posteffect.enabled) {
						composer.addPass(posteffects[i]);
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

	/*
	 * Finds the already created effect from the configs id or creates a new one and updates it
	 * according to config
	 * @param {object} config
	 * @param {RenderPass[]} array of engine posteffects/Renderpasses
	 * @returns {RenderPass} effect
	 */
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