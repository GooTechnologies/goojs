define([
	'goo/entities/components/Component'
],
/** @lends */
function(
	Component
) {
	"use strict";

	function HowlerComponent() {
		this.type = 'HowlerComponent';

		this.sounds = { };
	}

	HowlerComponent.prototype = Object.create(Component.prototype);

	HowlerComponent.prototype.addSound = function(soundName, howl) {
		this.sounds[soundName] = howl;
	};

	HowlerComponent.prototype.playSound = function(soundName, sprite, callback) {
		this.sounds[soundName].play(sprite, callback);
	};

	HowlerComponent.prototype.getSound = function(soundName) {
		return this.sounds[soundName];
	};

	return HowlerComponent;
});