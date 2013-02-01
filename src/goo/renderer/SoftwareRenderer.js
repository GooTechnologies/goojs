define([
	'goo/renderer/Camera',
	],
	/** @lends SoftwareRenderer */

	function (Camera) {
	"use strict";

	function SoftwareRenderer(parameters) {
		parameters = parameters || {};

		this.width = parameters.width;
		this.height = parameters.height;

		this.numOfPixels = this.width * this.height;

		this._colorData = new Uint8ClampedArray(this.numOfPixels * 4); // RGBA
		this._depthData = new Uint8ClampedArray(this.numOfPixels); // Change to float 
	}

	SoftwareRenderer.prototype.render = function() {

		for (var i = 0; i < this._depthData.length; i++) {
			this._depthData[i] = 0;
		};
	};

	SoftwareRenderer.prototype.fillColor = function(value) {
		
		for (var i = 0; i < this.colorData.length; i++) {

			this.colorData[i] = 0;
			this.colorData[++i] = 250;
			this.colorData[++i] = 0;
			this.colorData[++i] = 255;
		}
	};

	
	SoftwareRenderer.prototype.getColorData = function() {
		return this._colorData;
	};

	SoftwareRenderer.prototype.getDepthData = function() {

		return this._depthData;
	};

	return SoftwareRenderer;

});