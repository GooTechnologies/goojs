define([
	'goo/entities/components/Component'
],
/** @lends */
function(
	Component
) {
	"use strict";

	/**
	* @class
	* @deprecated Deprecated since 0.9.0 and scheduled for removal in 0.11.0
	* @extends Component
	*/
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

	HowlerComponent.prototype.playSound = function(soundIndex, sprite, callback) {
		this.sounds[soundIndex].play(sprite, callback);
	};

	HowlerComponent.prototype.getSound = function(soundIndex) {
		return this.sounds[soundIndex];
	};

	return HowlerComponent;
});