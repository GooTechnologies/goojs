


	/**
	 * Bounds the host entity to a height map computed from a set of terrain points
	 * @param {Array<Number>} elevationData The array of height points given as a flat array
	 */
	function SparseHeightMapBoundingScript(elevationData) {
		this.elevationData = elevationData;
	}

	/**
	 * Returns the height of the closest terrain point to the given coordinates
	 * @param x
	 * @param z
	 * @returns {number} The height of the closest terrain point
	 */
	SparseHeightMapBoundingScript.prototype.getClosest = function (x, z) {
		var minDist = Number.MAX_VALUE;
		var minIndex = -1;
		for (var i = 0; i < this.elevationData.length; i += 3) {
			var dist =
				Math.pow(this.elevationData[i + 0] - x, 2) +
				Math.pow(this.elevationData[i + 2] - z, 2);
			if (dist < minDist) {
				minDist = dist;
				minIndex = i;
			}
		}
		return this.elevationData[minIndex + 1];
	};

	SparseHeightMapBoundingScript.prototype.run = function (entity) {
		var translation = entity.transformComponent.transform.translation;
		var closest = this.getClosest(translation.x, translation.z);
		var diff = translation.y - closest;
		translation.y -= diff * 0.1;
	};

	module.exports = SparseHeightMapBoundingScript;