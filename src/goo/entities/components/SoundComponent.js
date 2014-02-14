define([
	'goo/entities/components/Component',
	'goo/sound/AudioContext',
	'goo/math/Vector3'
],
/** @lends */
function(
	Component,
	AudioContext,
	Vector3
) {
	'use strict';
	function SoundComponent() {
		this.type = "SoundComponent";
		this.sounds = [];
		this._outNode = AudioContext.createGain();
		this.connectTo();
		this._pannerNode = AudioContext.createPanner();

		this._pannerNode.connect(this._outNode);
		this._oldPosition = new Vector3();
		this._position = new Vector3();
		this._orientation = new Vector3();
		this._velocity = new Vector3();
	}
	SoundComponent.prototype = Object.create(Component.prototype);
	SoundComponent.prototype.constructor = SoundComponent;

	/**
	 * @param {Sound} sound
	 */
	SoundComponent.prototype.addSound = function(sound) {
		if (this.sounds.indexOf(sound) === -1) {
			sound.connectTo(this._pannerNode);
			this.sounds.push(sound);
		}
	};

	SoundComponent.prototype.removeSound = function(sound) {
		var idx = this.sounds.indexOf(sound);
		if (idx > -1) {
			this.sounds.splice(idx, 1);
			sound.connectTo();
		}
	};

	SoundComponent.prototype.connectTo = function(node) {
		this._outNode.disconnect();
		this._outNode.connect(node || AudioContext.destination);
	};

	SoundComponent.prototype.update = function(settings, transform, tpf) {
		this._pannerNode.rolloffFactor = settings.rolloffFactor;
		this._pannerNode.maxDistance = settings.maxDistance;

		var matrix = transform.matrix;
		matrix.getTranslation(this._position);
		this._velocity.setv(this._position).subv(this._oldPosition).div(tpf);
		this._oldPosition.setv(this._position);
		this._orientation.setd(0,0,-1);
		matrix.applyPostVector(this._orientation);

		var pd = this._position.data;
		this._pannerNode.setPosition(pd[0], pd[1], pd[2]);
		var vd = this._velocity.data;
		this._pannerNode.setVelocity(vd[0], vd[1], vd[2]);
		var od = this._orientation.data;
		this._pannerNode.setOrientation(od[0], od[1], od[2]);
	};

	return SoundComponent;
});