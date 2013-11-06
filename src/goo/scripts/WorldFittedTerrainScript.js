define([
	'goo/scripts/HeightMapBoundingScript'
	],
	function(HeightMapBoundingScript) {
		"use strict";
	 /*
		var _defaults = {
			minX: 0,
			maxX: 100,
			minY: -25,
			maxY: 50,
			minZ: 0,
			maxZ: 100
		};
     */


		function validateTerrainProperties(properties) {
			if (properties.minX > properties.maxX) {
				throw { name: "Terrain Properties", message: "minX is larger than maxX" };
			}
			if (properties.minY > properties.maxY) {
				throw { name: "Terrain Properties", message: "minY is larger than maxY" };
			}
			if (properties.minZ > properties.maxZ) {
				throw { name: "Terrain Properties", message: "minZ is larger than maxZ" };
			}
			if (!properties.fileName) {
				throw { name: "Terrain Properties", message: "No heightmap data specified" };
			}
			return true;
		}



		function registerHeightData(fileName, dimensions, heightScripts) {
			var scriptContainer = {
				dimensions:dimensions
			};

			function heightDataReady() {
				heightScripts.push(scriptContainer);
			}

			validateTerrainProperties(dimensions);
			scriptContainer.script = new HeightMapBoundingScript(fileName, heightDataReady);
		}

		/**
		 * @class Creates and exposes a square heightmap terrain fitted within given world dimensions.
		 * @constructor
		 */

		function WorldFittedTerrainScript() {
			this.heightmapScripts = [];
		}

		/**
		 * @method Adds a block of height data from an image at given dimensions and stores the script in an array.
		 * @param (String) file to load height data from
		 * @param (Object) dimensions to fit the data within
		 */

		WorldFittedTerrainScript.prototype.addHeightData = function(fileName, dimensions) {
			if (!fileName) {
				throw { name: "Terrain Properties", message: "No heightmap data specified" };
			}
			registerHeightData(fileName, dimensions, this.heightmapScripts);
		};

		/**
		 * @method Returns the script relevant to a given position
		 * @param (Array) position data, typically use entity transform.data
		 * @returns (Object) container object with script and its world dimensions
		 */

		WorldFittedTerrainScript.prototype.getHeightScriptForPosition = function(pos) {
			for (var i = 0; i < this.heightmapScripts.length; i++) {
				var dim = this.heightmapScripts[i].dimensions;
				if (pos[0] < dim.maxX && pos[0] > dim.minX) {
					if (pos[1] < dim.maxY && pos[1] > dim.minY) {
						if (pos[2] < dim.maxY && pos[2] > dim.minY) {
							return this.heightmapScripts[i];
						}
					}
				}
			}
			return null;
		};

		/**
		 * @method Looks through height data and returns the distance to the ground from a given position
		 * @param (Array) pos Position as [x, y, z]
		 */

		WorldFittedTerrainScript.prototype.getHeightAboveGroundAtPos = function(pos) {
			var script = this.getHeightScriptForPosition(this.heightmapScripts, pos);
			var height = script.getAt(pos[0], pos[2]);
			return height;
		};

		return WorldFittedTerrainScript;

	});

