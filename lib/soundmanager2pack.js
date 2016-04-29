/* Goo Engine UNOFFICIAL
 * Copyright 2016 Goo Technologies AB
 */

webpackJsonp([18],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(499);


/***/ },

/***/ 499:
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
		SoundManager2Component: __webpack_require__(500),
		SoundManager2System: __webpack_require__(501)
	};

	if (typeof(window) !== 'undefined') {
		for (var key in module.exports) {
			window.goo[key] = module.exports[key];
		}
	}

/***/ },

/***/ 500:
/***/ function(module, exports, __webpack_require__) {

	var Component = __webpack_require__(20);

	/**
	 * @extends Component
	 * @deprecated Deprecated since 0.10.x and scheduled for removal in 0.12.0
	 */
	function SoundManager2Component(settings) {
		this.type = 'SoundManager2Component';

		this.settings = settings || {};

		// this.mass = settings.mass !== undefined ? settings.mass : 0;

		this.sounds = {};
	}

	SoundManager2Component.prototype = Object.create(Component.prototype);

	SoundManager2Component.prototype.addSound = function (soundName, settings) {
		this.sounds[soundName] = settings;
	};

	SoundManager2Component.prototype.playSound = function (soundName) {
		this.sounds[soundName].soundObject.play();
	};

	module.exports = SoundManager2Component;

/***/ },

/***/ 501:
/***/ function(module, exports, __webpack_require__) {

	var System = __webpack_require__(42);

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

	module.exports = SoundManager2System;

/***/ }

});
