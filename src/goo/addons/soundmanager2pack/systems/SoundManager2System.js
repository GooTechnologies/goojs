define([
	'goo/entities/systems/System'
], function (
	System
) {
	'use strict';

	/**
	 * Handles integration with Sound Manager 2
	 * @desc Depends on the global soundManager object.
	 * Load soundmanager2 with a script tag before using this system.
	 * @extends System
	 * @deprecated Deprecated since 0.10.x and scheduled for removal in 0.12.0
	 */
	function SoundManager2System(settings) {
		System.call(this, 'SoundManager2System', ['SoundManager2Component', 'TransformComponent']);

		settings = settings || {};

		this.isReady = false;
		if (!window.soundManager) {
			console.warn('SoundManager2System: soundManager global not found');
		} else {
			window.soundManager.bind(this).setup({
				url: 'swf',
				onready: function () {
					this.isReady = true;
				},
				ontimeout: function () {
					console.warn('Failed to load soundmanager');
				}
			});
		}
	}

	SoundManager2System.prototype = Object.create(System.prototype);

	SoundManager2System.prototype.inserted = function (entity) {
		var soundManagerComponent = entity.soundManager2Component;

		for (var i = 0; i < soundManagerComponent.sounds.length; i++) {
			var sound = soundManagerComponent.sounds[i];
			var soundObject = window.soundManager.createSound(sound);
			sound.soundObject = soundObject;
		}
	};

	SoundManager2System.prototype.deleted = function (/*entity*/) {
		//var soundManagerComponent = entity.soundManager2Component;

		// if (soundManagerComponent) {
			// this.world.remove(cannonComponent.body);
		// }
	};

	SoundManager2System.prototype.process = function (/*entities , tpf */) {
		/*for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			var soundManagerComponent = entity.soundManager2Component;

		}*/
	};

	return SoundManager2System;
});