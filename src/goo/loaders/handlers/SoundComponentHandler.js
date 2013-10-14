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
	'use strict';
	function SoundComponentHandler() {
		ComponentHandler.apply(this, arguments);
	}

	SoundComponentHandler.prototype = Object.create(ComponentHandler.prototype);
	ComponentHandler._registerClass('sound', SoundComponentHandler);
	SoundComponentHandler.prototype.contructor = SoundComponentHandler;

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
		if (component.sounds instanceof Object) {
			for (var key in component.sounds) {
				component.sounds.pause();
			}
			component.sounds = {};
		}
		var soundsMapping = config.soundsMapping;
		if (soundsMapping instanceof Object) {
			var promises = [];

			for (var key in soundsMapping) {
				promises.push(this._getSound(key, soundsMapping[key]));
			}
			return RSVP.all(promises).then(function(soundObjects) {
				for(var i = 0; i < soundObjects.length; i++) {
					component.sounds[soundObjects[i].key] = soundObjects[i].sound;
				}
				return component;
			});
		} else {
			return PromiseUtil.createDummyPromise(component);
		}
	};

	SoundComponentHandler.prototype._getSound = function(key, ref) {
		var that = this;
		return this.getConfig(ref).then(function(config) {
			return that.updateObject(ref, config, that.options);
		}).then(function(sound) {
			return {
				key: key,
				soundRef: ref,
				sound: sound
			};
		});
	};

	return SoundComponentHandler;
});