define([], function () {
	'use strict';

	try {
		var Context = window.AudioContext || window.webkitAudioContext;
		return new Context();
	} catch (e) {
		console.warn('Web audio not supported');
	}
});