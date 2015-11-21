var Component = require('goo/entities/components/Component');

	'use strict';

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