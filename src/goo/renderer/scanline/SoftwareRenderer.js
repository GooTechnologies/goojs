define([
	'goo/renderer/Camera',
	'goo/renderer/scanline/Triangle',
	'goo/math/Vector3',
	'goo/renderer/scanline/Edge'
	],
	/** @lends SoftwareRenderer */

	function (Camera, Triangle, Vector3, Edge) {
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


		this.testTriangles = [
			new Triangle(new Vector3(0.2, 0.1, 1.0), new Vector3(0.1, 0.4, 1.0), new Vector3(0.3, 0.3, 1.0)),
			new Triangle(new Vector3(0.5, 0.1, 1.0), new Vector3(0.4, 0.3, 1.0), new Vector3(0.6, 0.4, 1.0)),
			new Triangle(new Vector3(0.8, 0.1, 1.0), new Vector3(0.7, 0.4, 1.0), new Vector3(0.9, 0.4, 1.0)),
			new Triangle(new Vector3(0.1, 0.5, 1.0), new Vector3(0.1, 0.9, 1.0), new Vector3(0.3, 0.7, 1.0)),
			new Triangle(new Vector3(0.15, 0.5, 1.0), new Vector3(0.5, 0.55, 1.0), new Vector3(0.86, 0.5, 1.0)),
			new Triangle(new Vector3(0.7, 0.7, 1.0), new Vector3(0.9, 0.5, 1.0), new Vector3(0.9, 0.9, 1.0))
		];

		
	};

	SoftwareRenderer.prototype.renderTestTriangles = function() {

		for ( var i = 0; i < this.testTriangles.length; i++) {
			this.renderTriangle(this.testTriangles[i].toPixelSpace(this.width, this.height));
		}
	};

	/*
	*	Takes a triangle with coordinates in pixel space, and draws it.
	*/
	SoftwareRenderer.prototype.renderTriangle = function(triangle) {

		// http://joshbeam.com/articles/triangle_rasterization/

		// Create edges
		// The edge contsructor stores the greatest y value in the second position.

		var edges = [
			new Edge(triangle.v1, triangle.v2),
			new Edge(triangle.v2, triangle.v3), 
			new Edge(triangle.v3, triangle.v1)
			];

		var maxLength = 0;
        var longEdge = 0;

        // find edge with the greatest length in the y axis
        for(var i = 0; i < 3; i++) {
            var length = edges[i].y[1] - edges[i].y[0];
            if(length > maxLength) {
                    maxLength = length;
                    longEdge = i;
            }
        }
		
		// "Next, we get the indices of the shorter edges, using the modulo operator to make sure that we stay within the bounds of the array:"

        var shortEdge1 = (longEdge + 1) % 3;
        var shortEdge2 = (longEdge + 2) % 3;

        /*
        console.log("Long edge:", longEdge);
        console.log("shortEdge1", shortEdge1);
        console.log("shortEdge2", shortEdge2);
		*/

        this.drawEdges(edges[longEdge], edges[shortEdge1]);
        this.drawEdges(edges[longEdge], edges[shortEdge2]);
	};

	SoftwareRenderer.prototype.drawEdges = function(longEdge, e2) {

		// Early exit when any of the two edges lies in the horizontally.
		// -Faster with == or <= 0? 
		// -The edges' coordinates are stored as uint8, so compare with a SMI to prevent conversion? http://www.html5rocks.com/en/tutorials/speed/v8/
		var e1ydiff = (longEdge.y[1] - longEdge.y[0]);
        if(e1ydiff <= 0) {
        	return;
        }

        var e2ydiff = (e2.y[1] - e2.y[0]);
        if(e2ydiff <= 0) {
            return;
        }

        var e1xdiff = longEdge.x[1] - longEdge.x[0];
        var e2xdiff = e2.x[1] - e2.x[0];

         // calculate factors to use for interpolation
        // with the edges and the step values to increase
        // them by after drawing each span
        var factor1 = (e2.y[0] - longEdge.y[0]) / e1ydiff;
        var factorStep1 = 1.0 / e1ydiff;
        var factor2 = 0.0;
        var factorStep2 = 1.0 / e2ydiff;
       
        // When this function is called, the first edge given must be the long edge and the second edge given must be one of the short ones. 
        // We're going to loop from the minimum y value of the second edge to the maximum y value of the second edge to calculate spans, 
        // since every span within the boundaries of the short edge will also be within the boundaries of the long edge. 
        // factor2 starts at 0 and is increased by factorStep2 until it reaches a value of 1 towards the end of the loop. factor1, however, 
        // may start with a value greater than 0 (if the long edge's starting y value is lower than the short edge's) 
        // or may end up at a value lower than 1 (if the long edge's ending y value is greater than the short edge's).


        var startIndex = 0;
        var stopIndex = 0;

        for (var y = e2.y[0]; y <= e2.y[1]; y++) {

        	startIndex = Math.round(longEdge.x[0] + e1xdiff*factor1);
        	stopIndex = Math.round(e2.x[0] + e2xdiff*factor2);

    		this.fillPixels(startIndex, stopIndex, y);
        	
        	// increase factors
            factor1 += factorStep1;
            factor2 += factorStep2;
        }

	};

	SoftwareRenderer.prototype.fillPixels = function(startIndex, stopIndex, y) {

		// If the startindex is higher than the stopindex, they should be swapped.
		if ( startIndex > stopIndex ) {
			var temp = startIndex;
			startIndex = stopIndex;
			stopIndex = temp;
		}

		var row = y*this.width;

		for (var i = startIndex; i < stopIndex; i++) {
			this._depthData[row + i] = 255;
		}
	};

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
		// This was slower.
		
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