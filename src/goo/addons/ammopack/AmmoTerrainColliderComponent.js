define([
	'goo/entities/components/Component'
],
/** @lends */
function (
	Component
) {
	'use strict';

	function AmmoTerrainColliderComponent(settings) {
		this.type = 'AmmoColliderComponent';

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
		this.upAxis = 1;

		this.flipQuadEdges = typeof(settings.flipQuadEdges) === 'boolean' ? settings.flipQuadEdges : false;

		if (settings.heightMap) {
			this.setFromHeightMap(settings.heightMap);
		}
	}
	AmmoTerrainColliderComponent.prototype = Object.create(Component.prototype);
	AmmoTerrainColliderComponent.constructor = AmmoTerrainColliderComponent;

	AmmoTerrainColliderComponent.prototype.setFromHeightMap = function (heightMap) {
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

	AmmoTerrainColliderComponent.prototype.serialize = function () {
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

	return AmmoTerrainColliderComponent;
});
