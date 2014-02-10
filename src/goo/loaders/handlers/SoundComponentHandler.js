define([
	'goo/loaders/handlers/ComponentHandler',
	'goo/addons/howler/components/HowlerComponent',
	'goo/util/rsvp',
	'goo/util/PromiseUtil'
],
/** @lends */
function(
	ComponentHandler,
	HowlerComponent,
	RSVP,
	PromiseUtil
) {
	"use strict";

	/**
	* @class
	*/
	function SoundComponentHandler() {
		ComponentHandler.apply(this, arguments);
	}

	SoundComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ComponentHandler._registerClass('sound', SoundComponentHandler);
	SoundComponentHandler._type = 'howler';
	SoundComponentHandler.prototype.constructor = SoundComponentHandler;

	SoundComponentHandler.prototype._create = function(entity) {
		var component = new HowlerComponent();
		entity.setComponent(component);
		return component;
	};

	SoundComponentHandler.prototype.update = function(entity, config) {
		if (!window.Howl) {
			throw new Error('Howler is missing');
		}
		var component = ComponentHandler.prototype.update.call(this, entity, config);
		for (var i = 0; i < component.sounds.length; i++) {
			component.sounds[i].stop();
		}
		component.sounds = [];

		var soundRefs = config.soundRefs;
		if (soundRefs) {
			var promises = [];

			for (var i = 0; i < soundRefs.length; i++) {
				promises.push(this._getSound(soundRefs[i]));
			}
			return RSVP.all(promises).then(function(sounds) {
				component.sounds = sounds;
				return component;
			});
		} else {
			return PromiseUtil.createDummyPromise(component);
		}
	};

	SoundComponentHandler.prototype._getSound = function(ref) {
		var that = this;
		return this.getConfig(ref).then(function(config) {
			return that.updateObject(ref, config);
		});
	};

	return SoundComponentHandler;
});