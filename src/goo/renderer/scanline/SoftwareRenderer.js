define([
	'goo/renderer/Camera',
	'goo/renderer/scanline/Triangle',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/renderer/scanline/Edge'
	],
	/** @lends SoftwareRenderer */

	function (Camera, Triangle, Vector3, Vector4, Edge) {
	"use strict";


	function SoftwareRenderer(parameters) {
		parameters = parameters || {};

		this.width = parameters.width;
		this.height = parameters.height;

		this.numOfPixels = this.width * this.height;

		// Store the edges for a triangle 
		this.edges = new Array(3);

		var colorBytes = this.numOfPixels * 4 * Uint8Array.BYTES_PER_ELEMENT;
		var depthBytes = this.numOfPixels * Uint8Array.BYTES_PER_ELEMENT;

		this._frameBuffer = new ArrayBuffer(colorBytes + depthBytes);

		// The color data is used for debugging purposes.
		this._colorData = new Uint8Array(this._frameBuffer, 0, this.numOfPixels * 4);
		this._depthData = new Uint8Array(this._frameBuffer, colorBytes, this.numOfPixels); // TODO: Change to float / uint16 / ...

		this.testTriangles = [
			new Triangle(new Vector3(0.2, 0.1, 1.0), new Vector3(0.1, 0.4, 1.0), new Vector3(0.3, 0.3, 1.0)),
			new Triangle(new Vector3(0.5, 0.1, 1.0), new Vector3(0.4, 0.3, 1.0), new Vector3(0.6, 0.4, 1.0)),
			new Triangle(new Vector3(0.8, 0.1, 1.0), new Vector3(0.7, 0.4, 1.0), new Vector3(0.9, 0.4, 1.0)),
			new Triangle(new Vector3(0.1, 0.5, 1.0), new Vector3(0.1, 0.9, 1.0), new Vector3(0.3, 0.7, 1.0)),
			new Triangle(new Vector3(0.15, 0.5, 1.0), new Vector3(0.5, 0.55, 1.0), new Vector3(0.86, 0.5, 1.0)),
			new Triangle(new Vector3(0.7, 0.7, 1.0), new Vector3(0.9, 0.5, 1.0), new Vector3(0.9, 0.9, 1.0))
		];
	};

	SoftwareRenderer.prototype.render = function(renderList, camera) {

		var MVPMatrix = camera.getViewProjectionMatrix();
	
		if (Array.isArray(renderList)) {
			//this.renderQueue.sort(renderList, camera);

			for ( var i = 0; i < renderList.length; i++) {
				var renderable = renderList[i];
				console.log(renderable);
				//this.fillRenderInfo(renderable, renderInfo);
				//this.renderMesh(renderInfo);

				var posArray = renderable.meshDataComponent.meshData.attributeMap.POSITION.array;

				var triangles = [];


				for (var posIndex = 0; posIndex < posArray.length; posIndex++ ) {
					// Create triangle , transform it , render it.
					var v1 = new Vector3(posArray[posIndex], posArray[++posIndex], posArray[++posIndex]);
					var v2 = new Vector3(posArray[++posIndex], posArray[++posIndex], posArray[++posIndex]);
					var v3 = new Vector3(posArray[++posIndex], posArray[++posIndex], posArray[++posIndex]);
					var triangle = new Triangle(v1, v2, v3);

					triangle.transform(MVPMatrix);

					triangles.push(triangle);
				}

				console.log(triangles);
				
			}
		} else {
			//this.fillRenderInfo(renderList, renderInfo);
			//this.renderMesh(renderInfo);
		}

	};

	SoftwareRenderer.prototype.renderTestTriangles = function() {

		for ( var i = 0; i < this.testTriangles.length; i++) {
			this.renderTriangle(this.testTriangles[i].toPixelSpace(this.width, this.height));
		}
	};

	/*
	*	Takes a triangle with coordinates in pixel space, and draws it.
	*	@param {Triangle} triangle the triangle to draw.
	*/
	SoftwareRenderer.prototype.renderTriangle = function(triangle) {

		// http://joshbeam.com/articles/triangle_rasterization/

		// Create edges
		// The edge contsructor stores the greatest y value in the second position.
		this.edges = [
			new Edge(triangle.v1, triangle.v2),
			new Edge(triangle.v2, triangle.v3), 
			new Edge(triangle.v3, triangle.v1)
		];

		var maxHeight;
        var longEdge;

        // Find edge with the greatest height in the Y axis, this is the long edge.
        for(var i = 0; i < 3; i++) {
            var height = edges[i].y1 - edges[i].y0;
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
		// -The edges' coordinates are stored as uint8, so compare with a SMI (SMall Integer, 31-bit signed integer) and not Double.

        var shortEdgeDeltaY = (shortEdge.y1 - shortEdge.y0);
        if(shortEdgeDeltaY <= 0) {
            return; // Nothing to draw here.
        }

		var longEdgeDeltaY = (longEdge.y1 - longEdge.y0);

		// Checking the long edge will probably be unneccessary, since if the short edge has no height, then the long edge must defenetly hasnt either?
		// Shouldn't be possible for the long edge to be of height 0 if any of the short edges has height. 
		
        var longEdgeDeltaX = longEdge.x1 - longEdge.x0;
        var shortEdgeDeltaX = shortEdge.x1 - shortEdge.x0;

        // Vertical coherence : 
        // The x-coordinates' increment for each step in y is constant, 
        // so the increments are pre-calculated and added to the coordinates
        // each scanline.


        // The scanline on which we start rendering on might be in the middle of the long edge,
        // the starting x-coordinate is therefore calculated.
        var longStartCoeff = (shortEdge.y0 - longEdge.y0) / longEdgeDeltaY;
        var longX = longEdge.x0 + longEdgeDeltaX * longStartCoeff;
        var longEdge_Xincrement = longEdgeDeltaX / longEdgeDeltaY;

        var shortX = shortEdge.x0;
        var shortEdge_Xincrement = shortEdgeDeltaX / shortEdgeDeltaY;

        // TODO:
        // Implement this idea of checking which edge is the leftmost.
        // 1. Check if they start off at different positions, save the result and draw as usual
        // 2. If not, draw the first line and check again after this , the edges should now differ in x-coordinates. 
        //    Save the result and draw the rest of the scanlines.

        // Draw every line for which the short edge is present.
        var startIndex;
        var stopIndex;
        for (var y = shortEdge.y0; y <= shortEdge.y1; y++) {

        	// Round to the nearest pixel.
        	startIndex = Math.round(longX);
        	stopIndex = Math.round(shortX);

        	// Draw the span of pixels.
    		this.fillPixels(startIndex, stopIndex, y);
        	
  			// Increase the edges' x-coordinates with the increments.
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