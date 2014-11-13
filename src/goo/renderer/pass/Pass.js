define([],
/** @lends */
function () {
	'use strict';

	/**
	 * @class
	 */
	function Pass_() {}

	var Pass = Pass_;

	Pass.prototype.destroy = function (/* renderer */) {
	};

	Pass.prototype.render = function (/* renderer, writeBuffer, readBuffer, delta, maskActive, camera, lights, clearColor */) {
	};

	Pass.prototype.updateSize = function (/* size, renderer */) {
	};

	return Pass;
});