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

		this.sounds = [];
	}

	HowlerComponent.prototype = Object.create(Component.prototype);

	HowlerComponent.prototype.addSound = function(howl) {
		if(this.sounds.indexOf(howl) === -1) {
			this.sounds.push(howl);
		}
	};

	HowlerComponent.prototype.playSound = function(soundIdx, sprite, callback) {
		this.sounds[soundIdx].play(sprite, callback);
	};

	HowlerComponent.prototype.getSound = function(soundIdx) {
		return this.sounds[soundIdx];
	};

	return HowlerComponent;
});