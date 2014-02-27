define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/animation/state/SteadyState',
	'goo/animation/blendtree/ClipSource',
	'goo/animation/blendtree/ManagedTransformSource',
	'goo/animation/blendtree/BinaryLERPSource',
	'goo/animation/blendtree/FrozenClipSource',
	'goo/util/rsvp',
	'goo/util/PromiseUtil'
],
/** @lends */
function(
	ConfigHandler,
	SteadyState,
	ClipSource,
	ManagedTransformSource,
	BinaryLERPSource,
	FrozenClipSource,
	RSVP,
	PromiseUtil
) {
	"use strict";

	/**
	 * @class Handler for loading animation states into engine
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @extends ConfigHandler
	 * @private
	 */
	function AnimationStateHandler() {
		ConfigHandler.apply(this, arguments);
	}
	AnimationStateHandler.prototype = Object.create(ConfigHandler.prototype);
	AnimationStateHandler.prototype.constructor = AnimationStateHandler;
	ConfigHandler._registerClass('animstate', AnimationStateHandler);

	/**
	 * Creates an empty animation state
	 * @param {string} ref
	 * @returns {SteadyState}
	 * @private
	 */
	AnimationStateHandler.prototype._create = function(ref) {
		return this._objects[ref] = new SteadyState();
	};

	/**
	 * Adds/updates/removes an animation state
	 * @param {string} ref
	 * @param {object|null} config
	 * @param {object} options
	 * @returns {RSVP.Promise} Resolves with the updated animation state or null if removed
	 */
	AnimationStateHandler.prototype.update = function(ref, config, options) {
		var that = this;
		return ConfigHandler.prototype.update.call(this, ref, config, options).then(function(state) {
			if (!state) { return; }
			state._name = config.name;
			state.id = config.id;
			return that._parseClipSource(config.clipSource, state._sourceTree, options).then(function(source) {
				state._sourceTree = source;
				return state;
			});
		});
	};

	/**
	 * Updates or creates clipSource to put on animation state
	 * @param {object} config
	 * @param {ClipSource} [clipSource]
	 * @returns {RSVP.Promise} resolved with updated clip source
	 */
	AnimationStateHandler.prototype._parseClipSource = function(cfg, clipSource, options) {
		switch (cfg.type) {
			case 'Clip':
				return this.loadObject(cfg.clipRef, options).then(function(clip) {
					if(!clipSource || (!clipSource instanceof ClipSource)) {
						clipSource = new ClipSource(clip, cfg.filter, cfg.channels);
					} else {
						clipSource._clip = clip;
						clipSource.setFilter(cfg.filter, cfg.channels);
					}
					if (cfg.loopCount) {
						clipSource._clipInstance._loopCount = +cfg.loopCount;
					}
					if (cfg.timeScale) {
						clipSource._clipInstance._timeScale = cfg.timeScale;
					}

					return clipSource;
				});
			case 'Managed':
				if(!clipSource || (!clipSource instanceof ManagedTransformSource)) {
					clipSource = new ManagedTransformSource();
				}
				if (cfg.clipRef) {
					return this.loadObject(cfg.clipRef, options).then(function(clip) {
						clipSource.initFromClip(clip, cfg.filter, cfg.channels);
						return clipSource;
					});
				} else {
					return PromiseUtil.createDummyPromise(clipSource);
				}
				break;
			case 'Lerp':
				// TODO reuse object like the other parsers
				var promises = [
					this._parseClipSource(cfg.clipSourceA, null, options),
					this._parseClipSource(cfg.clipSourceB, null, options)
				];
				return RSVP.all(promises).then(function(clipSources) {
					clipSource = new BinaryLERPSource(clipSources[0], clipSources[1]);
					if (cfg.blendWeight) {
						clipSource.blendWeight = cfg.blendWeight;
					}
					return clipSource;
				});
			case 'Frozen':
				return this._parseClipSource(cfg.clipSource).then(function(subClipSource) {
					if (!clipSource || !(clipSource instanceof FrozenClipSource)) {
						clipSource = new FrozenClipSource(subClipSource, cfg.frozenTime || 0.0);
					} else {
						clipSource._source = subClipSource;
						clipSource._time = cfg.frozenTime || 0.0;
					}
					return clipSource;
				});
			default:
				console.error('Unable to parse clip source');
				return PromiseUtil.createDummyPromise();
		}
	};

	return AnimationStateHandler;
});