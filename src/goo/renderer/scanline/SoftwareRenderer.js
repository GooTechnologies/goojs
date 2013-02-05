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

		// Faster to allocate the edge array first?
		// var edges = new Array(3);
		var edges = [
			new Edge(triangle.v1, triangle.v2),
			new Edge(triangle.v2, triangle.v3), 
			new Edge(triangle.v3, triangle.v1)
		];

		var maxHeight = 0;
        var longEdge = 0;

        // Find edge with the greatest height in the Y axis, this is the long edge.
        for(var i = 0; i < 3; i++) {
            var height = edges[i].y[1] - edges[i].y[0];
            if(height > maxHeight) {
                    maxHeight = height;
                    longEdge = i;
            }
        }
		
		// "Next, we get the indices of the shorter edges, using the modulo operator to make sure that we stay within the bounds of the array:"
        var shortEdge1 = (longEdge + 1) % 3;
        var shortEdge2 = (longEdge + 2) % 3;

        this.drawEdges(edges[longEdge], edges[shortEdge1]);
        this.drawEdges(edges[longEdge], edges[shortEdge2]);
	};

	/*
	*	Render the pixels between the long and the short edge of the triangle.
	*/
	SoftwareRenderer.prototype.drawEdges = function(longEdge, shortEdge) {

		// Early exit when the short edge doesnt have any height (y-axis).
		// -Faster with == or <= 0? 
		// -The edges' coordinates are stored as uint8, so compare with a SMI to prevent conversion? http://www.html5rocks.com/en/tutorials/speed/v8/

        var shortEdge_dy = (shortEdge.y[1] - shortEdge.y[0]);
        if(shortEdge_dy <= 0) {
            return; // Nothing to draw here.
        }

		var longEdge_dy = (longEdge.y[1] - longEdge.y[0]);
		
		// Checking the long edge will probably be unneccessary, since if the short edge has no height, then the long edge must defenetly hasnt either?
		// Shouldn't be possible for the long edge to be of height 0 if any of the short edges has height. 
		// Might be premature to remove this check completely though.
        /*
        if(longEdge_dy <= 0) {
        	console.log("this shouldnt happn so often... or at all?");
        	return; // Nothing to draw here.
        }
        */
        
        var longEdge_dx = longEdge.x[1] - longEdge.x[0];
        var shortEdge_dx = shortEdge.x[1] - shortEdge.x[0];

        // Vertical coherence : 
        // The x-coordinates' increment for each step in y is constant, 
        // so the increments are pre-calculated and added to the coordinates
        // each scanline.


        // The scanline on which we start rendering on might be in the middle of the long edge,
        // the starting x-coordinate is therefore calculated.
        var longStartCoeff = (shortEdge.y[0] - longEdge.y[0]) / longEdge_dy;
        var longX = longEdge.x[0] + longEdge_dx*longStartCoeff;
        var longEdge_Xincrement = longEdge_dx/longEdge_dy;

        var shortX = shortEdge.x[0];
        var shortEdge_Xincrement = shortEdge_dx/shortEdge_dy;

 		var startIndex = 0;
        var stopIndex = 0;
        // Draw every line for which the short edge is present.
        for (var y = shortEdge.y[0]; y <= shortEdge.y[1]; y++) {

        	// Round to the nearest pixel.
        	startIndex = Math.round(longX);
        	stopIndex = Math.round(shortX);

        	// Draw the span of pixels.
    		this.fillPixels(startIndex, stopIndex, y);
        	
  			// Increase the edges' x-coordinate with the increments.
        	longX += longEdge_Xincrement;
        	shortX += shortEdge_Xincrement;
        }

	};

	SoftwareRenderer.prototype.fillPixels = function(startIndex, stopIndex, y) {

		// If the startindex is higher than the stopindex, they should be swapped.
		// This shall be optimized to be checked at an earlier stage.
		if ( startIndex > stopIndex ) {
			var temp = startIndex;
			startIndex = stopIndex;
			stopIndex = temp;
		}
		

		var row = y*this.width;

		for (var i = startIndex; i <= stopIndex; i++) {
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