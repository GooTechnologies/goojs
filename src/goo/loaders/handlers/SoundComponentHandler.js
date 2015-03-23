define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/SoundComponent',
	'goo/sound/AudioContext',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
], function (
	ComponentHandler,
	SoundComponent,
	AudioContext,
	RSVP,
	PromiseUtil,
	_
) {
	'use strict';

	/**
	 * For handling loading of sound components
	 * @param {World} world The goo world
	 * @param {function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 * @hidden
	 */
	function SoundComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'SoundComponent';
	}

	SoundComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	SoundComponentHandler.prototype.constructor = SoundComponentHandler;
	ComponentHandler._registerClass('sound', SoundComponentHandler);

	/**
	 * Removes the souncomponent and stops all connected sounds
	 * @param {Entity} entity
	 * @private
	 */
	SoundComponentHandler.prototype._remove = function(entity) {
		var component = entity.soundComponent;
		if (component && component.sounds) {
			var sounds = component.sounds;
			for (var i = 0; i < sounds.length; i++) {
				sounds[i].stop();
			}
		}
	};

	/**
	 * Prepares the config
	 * @param {object} config
	 */
	SoundComponentHandler.prototype._prepare = function(config) {
		_.defaults(config, {
			volume: 1.0,
			reverb: 0.0
		});
	};

	/**
	 * Creates sound component
	 * @returns {SoundComponent} Should be soundcomponent
	 * @private
	 */
	SoundComponentHandler.prototype._create = function() {
		return new SoundComponent();
	};

	/**
	 * Update engine sound component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	SoundComponentHandler.prototype.update = function(entity, config, options) {
		if (!AudioContext.isSupported()) {
			return PromiseUtil.resolve(); //! AT: we're not really using reject
		}

		var that = this;
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function(component) {
			if (!component) { return; }
			component.updateConfig(config);

			// Remove old sounds
			for (var i = 0; i < component.sounds.length; i++) {
				var sound = component.sounds[i];
				if (!config.sounds[sound.id]) {
					component.removeSound(sound);
				}
			}

			var promises = [];
			// Load all sounds
			_.forEach(config.sounds, function(soundCfg) {
				promises.push(that._load(soundCfg.soundRef, options));
			}, null, 'sortValue');

			return RSVP.all(promises).then(function(sounds) {
				// Add new sounds
				for (var i = 0; i < sounds.length; i++) {
					if (component.sounds.indexOf(sounds[i]) === -1) {
						component.addSound(sounds[i]);
					}
				}
				return component;
			});
		});
	};

	return SoundComponentHandler;
});