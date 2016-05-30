var AudioContext = require('../sound/AudioContext');
import MathUtils = require('../math/MathUtils');

class OscillatorSound {
	id: any;
	_volume: any;
	_frequency: any;
	_type: any;
	_outNode: any;
	_oscNode: any;
	constructor() {
		// Settings
		this.id = null;
		this._volume = 1.0;
		this._frequency = 440;
		this._type = 'sine';

		// Nodes
		this._outNode = AudioContext.getContext().createGain();

		this.connectTo();
	}

	stop() {
		this._oscNode.stop();
		this._oscNode = null;
	};

	play() {
		this._oscNode = AudioContext.getContext().createOscillator();
		this._oscNode.connect(this._outNode);
		this._oscNode.frequency.value = this._frequency;
		this._oscNode.type = this._type;

		this._oscNode.start();
	};

	update(config) {
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
	 * @param {(Array<AudioNode> | AudioNode)} nodes
	 */
	connectTo(nodes?) {
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

	static TYPES = [
		'sine',
		'square',
		'sawtooth',
		'triangle',
		'custom'
	];
}

export = OscillatorSound;