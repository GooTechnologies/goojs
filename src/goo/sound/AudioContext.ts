var supported = true;

var AudioContext = typeof(window) !== 'undefined' && ((<any>window).AudioContext || (<any>window).webkitAudioContext);
if (!AudioContext) {
	// warn once
	console.warn('WebAudio not supported');
	supported = false;
}

var context;

/**
 * AudioContext is a global to check for support and instantiate an audio context. Should not be used as a constructor.
 * @target-class AudioContext AudioContext constructor
 * @require-pathvar AudioContext = require('../../sound/AudioContext');
 * @group sound
 * @example
 * if(AudioContext.isSupported()){
 *     var context = AudioContext.getContext();
 *     // ...operate on context...
 * }
 */
export = {
	getContext: function () {
		// try to get a context if it's supposedly supported or not cached
		if (!context && supported) {
			try {
				// even if window.AudioContext is available something might go wrong
				context = new AudioContext();
			} catch (e) {
				console.warn(e.message);
				supported = false;
			}
		}
		return context;
	},
	isSupported: function () {
		return supported;
	}
};
