define([
	'js/world/Rectangle'
],
/** @lends */
function(
	Rectangle
) {
	"use strict";

	// function tmpExample() {
		// var atlasNode = new AtlasNode(lightmapSize, lightmapSize);

		// var rect = atlasNode.insert(xxx * lightmapDensity, yyy * lightmapDensity);
		// if (rect) {
		// 	rect = rect.localRectangle;
		// } else {
		// 	console.warn('Did not fit: ', du, dv);
		// 	rect = {
		// 		x: 0,
		// 		y: 0,
		// 		w: 2,
		// 		h: 2
		// 	};
		// }

		// var rectangles = atlasNode.getRectangles();
		// var canvasSize = 128;
		// var canvas = document.createElement('canvas');
		// canvas.style.position = 'absolute';
		// canvas.style.zIndex = 100;
		// canvas.style.left = '200px';
		// canvas.style.width = canvasSize + 'px';
		// canvas.style.height = canvasSize + 'px';
		// canvas.width = canvasSize;
		// canvas.height = canvasSize;
		// var ctx = canvas.getContext('2d');
		// ctx.fillStyle = "#cccccc";
		// ctx.fillRect(0, 0, canvasSize, canvasSize);
		// ctx.fillStyle = "#000000";
		// ctx.lineWidth = 1;
		// for (var i = 0; i < rectangles.length; i++) {
		// 	var rectangle = rectangles[i];
		// 	// ctx.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
		// 	ctx.strokeRect(
		// 		Math.floor(rectangle.x * canvasSize / lightmapSize) + 1.5,
		// 		Math.floor(rectangle.y * canvasSize / lightmapSize) + 1.5,
		// 		Math.floor(rectangle.w * canvasSize / lightmapSize) - 2,
		// 		Math.floor(rectangle.h * canvasSize / lightmapSize) - 2);
		// }
		// document.body.appendChild(canvas);
	// }

	function AtlasNode(w, h) {
		this.isLeaf = true;
		this.isSet = false;
		this.children = [];
		if (w !== undefined && h !== undefined) {
			this.localRectangle = new Rectangle(0, 0, w, h);
		} else {
			this.localRectangle = null;
		}
	}

	AtlasNode.prototype.getRectangles = function() {
		var rectangles = [];
		this._getRectangles(rectangles);
		return rectangles;
	};

	AtlasNode.prototype._getRectangles = function(list) {
		if (this.isSet) {
			list.push(this.localRectangle);
		}
		if (!this.isLeaf) {
			this.children[0]._getRectangles(list);
			this.children[1]._getRectangles(list);
		}
	};

	AtlasNode.prototype.insert = function(w, h) {
		return this._insert(new Rectangle(0, 0, w, h));
	};

	AtlasNode.prototype._insert = function(rectangle) {
		if (!this.isLeaf) {
			var newNode = this.children[0]._insert(rectangle);
			if (newNode !== null) {
				return newNode;
			}

			return this.children[1]._insert(rectangle);
		} else {
			if (this.isSet) {
				return null;
			}

			if (rectangle.w > this.localRectangle.w || rectangle.h > this.localRectangle.h) {
				return null;
			}

			if (rectangle.w === this.localRectangle.w && rectangle.h === this.localRectangle.h) {
				this.isSet = true;
				return this;
			}

			this.isLeaf = false;

			this.children[0] = new AtlasNode();
			this.children[1] = new AtlasNode();

			var dw = this.localRectangle.w - rectangle.w;
			var dh = this.localRectangle.h - rectangle.h;

			if (dw > dh) {
				this.children[0].localRectangle = new Rectangle(this.localRectangle.x, this.localRectangle.y, rectangle.w, this.localRectangle.h);
				this.children[1].localRectangle = new Rectangle(this.localRectangle.x + rectangle.w, this.localRectangle.y, dw, this.localRectangle.h);
			} else {
				this.children[0].localRectangle = new Rectangle(this.localRectangle.x, this.localRectangle.y, this.localRectangle.w, rectangle.h);
				this.children[1].localRectangle = new Rectangle(this.localRectangle.x, this.localRectangle.y + rectangle.h, this.localRectangle.w, dh);
			}

			return this.children[0]._insert(rectangle);
		}
	};

	return AtlasNode;
});