define([
	'goo/renderer/Camera',
	'goo/renderer/scanline/Triangle',
	'goo/renderer/scanline/EdgeRecord',
	'goo/renderer/scanline/EdgeTable',
	'goo/renderer/scanline/ActiveEdgeTable'
	],
	/** @lends SoftwareRenderer */

	function (Camera, Triangle, EdgeRecord, EdgeTable, ActiveEdgeTable) {
	"use strict";

	function SoftwareRenderer(parameters) {
		parameters = parameters || {};

		this.width = parameters.width;
		this.height = parameters.height;

		this.numOfPixels = this.width * this.height;

		var colorBytes = this.numOfPixels * 4 * Uint8Array.BYTES_PER_ELEMENT;
		var depthBytes = this.numOfPixels * Uint8Array.BYTES_PER_ELEMENT;

		this._frameBuffer = new ArrayBuffer(colorBytes + depthBytes);
		this._colorData = new Uint8Array(this._frameBuffer, 0, this.numOfPixels * 4); // RGBA
		this._depthData = new Uint8Array(this._frameBuffer, colorBytes, this.numOfPixels); // Change to float / uint16 / ...
	}

	SoftwareRenderer.prototype.renderDepth = function() {

		// For each scanline ( each row in the image ).
		var gradientValue;
		var lineData = new Uint8Array(this.width);
		var offset = 0;
		var offsetStep = this.width;
		for ( var scanline = 0; scanline < this.height; scanline++)
		{	
			gradientValue = scanline / this.height * 255;
			this.fillArrayWithValue(lineData, gradientValue);
			this._depthData.set(lineData, offset);
			offset += offsetStep;
		}
		/*

		https://developer.mozilla.org/en-US/docs/HTML/Canvas/Pixel_manipulation_with_canvas

		For example, to read the blue component's value from the pixel at column 200, row 50 in the image, you would do the following:
		blueComponent = imageData.data[((50*(imageData.width*4)) + (200*4)) + 2];

		*/
	};

	SoftwareRenderer.prototype.fillArrayWithValue = function(array, value) {
		for ( var i = 0; i < array.length; i++ ) {
			array[i] = value;
		}
	};

	SoftwareRenderer.prototype.fillColor = function(value) {
		
		for (var i = 0; i < this.colorData.length; i++) {

			this._colorData[i] = 0;
			this._colorData[++i] = 250;
			this._colorData[++i] = 0;
			this._colorData[++i] = 255;
		}
	};


	SoftwareRenderer.prototype.copyDepthToColor = function() {

		var colorIndex = 0;
		var depth;
		
		for( var i = 0; i < this._depthData.length; i++) {

			var depth = this._depthData[i];
			this._colorData[colorIndex] = depth;
			this._colorData[++colorIndex] = depth;
			this._colorData[++colorIndex] = depth;
			this._colorData[++colorIndex] = 255;
			colorIndex++;
		}
		

		/*
		var depthLine = new Uint8Array(this.width);
		var colorLine = new Uint8Array(this.width * 4);
		var start;
		var end;
		var width = this.width;
		for ( var scanline = 0; scanline < this.height; scanline++)
		{
			// fetch one line from the depthdata
			start = scanline * width;
			end = start+width;
			depthLine = this._depthData.subarray(start, end);
			
			// Convert the line to RGBA
			for (var i = 0; i < depthLine.length; i++) {
				depth = depthLine[i];
				colorLine.set([depth, depth, depth, 255], (i*4));
			}

			this._colorData.set(colorLine, start*4);
		}
		*/
	};

	
	SoftwareRenderer.prototype.getColorData = function() {
		return this._colorData;
	};

	SoftwareRenderer.prototype.getDepthData = function() {

		return this._depthData;
	};

	return SoftwareRenderer;

});