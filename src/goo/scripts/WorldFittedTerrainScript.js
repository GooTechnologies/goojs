define([
	'goo/scripts/HeightMapBoundingScript',
    'goo/shapes/Surface',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/Material',
    'goo/entities/EntityUtils'
	],
	function(HeightMapBoundingScript,
             Surface,
             ShaderLib,
             Material,
             EntityUtils) {
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


        function buildSurfaceMesh(matrix, dimensions, id, gooWorld) {
            console.log(dimensions)
            var meshData = Surface.createFromHeightMap(matrix);
            var material = Material.createMaterial(ShaderLib.simpleLit, '');
            material.wireframe = true;
            var surfaceEntity = EntityUtils.createTypicalEntity(gooWorld, meshData, material, id);
            surfaceEntity.transformComponent.transform.scale.setd((dimensions.maxX-dimensions.minX)/(matrix.length-1), dimensions.maxY-dimensions.minY, (dimensions.maxZ-dimensions.minZ)/(matrix.length-1));
            surfaceEntity.transformComponent.transform.setRotationXYZ(0, 0, 0);
            surfaceEntity.transformComponent.transform.translation.setd(dimensions.minX, dimensions.minY, dimensions.minZ);
            surfaceEntity.transformComponent.setUpdated();
            surfaceEntity.addToWorld();
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

		WorldFittedTerrainScript.prototype.addHeightData = function(heightMatrix, dimensions, gooWorld) {
			this.heightMapData.push(registerHeightData(heightMatrix, dimensions, "terrain_mesh_"+this.heightMapData.length, gooWorld));
		};

        /**
         * Generates surface mesh entities from registered terrain data;
         * @param gooWorld the goo.world needed for creating typical entities downstream
         */

        WorldFittedTerrainScript.prototype.generateTerrainSurfaceMeshes = function(gooWorld) {
            console.log("beep", this.heightMapData)
            for (var i = 0; i < this.heightMapData.length; i++) {
                console.log("Build Mesh!")
                buildSurfaceMesh(this.heightMapData[i].script.matrixData, this.heightMapData[i].dimensions, "terrain_mesh_"+i, gooWorld)
            }
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
					if (pos[1] < dim.maxY+1 && pos[1] > dim.minY-1) {
						if (pos[2] <= dim.maxZ && pos[2] >= dim.minZ) {
							return this.heightMapData[i];
						}
					}
				}
			}
			return null;
		};

        /**
         * Adjusts coordinates to fit the dimensions of a registered heightMap.
         * @param axPos
         * @param axMin
         * @param axMax
         * @param quadCount
         * @return {Number}
         */

		WorldFittedTerrainScript.prototype.displaceAxisDimensions = function(axPos, axMin, axMax, quadCount) {
			var matrixPos = axPos-axMin;
			return quadCount*matrixPos/(axMax - axMin);
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

			var tx = this.displaceAxisDimensions(pos[0], dims.minX, dims.maxX, heightData.sideQuadCount);
			var tz = this.displaceAxisDimensions(pos[2], dims.minZ, dims.maxZ, heightData.sideQuadCount);
			var matrixHeight = heightData.script.getInterpolated(tx, tz);
			return matrixHeight*(dims.maxY - dims.minY) + dims.minY;
		};

        WorldFittedTerrainScript.prototype.run = function(entity) {
            var translation = entity.transformComponent.transform.translation;
            var groundHeight = this.getGroundHeightAtPos(translation.data);
            if (groundHeight) {
                translation.data[1] = groundHeight;
            }
        };


        return WorldFittedTerrainScript;

	});

