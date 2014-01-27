define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/addons/howler/components/HowlerComponent',
	'goo/util/rsvp',
	'goo/util/PromiseUtil'
], function(
	ComponentHandler,
	HowlerComponent,
	RSVP,
	PromiseUtil
) {
	"use strict";

	function SoundComponentHandler() {
		ComponentHandler.apply(this, arguments);
		this._type = 'HowlerComponent';
	}

	SoundComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	SoundComponentHandler.prototype.constructor = SoundComponentHandler;
	ComponentHandler._registerClass('sound', SoundComponentHandler);


	SoundComponentHandler.prototype._create = function() {
		return new HowlerComponent();
	};

	SoundComponentHandler.prototype.update = function(entity, config, options) {
		if (!window.Howl) {
			throw new Error('Howler is missing');
		}
		var that = this;
		return ComponentHandler.prototype.update.call(this, entity, config, options).then(function(component) {
			for (var i = 0; i < component.sounds.length; i++) {
				component.sounds[i].stop();
			}
			var promises = [];
			for (var key in config.soundRefs) {
				promises.push(that._load(config.soundRefs[key], options));
			}
			return RSVP.all(promises).then(function(sounds) {
				component.sounds = sounds;
				return component;
			});
		});
	};

	return SoundComponentHandler;
});