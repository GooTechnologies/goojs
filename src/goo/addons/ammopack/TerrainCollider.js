define([
	'goo/addons/ammopack/Collider',
	'goo/math/MathUtils'
],
/** @lends */
function (
	Collider,
	MathUtils
) {
	'use strict';

	/**
	 * @class
	 * @param {object} [settings]
	 * @param {array} [settings.heightMap] An array of arrays of number: 2D map of height data.
	 *
	 * @example
	 *     var collider = new TerrainCollider({
	 *         heightMap: [
	 *             [0, 0, 0, 0],
	 *             [0, 1, 1, 0],
	 *             [0, 1, 1, 0],
	 *             [0, 0, 0, 0],
	 *         ]
	 *     });
	 */
	function TerrainCollider(settings) {
		settings = settings || {};

		/**
		 * Height data.
		 * @type {Array}
		 */
		this.heights = [];

		this.width = 0;
		this.length = 0;
		this.numWidthPoints = 0;
		this.numLengthPoints = 0;
		this.heightScale = 1;
		this.minHeight = 0;
		this.maxHeight = 0;

		/**
		 * Up axis. 0=x, 1=y, 2=z
		 * @type {number}
		 */
		this.upAxis = typeof(settings.upAxis) === 'number' ? settings.upAxis : 1;

		this.flipQuadEdges = typeof(settings.flipQuadEdges) === 'boolean' ? settings.flipQuadEdges : false;

		if (settings.heightMap) {
			this.setFromHeightMap(settings.heightMap);
		}

		if (typeof settings.width !== 'undefined') {
			this.width = settings.width;
		}
		if (typeof settings.length !== 'undefined') {
			this.length = settings.length;
		}
	}
	TerrainCollider.prototype = Object.create(Collider.prototype);
	TerrainCollider.constructor = TerrainCollider;

	/**
	 * Set the height data from 2D heightmap data.
	 * @param {array} heightMap
	 */
	TerrainCollider.prototype.setFromHeightMap = function (heightMap) {
		var min = heightMap[0][0];
		var max = heightMap[0][0];
		this.heights.length = 0;
		for (var i = 0; i < heightMap.length; i++) {
			var row = heightMap[i];
			for (var j = 0; j < row.length; j++) {
				var height = row[j];
				this.heights.push(height);
				if (height > max) { max = height; }
				if (height < min) { min = height; }
			}
		}
		this.width = this.numWidthPoints = heightMap.length;
		this.length = this.numLengthPoints = heightMap[0].length;
		this.minHeight = min;
		this.maxHeight = max;
	};

	TerrainCollider.prototype.getHeightAt = function (x, y) {
		x = x * this.width;
		y = y * this.length;
		var x1 = Math.floor(x);
		var x2 = Math.ceil(x);
		var dx = x - x1;

		var y1 = Math.floor(y);
		var y2 = Math.ceil(y);
		var dy = y - y1;

		var idx;
		idx = y1 * this.length + x1;
		var bl = this.heights[idx];
		idx = y1 * this.length + x2;
		var br = this.heights[idx];
		idx = y2 * this.length + x1;
		var tl = this.heights[idx];
		idx = y2 * this.length + x2;
		var tr = this.heights[idx];
		return MathUtils.lerp(
			dy,
			MathUtils.lerp(dx, bl, br),
			MathUtils.lerp(dx, tl, tr)
		);
	};

	TerrainCollider.prototype.serialize = function () {
		return {
			type: 'terrain',
			heights: this.heights.slice(0),
			numWidthPoints: this.numWidthPoints,
			numLengthPoints: this.numLengthPoints,
			heightScale: this.heightScale,
			minHeight: this.minHeight,
			maxHeight: this.maxHeight,
			upAxis: this.upAxis,
			flipQuadEdges: this.flipQuadEdges,
			width: this.width,
			length: this.length
		};
	};

	return TerrainCollider;
});
