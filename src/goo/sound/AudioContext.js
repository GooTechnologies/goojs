define(function () {
	'use strict';

	// we presume there is support
	var supported = true;

	var AudioContext = window.AudioContext || window.webkitAudioContext;
	if (!AudioContext) {
		// warn once
		console.warn('WebAudio not supported');
		supported = false;
	}

	var context;

	return {
		getContext: function () {
			// try to get a context if it's supposedly supported or not cached
			if (!context && supported) {
				try {
					// even if window.AudioContext is available something might go wrong
					context = new AudioContext();
				} catch (e) {
					console.warn('WebAudio not supported');
					supported = false;
				}
			}
			return context;
		},
		isSupported: function () {
			return supported;
		}
	};
});