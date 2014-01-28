define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/addons/howler/components/HowlerComponent',
	'goo/util/rsvp'
], function(
	ComponentHandler,
	HowlerComponent,
	RSVP
) {
	"use strict";

	/*
	 * @class For handling loading of sound components
	 * @constructor
	 * @param {World} world The goo world
	 * @param {function} getConfig The config loader function. See {@see DynamicLoader._loadRef}.
	 * @param {function} updateObject The handler function. See {@see DynamicLoader.update}.
	 * @extends ComponentHandler
	 */
	function SoundComponentHandler() {
		ComponentHandler.apply(this, arguments);
		// TODO Make a sound component instead
		this._type = 'HowlerComponent';
	}

	SoundComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	SoundComponentHandler.prototype.constructor = SoundComponentHandler;
	ComponentHandler._registerClass('sound', SoundComponentHandler);


	/*
	 * Creates sound component
	 * @returns {HowlerComponent} Should be soundcomponent
	 * @private
	 */
	SoundComponentHandler.prototype._create = function() {
		// TODO Sound component
		return new HowlerComponent();
	};

	/**
	 * Update engine sound component object based on the config.
	 * @param {Entity} entity The entity on which this component should be added.
	 * @param {object} config
	 * @param {object} options
	 * @returns {RSVP.Promise} promise that resolves with the component when loading is done.
	 */
	SoundComponentHandler.prototype.update = function(entity, config, options) {
		if (!window.Howl) {
			throw new Error('Howler is missing');
		}
		var that = this;
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function(component) {
			// Stop all sounds
			for (var i = 0; i < component.sounds.length; i++) {
				component.sounds[i].stop();
			}
			var promises = [];
			// Load all sounds
			for (var key in config.soundRefs) {
				promises.push(that._load(config.soundRefs[key], options));
			}
			return RSVP.all(promises).then(function(sounds) {
				// Set updates sounds
				component.sounds = sounds;
				return component;
			});
		});
	};

	return SoundComponentHandler;
});