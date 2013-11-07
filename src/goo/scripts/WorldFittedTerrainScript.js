define([
	'goo/scripts/HeightMapBoundingScript'
	],
	function(HeightMapBoundingScript) {
		"use strict";

		var _defaults = {
			minX: 0,
			maxX: 100,
			minY: 0,
			maxY: 50,
			minZ: 0,
			maxZ: 100
		};



		function validateTerrainProperties(properties, heightMatrix) {
			if (properties.minX > properties.maxX) {
				throw { name: "Terrain Properties", message: "minX is larger than maxX" };
			}
			if (properties.minY > properties.maxY) {
				throw { name: "Terrain Properties", message: "minY is larger than maxY" };
			}
			if (properties.minZ > properties.maxZ) {
				throw { name: "Terrain Properties", message: "minZ is larger than maxZ" };
			}
			if (!heightMatrix) {
				throw { name: "Terrain Properties", message: "No heightmap data specified" };
			}
			if (heightMatrix.length !== heightMatrix[0].length) {
				throw { name: "Terrain Properties", message: "Heightmap data is not a square" };
			}
			return true;
		}



		function registerHeightData(heightMatrix, dimensions) {
			dimensions = dimensions || _defaults;
			validateTerrainProperties(dimensions, heightMatrix);
			var scriptContainer = {
				dimensions:dimensions,
				sideQuadCount:heightMatrix.length-1,
				script: new HeightMapBoundingScript(heightMatrix)
			};
			return scriptContainer;
		}

		/**
		 * @class Creates and exposes a square heightmap terrain fitted within given world dimensions.
		 * @constructor
		 */

		function WorldFittedTerrainScript() {
			this.heightMapData = [];
		}

		/**
		 * @method Adds a block of height data from an image at given dimensions and stores the script in an array.
		 * @param (String) file to load height data from
		 * @param (Object) dimensions to fit the data within
		 */

		WorldFittedTerrainScript.prototype.addHeightData = function(heightMatrix, dimensions) {
			this.heightMapData.push(registerHeightData(heightMatrix, dimensions));
		};

		/**
		 * @method Returns the script relevant to a given position
		 * @param (Array) pos data, typically use entity transform.data
		 * @returns (Object) container object with script and its world dimensions
		 */

		WorldFittedTerrainScript.prototype.getHeightDataForPosition = function(pos) {
			for (var i = 0; i < this.heightMapData.length; i++) {
				var dim = this.heightMapData[i].dimensions;
				if (pos[0] <= dim.maxX && pos[0] >= dim.minX) {
					if (pos[1] <= dim.maxY && pos[1] >= dim.minY) {
						if (pos[2] <= dim.maxZ && pos[2] >= dim.minZ) {
							return this.heightMapData[i];
						}
					}
				}
			}
			return null;
		};

		/**
		 * @method Looks through height data and returns the elevation of the ground at a given position
		 * @param (Array) pos Position as [x, y, z]
		 * @returns (Float) height in units
		 */

		WorldFittedTerrainScript.prototype.getGroundHeightAtPos = function(pos) {
			var heightData = this.getHeightDataForPosition(pos);
			if (heightData === null) {
				return null;
			}
			var dims = heightData.dimensions;

			var tx = heightData.sideQuadCount*(pos[0] - dims.minX)/(dims.maxX - dims.minX);
			var tz = heightData.sideQuadCount*(pos[2] - dims.minZ)/(dims.maxZ - dims.minZ);
			return (heightData.script.getInterpolated(tx, tz) + dims.minY)*(dims.maxY - dims.minY);
		};

		return WorldFittedTerrainScript;

	});

