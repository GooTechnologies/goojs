define([
	'goo/addons/ammopack/Collider'
],
/** @lends */
function (
	Collider
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
			length: this.length,
		};
	};

	return TerrainCollider;
});
