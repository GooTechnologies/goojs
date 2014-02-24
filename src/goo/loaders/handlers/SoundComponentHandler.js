define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/entities/components/SoundComponent',
	'goo/sound/AudioContext',
	'goo/util/rsvp'
],
/** @lends */
function(
	ComponentHandler,
	SoundComponent,
	AudioContext,
	RSVP
) {
	"use strict";

	/**
	 * @class For handling loading of sound components
	 * @constructor
	 * @param {World} world The goo world
	 * @param {function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 * @private
	 */
	function SoundComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'SoundComponent';
	}

	SoundComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	SoundComponentHandler.prototype.constructor = SoundComponentHandler;
	ComponentHandler._registerClass('sound', SoundComponentHandler);

	SoundComponentHandler.prototype._remove = function(entity) {
		var component = entity.howlerComponent;
		if (component && component.sounds) {
			var sounds = component.sounds;
			for (var i = 0; i < sounds.length; i++) {
				sounds[i].stop();
			}
		}
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
		var that = this;
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function(component) {
			if (!component) { return; }
			// Stop all sounds
			for (var i = 0; i < component.sounds.length; i++) {
				component.sounds[i].stop();
			}
			var promises = [];
			// Load all sounds
			for (var key in config.sounds) {
				promises.push(that._load(config.sounds[key].soundRef, options));
			}
			return RSVP.all(promises).then(function(sounds) {
				// Set updates sounds
				for (var i = 0; i < sounds.length; i++) {
					component.addSound(sounds[i]);
				}
				return component;
			});
		});
	};

	return SoundComponentHandler;
});