define([
	'goo/math/Vector3',
	'goo/math/MathUtils'
],
	function(
		Vector3,
		MathUtils
		) {
		'use strict';

		var calcVec = new Vector3();

		var TerrainQuery = function(terrainSize, groundData, terrain) {
			this.terrainSize = terrainSize;
			this.groundData = groundData.ground.data;
			this.terrain = terrain;
			this.scale = terrain.dimensions.scale;
            this.actualSize = (this.terrainSize- 1)*this.scale;
			this.randomSeed = 1;
			this.updateTerrainInfo();
			this.setWaterLevel(0);
		};

		TerrainQuery.prototype.updateTerrainInfo = function() {
			this.terrainInfo = this.terrain.getTerrainData();
		};


		// get a height at point from matrix
		TerrainQuery.prototype.getPointInMatrix = function(y, x) {
			return this.matrixData[x][y];
		};

		// get the value at the precise integer (x, y) coordinates
		TerrainQuery.prototype.getAt = function(x, y) {
			return this.terrainInfo.heights[((this.terrainSize - y) * this.terrainSize) + x];
		};


        TerrainQuery.prototype.displaceAxisDimensions = function(axPos, axMin, axMax, quadCount) {
            var matrixPos = axPos-axMin;
            return quadCount*matrixPos/(axMax - axMin);
        };


        TerrainQuery.prototype.returnToWorldDimensions = function(axPos, axMin, axMax, quadCount) {
            var quadSize = (axMax-axMin) / quadCount;
            var insidePos = axPos * quadSize;
            return axMin+insidePos;
        };

		TerrainQuery.prototype.getTriangleAt = function(x, y) {

            //    x-=1;
            // y-=1;

			var xc = Math.ceil(x);
			var xf = Math.floor(x);
			var yc = Math.ceil(y);
			var yf = Math.floor(y);

			var fracX = x - xf;
			var fracY = y - yf;


			var p1  = {x:xf, y:yc, z:this.getAt(xf, yc)};
			var p2  = {x:xc, y:yf, z:this.getAt(xc, yf)};

			var p3;

			if (fracX < 1-fracY) {
				p3 = {x:xf, y:yf, z:this.getAt(xf, yf)};
			} else {
				p3 = {x:xc, y:yc, z:this.getAt(xc, yc)};
			}
			return [p1, p2, p3];
		};

		TerrainQuery.prototype.getPreciseHeight = function(x, y) {
			var tri = this.getTriangleAt(x, y);
			var find = MathUtils.barycentricInterpolation(tri[0], tri[1], tri[2], {x:x, y:y, z:0});
			return find.z;
		};

		TerrainQuery.prototype.getHeightAt = function(pos) {
			if (pos[0] < 0 || pos[0] > this.actualSize || pos[2] < 0 || pos[2] > this.actualSize) {
				return -1000;
			}

            var tx = this.displaceAxisDimensions(pos[0], 0, this.actualSize, this.terrainSize-1);
            var tz = this.displaceAxisDimensions(pos[2]+this.scale*0, 0, this.actualSize, this.terrainSize-1);

            return this.getPreciseHeight(tx, tz);
        };

        var calcVec1 = new Vector3();
        var calcVec2 = new Vector3();

		TerrainQuery.prototype.getNormalAt = function(pos) {
            var tx = this.displaceAxisDimensions(pos[0], 0, this.actualSize, this.terrainSize-1);
            var tz = this.displaceAxisDimensions(pos[2]+this.scale*0, 0, this.actualSize, this.terrainSize-1);

            var tri = this.getTriangleAt(tx, tz);
        /*
            for (var i = 0; i < tri.length; i++) {
                tri[i].x = tri[i].x*this.scale;
                tri[i].z = tri[i].z // *this.scale;
                tri[i].y = tri[i].y*this.scale;
            }
        */
            for (var i = 0; i < tri.length; i++) {
                tri[i].x = this.returnToWorldDimensions(tri[i].x, 0, this.actualSize, this.terrainSize-1);
            //    tri[i].z = this.returnToWorldDimensions(tri[i].z, dims.minY, dims.maxY, 1);
                tri[i].y = this.returnToWorldDimensions(tri[i].y-this.scale*0, 0, this.actualSize, this.terrainSize-1);
            }


            calcVec1.set((tri[1].x-tri[0].x), (tri[1].z-tri[0].z), (tri[1].y-tri[0].y));
            calcVec2.set((tri[2].x-tri[0].x), (tri[2].z-tri[0].z), (tri[2].y-tri[0].y));
            calcVec1.cross(calcVec2);
            if (calcVec1.data[1] < 0) {
                calcVec1.muld(-1, -1, -1);
            }

            calcVec1.normalize();
            return calcVec1;

			var x = pos[0] / this.scale;
			var z = this.terrainSize - (pos[2] / this.scale);

			var col = Math.floor(x);
			var row = Math.floor(z-1);

			var col1 = col + 1;
			var row1 = row + 1;

			col = MathUtils.moduloPositive(col, this.terrainSize);
			row = MathUtils.moduloPositive(row, this.terrainSize);
			col1 = MathUtils.moduloPositive(col1, this.terrainSize);
			row1 = MathUtils.moduloPositive(row1, this.terrainSize);

			var topLeft = this.terrainInfo.heights[row * this.terrainSize + col];
			var topRight = this.terrainInfo.heights[row * this.terrainSize + col1];
			var bottomLeft = this.terrainInfo.heights[row1 * this.terrainSize + col];

			return calcVec.setd((topLeft - topRight), this.scale, (bottomLeft - topLeft)).normalize();
		};

		TerrainQuery.prototype.setWaterLevel = function(level) {
			this.waterLevel = level;
		};

		TerrainQuery.prototype.getWaterPlants = function(yy, slope) {
			if (yy < -1) return;
			if (slope > 0.9) {
				return "reeds_2";
			}
			return;
		};

		TerrainQuery.prototype.randomFromSeed = function(seed) {
			MathUtils.randomSeed = seed+1;
			return (MathUtils.fastRandom()-0.21)*12;
		};

		TerrainQuery.prototype.getTypeFromGroundData = function(rand, xx, zz) {

			var index = (zz * this.terrainSize * this.terrain.splatMult + xx) * 4;
			var splat1 = this.terrainInfo.splat[index + 0] / 255.0;
			var splat2 = this.terrainInfo.splat[index + 1] / 255.0;
			var splat3 = this.terrainInfo.splat[index + 2] / 255.0;
			var splat4 = this.terrainInfo.splat[index + 3] / 255.0;
			var type = splat1 > rand ? this.groundData.ground2 : splat2 > rand ? this.groundData.ground3 : splat3 > rand ? this.groundData.ground4 : splat4 > rand ? this.groundData.ground5 : this.groundData.ground1;

			return type;
		};

		TerrainQuery.prototype.getVegetationType = function(xx, yy, zz, slope) {

			var rand = this.randomFromSeed(Math.sin(xx*99+yy*88+this.randomSeed));
			//		var	rand = Math.random()
			if (MathUtils.smoothstep(0.82, 0.91, slope) < 0.5+rand*0.5) {
				return null;
			}

			if (this.terrainInfo) {
				xx = Math.floor(xx / this.scale);
				zz = Math.floor(zz / this.scale);

				if (xx < 0 || xx > this.terrainSize - 1 || zz < 0 || zz > this.terrainSize - 1) {
					return null;
				}

				xx *= this.terrain.splatMult;
				zz *= this.terrain.splatMult;

				var type = this.getTypeFromGroundData(rand, xx, zz);

				var vegSource = type.vegetation;

				if (yy < this.waterLevel) {
					vegSource = type.waterPlants;
					if (!vegSource || slope < 0.7 || yy < -1) return null;
				}

				var test = 0;
				for (var veg in vegSource) {
					test += vegSource[veg];
					if (rand < test) {
						return veg;
					}
				}
				return null;
			}
			return null;
		};

		TerrainQuery.prototype.getForestType = function(xx, zz, slope, rand) {
			if (MathUtils.smoothstep(0.8, 0.88, slope) < rand) {
				return null;
			}

			if (this.terrainInfo) {
				xx = Math.floor(xx / this.scale);
				zz = Math.floor(zz / this.scale);

				if (xx < 0 || xx > this.terrainSize - 1 || zz < 0 || zz > this.terrainSize - 1) {
					return null;
				}

				xx *= this.terrain.splatMult;
				zz *= this.terrain.splatMult;


				var type = this.getTypeFromGroundData(rand, xx, zz);

				var test = 0;
				for (var veg in type.forest) {
					test += type.forest[veg];
					if (rand < test) {
						return veg;
					}
				}
				return null;
			}
			return null;
		};

		TerrainQuery.prototype.getLightAt = function(pos) {
			if (pos[0] < 0 || pos[0] > this.actualSize  || pos[2] < 0 || pos[2] > this.actualSize) {
                    return -1000;
			}

			if (!this.lightMapData || !this.lightMapSize)
				return 1;

			var x = pos[0] * this.lightMapSize / this.terrainSize;
			var z = (this.terrainSize - pos[2]) * this.lightMapSize / this.terrainSize;

			var col = Math.floor(x);
			var row = Math.floor(z);

			var intOnX = x - col;
			var intOnZ = z - row;

			var col1 = col + 1;
			var row1 = row + 1;

			col = MathUtils.moduloPositive(col, this.lightMapSize);
			row = MathUtils.moduloPositive(row, this.lightMapSize);
			col1 = MathUtils.moduloPositive(col1, this.lightMapSize);
			row1 = MathUtils.moduloPositive(row1, this.lightMapSize);

			var topLeft = this.lightMapData[row * this.lightMapSize + col];
			var topRight = this.lightMapData[row * this.lightMapSize + col1];
			var bottomLeft = this.lightMapData[row1 * this.lightMapSize + col];
			var bottomRight = this.lightMapData[row1 * this.lightMapSize + col1];

			return MathUtils.lerp(intOnZ, MathUtils.lerp(intOnX, topLeft, topRight),
				MathUtils.lerp(intOnX, bottomLeft, bottomRight)) / 255.0;
		};

		TerrainQuery.prototype.getType = function(xx, zz, slope, rand) {
			if (MathUtils.smoothstep(0.75, 0.88, slope) < rand) {
				return this.groundData.stone;
			}

			if (this.terrainInfo) {
				xx = Math.floor(xx);
				zz = Math.floor(zz);

				if (xx < 0 || xx > this.terrainSize - 1 || zz < 0 || zz > this.terrainSize - 1) {
					return this.groundData.stone;
				}

				xx *= this.terrain.splatMult;
				zz *= this.terrain.splatMult;


				var type = this.getTypeFromGroundData(rand, xx, zz);

				return type;
			}
			return this.groundData.stone;
		};

		return TerrainQuery;
	});