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

		var TerrainQuery = function(terrainSize, terrainData, terrain) {
			this.terrainSize = terrainSize;
			this.terrainData = terrainData;
			this.terrain = terrain;
			this.updateTerrainInfo();
			this.setWaterLevel(0);
		};



		TerrainQuery.prototype.updateTerrainInfo = function() {
			this.terrainInfo = this.terrain.getTerrainData();
		};

		TerrainQuery.prototype.getHeightAt = function(pos) {
			if (pos[0] < 0 || pos[0] > this.terrainSize - 1 || pos[2] < 0 || pos[2] > this.terrainSize - 1) {
				return -1000;
			}

			var x = pos[0];
			var z = this.terrainSize - pos[2];

			var col = Math.floor(x);
			var row = Math.floor(z);

			var intOnX = x - col,
				intOnZ = z - row;

			var col1 = col + 1;
			var row1 = row + 1;

			col = MathUtils.moduloPositive(col, this.terrainSize);
			row = MathUtils.moduloPositive(row, this.terrainSize);
			col1 = MathUtils.moduloPositive(col1, this.terrainSize);
			row1 = MathUtils.moduloPositive(row1, this.terrainSize);

			var topLeft = this.terrainInfo.heights[row * this.terrainSize + col];
			var topRight = this.terrainInfo.heights[row * this.terrainSize + col1];
			var bottomLeft = this.terrainInfo.heights[row1 * this.terrainSize + col];
			var bottomRight = this.terrainInfo.heights[row1 * this.terrainSize + col1];

			return MathUtils.lerp(intOnZ,
				MathUtils.lerp(intOnX, topLeft, topRight),
				MathUtils.lerp(intOnX, bottomLeft, bottomRight)
			);
		};

		TerrainQuery.prototype.getNormalAt = function(pos) {
			var x = pos[0];
			var z = this.terrainSize - pos[2];

			var col = Math.floor(x);
			var row = Math.floor(z);

			var col1 = col + 1;
			var row1 = row + 1;

			col = MathUtils.moduloPositive(col, this.terrainSize);
			row = MathUtils.moduloPositive(row, this.terrainSize);
			col1 = MathUtils.moduloPositive(col1, this.terrainSize);
			row1 = MathUtils.moduloPositive(row1, this.terrainSize);

			var topLeft = this.terrainInfo.heights[row * this.terrainSize + col];
			var topRight = this.terrainInfo.heights[row * this.terrainSize + col1];
			var bottomLeft = this.terrainInfo.heights[row1 * this.terrainSize + col];

			return calcVec.setd((topLeft - topRight), 1, (bottomLeft - topLeft)).normalize();
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

		TerrainQuery.prototype.getVegetationType = function(xx, yy, zz, slope) {


			if (yy < this.waterLevel) {
				return this.getWaterPlants(yy, slope)
			}
			var rand = Math.random();
			if (MathUtils.smoothstep(0.72, 0.81, slope) < 0.5+rand*0.5) {
				return null;
			}

			if (this.terrainInfo) {
				xx = Math.floor(xx);
				zz = Math.floor(zz);

				if (xx < 0 || xx > this.terrainSize - 1 || zz < 0 || zz > this.terrainSize - 1) {
					return null;
				}

				xx *= this.terrain.splatMult;
				zz *= this.terrain.splatMult;

				var index = (zz * this.terrainSize * this.terrain.splatMult + xx) * 4;
				var splat1 = this.terrainInfo.splat[index + 0] / 255.0;
				var splat2 = this.terrainInfo.splat[index + 1] / 255.0;
				var splat3 = this.terrainInfo.splat[index + 2] / 255.0;
				var splat4 = this.terrainInfo.splat[index + 3] / 255.0;
				var type = splat1 > rand ? this.terrainData.ground2 : splat2 > rand ? this.terrainData.ground3 : splat3 > rand ? this.terrainData.ground4 : splat4 > rand ? this.terrainData.ground5 : this.terrainData.ground1;

				var test = 0;
				for (var veg in type.vegetation) {
					test += type.vegetation[veg];
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
				xx = Math.floor(xx);
				zz = Math.floor(zz);

				if (xx < 0 || xx > this.terrainSize - 1 || zz < 0 || zz > this.terrainSize - 1) {
					return null;
				}

				xx *= this.terrain.splatMult;
				zz *= this.terrain.splatMult;

				var index = (zz * this.terrainSize * this.terrain.splatMult + xx) * 4;
				var splat1 = this.terrainInfo.splat[index + 0] / 255.0;
				var splat2 = this.terrainInfo.splat[index + 1] / 255.0;
				var splat3 = this.terrainInfo.splat[index + 2] / 255.0;
				var splat4 = this.terrainInfo.splat[index + 3] / 255.0;
				var type = splat1 > rand ? this.terrainData.ground2 : splat2 > rand ? this.terrainData.ground3 : splat3 > rand ? this.terrainData.ground4 : splat4 > rand ? this.terrainData.ground5 : this.terrainData.ground1;

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
			if (pos[0] < 0 || pos[0] > this.terrainSize - 1 || pos[2] < 0 || pos[2] > this.terrainSize - 1) {
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
			if (MathUtils.smoothstep(0.8, 0.88, slope) < rand) {
				return this.terrainData.stone;
			}

			if (this.terrainInfo) {
				xx = Math.floor(xx);
				zz = Math.floor(zz);

				if (xx < 0 || xx > this.terrainSize - 1 || zz < 0 || zz > this.terrainSize - 1) {
					return this.terrainData.stone;
				}

				xx *= this.terrain.splatMult;
				zz *= this.terrain.splatMult;

				var index = (zz * this.terrainSize * this.terrain.splatMult + xx) * 4;
				var splat1 = this.terrainInfo.splat[index + 0] / 255.0;
				var splat2 = this.terrainInfo.splat[index + 1] / 255.0;
				var splat3 = this.terrainInfo.splat[index + 2] / 255.0;
				var splat4 = this.terrainInfo.splat[index + 3] / 255.0;
				var type = splat1 > rand ? this.terrainData.ground2 : splat2 > rand ? this.terrainData.ground3 : splat3 > rand ? this.terrainData.ground4 : splat4 > rand ? this.terrainData.ground5 : this.terrainData.ground1;

				return type;
			}
			return this.terrainData.stone;
		};

		return TerrainQuery;
	});