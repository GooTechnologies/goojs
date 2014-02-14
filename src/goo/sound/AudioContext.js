define([
],
/* @lends */
function() {
	'use strict';
	try {
		var Context = window.AudioContext || window.webkitAudioContext;
		return new Context();
	} catch (e) {
		console.error ('Web audio not supported');
	}
});