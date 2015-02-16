define([
	'goo/sound/AudioContext',
	'goo/math/MathUtils'
], function(
	AudioContext,
	MathUtils
) {
	'use strict';

	function OscillatorSound() {

		// Settings
		this.id = null;
		this._volume = 1.0;
		this._frequency = 440;
		this._type = 'sine';

		// Nodes
		this._outNode = AudioContext.getContext().createGain();

		this.connectTo();
	}

	OscillatorSound.prototype.stop = function() {
		this._oscNode.stop();
		this._oscNode = null;
	};

	OscillatorSound.prototype.play = function() {
		this._oscNode = AudioContext.getContext().createOscillator();
		this._oscNode.connect(this._outNode);
		this._oscNode.frequency.value = this._frequency;
		this._oscNode.type = this._type;

		this._oscNode.start();
	};

	OscillatorSound.prototype.update = function(config) {
		if (config.volume !== undefined) {
			this._volume = MathUtils.clamp(config.volume, 0, 1);
			this._outNode.gain.value = this._volume;
		}
		if (config.frequency !== undefined) {
			this._frequency = config.frequency;
			if (this._oscNode) {
				this._oscNode.frequency.value = this._frequency;
			}
		}
		if (config.type !== undefined && OscillatorSound.TYPES.indexOf(config.type) !== -1) {
			this._type = config.type;
			if (this._oscNode) {
				this._oscNode.type = this._type;
			}
		}
	};

	/**
	 * Connect output of sound to audionodes
	 * @param {AudioNode[]|AudioNode} nodes
	 */
	OscillatorSound.prototype.connectTo = function(nodes) {
		if (!AudioContext.isSupported()) {
			console.warn('WebAudio not supported');
			return;
		}
		this._outNode.disconnect();
		if (!nodes) {
			return;
		}
		if (!(nodes instanceof Array)) {
			nodes = [nodes];
		}
		for (var i = 0; i < nodes.length; i++) {
			this._outNode.connect(nodes[i]);
		}
	};

	OscillatorSound.TYPES = [
		'sine',
		'square',
		'sawtooth',
		'triangle',
		'custom'
	];

	return OscillatorSound;
});