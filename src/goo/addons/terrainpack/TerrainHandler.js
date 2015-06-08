define([
		'goo/addons/terrainpack/Terrain',
		'goo/addons/terrainpack/TerrainStatic',
		'goo/addons/terrainpack/Vegetation',
		'goo/addons/terrainpack/Forrest',
		'goo/math/Vector3',
		'goo/util/Ajax',
		'goo/math/Transform',
		'goo/math/MathUtils',
		'goo/renderer/Texture',
		'goo/renderer/TextureCreator',
		'goo/util/rsvp'
	],
	function (
		Terrain,
		TerrainStatic,
		Vegetation,
		Forrest,
		Vector3,
		Ajax,
		Transform,
		MathUtils,
		Texture,
		TextureCreator,
		RSVP
	) {
		'use strict';

		function TerrainHandler(goo, terrainSize, clipmapLevels, resourceFolder, useStatic) {
			this.goo = goo;
			this.terrainSize = terrainSize;
			this.resourceFolder = resourceFolder;
			if (useStatic) {
				this.terrain = new TerrainStatic(goo, terrainSize, clipmapLevels);
			} else {
				this.terrain = new Terrain(goo, terrainSize, clipmapLevels);
			}
			this.vegetation = new Vegetation();
			this.forrest = new Forrest();

			this.hidden = false;
			this.store = new Vector3();
			this.settings = null;
			this.pick = true;
			this.draw = false;
			this.eventX = 0;
			this.eventY = 0;
		}

		TerrainHandler.prototype.cleanup = function() {
			this.terrain.cleanup();
			this.terrain = null;
			this.vegetation.cleanup();
			this.vegetation = null;
			this.forrest.cleanup();
			this.forrest = null;

			this.terrainInfo = null;
			this.terrainQuery = null;
			this.lightMapData = null;
		};

		TerrainHandler.prototype.isEditing = function() {
			return !this.hidden;
		};

		TerrainHandler.prototype.getHeightAt = function(pos) {
			return this.terrainQuery ? this.terrainQuery.getHeightAt(pos) : 0;
		};

		var LMB = false;
		var altKey = false;

		var mousedown = function(e) {
			if (e.button === 0) {
				this.eventX = e.clientX;
				this.eventY = e.clientY;

				LMB = true;
				altKey = e.altKey;

				this.pick = true;
				this.draw = true;
			}
		};

		var mouseup = function(e) {
			if (e.button === 0) {
				LMB = false;
				this.draw = false;
			}
		};

		var mousemove = function(e) {
			this.eventX = e.clientX;
			this.eventY = e.clientY;

			this.pick = true;

			if (LMB) {
				altKey = e.altKey;
				this.draw = true;
			}
		};

		TerrainHandler.prototype.toggleEditMode = function() {
			this.terrain.toggleMarker();

			this.hidden = !this.hidden;

			if (this.hidden) {
				this.goo.renderer.domElement.addEventListener("mousedown", mousedown.bind(this), false);
				this.goo.renderer.domElement.addEventListener("mouseup", mouseup.bind(this), false);
				this.goo.renderer.domElement.addEventListener("mouseout", mouseup.bind(this), false);
				this.goo.renderer.domElement.addEventListener("mousemove", mousemove.bind(this), false);
			} else {
				this.goo.renderer.domElement.removeEventListener("mousedown", mousedown);
				this.goo.renderer.domElement.removeEventListener("mouseup", mouseup);
				this.goo.renderer.domElement.removeEventListener("mouseout", mouseup);
				this.goo.renderer.domElement.removeEventListener("mousemove", mousemove);
				this.terrainInfo = this.terrain.getTerrainData();
				this.draw = false;
				LMB = false;
			}

			this.forrest.toggle();
			this.vegetation.toggle();
		};

		TerrainHandler.prototype.initLevel = function(terrainData, settings, forrestLODEntityMap) {
			this.settings = settings;
			var terrainSize = this.terrainSize;

			var terrainPromise = this._loadData(terrainData.heightMap);
			var splatPromise = this._loadData(terrainData.splatMap);

			return RSVP.all([terrainPromise, splatPromise]).then(function(datas) {
				var terrainBuffer = datas[0];
				var splatBuffer = datas[1];

				var terrainArray;
				if (terrainBuffer) {
					var bits = terrainData.heightMapBits || 32;
					var scale = terrainData.heightMapScale || 1;
					if (bits === 32) {
						terrainArray = new Float32Array(terrainBuffer);
						if (scale !== 1) {
							for (var i = 0; i < terrainSize * terrainSize; i++) {
								terrainArray[i] = terrainArray[i] * scale;
							}
						}
					} else if (bits === 16) {
						var uintBuffer = new Uint16Array(terrainBuffer);
						terrainArray = new Float32Array(terrainSize * terrainSize);
						for (var i = 0; i < terrainSize * terrainSize; i++) {
							terrainArray[i] = uintBuffer[i] * scale / 64;
						}
					}
				} else {
					terrainArray = new Float32Array(terrainSize * terrainSize);
				}

				var splatArray;
				if (splatBuffer) {
					splatArray = new Uint8Array(splatBuffer);
				} else {
					splatArray = new Uint8Array(terrainSize * terrainSize * 4 * 4);
				}

				return this._load(terrainData, terrainArray, splatArray, forrestLODEntityMap);
			}.bind(this));
		};

		TerrainHandler.prototype._loadData = function(url) {
			var promise = new RSVP.Promise();

			var ajax = new Ajax();
			ajax.get({
				url: this.resourceFolder + url,
				responseType: 'arraybuffer'
			}).then(function(request) {
				promise.resolve(request.response);
			}.bind(this), function() {
				promise.resolve(null);
			}.bind(this));

			return promise;
		};

		TerrainHandler.prototype._textureLoad = function (url) {
			return new TextureCreator().loadTexture2D(url, {
				anisotropy: 4
			});
		};

		TerrainHandler.prototype._load = function(terrainData, parentMipmap, splatMap, forrestLODEntityMap) {
			// var promises = [];
			// promises.push(this._textureLoad(this.resourceFolder + terrainData.ground1.texture));
			// promises.push(this._textureLoad(this.resourceFolder + terrainData.ground2.texture));
			// promises.push(this._textureLoad(this.resourceFolder + terrainData.ground3.texture));
			// promises.push(this._textureLoad(this.resourceFolder + terrainData.ground4.texture));
			// promises.push(this._textureLoad(this.resourceFolder + terrainData.ground5.texture));
			// promises.push(this._textureLoad(this.resourceFolder + terrainData.stone.texture));
			// promises.push(this._textureLoad(this.resourceFolder + terrainData.lightMap));
			// promises.push(this._textureLoad(this.resourceFolder + terrainData.normalMap));
			// return RSVP.all(promises).then(function(textures) {
				// var terrainTextures = {
				// 	heightMap: parentMipmap,
				// 	splatMap: splatMap,
				// 	ground1: textures[0],
				// 	ground2: textures[1],
				// 	ground3: textures[2],
				// 	ground4: textures[3],
				// 	ground5: textures[4],
				// 	stone: textures[5],
				// 	lightMap: textures[6],
				// 	normalMap: textures[7]
				// };
				var terrainTextures = {
					heightMap: parentMipmap,
					splatMap: splatMap,
					ground1: terrainData.ground1.texture,
					ground2: terrainData.ground2.texture,
					ground3: terrainData.ground3.texture,
					ground4: terrainData.ground4.texture,
					ground5: terrainData.ground5.texture,
					stone: terrainData.stone.texture,
					lightMap: terrainData.lightMap,
					normalMap: terrainData.normalMap
				};
				this.terrain.init(terrainTextures);
				this.terrainInfo = this.terrain.getTerrainData();

				var terrainSize = this.terrainSize;
				var calcVec = new Vector3();

				var terrainQuery = this.terrainQuery = {
					getHeightAt: function(pos) {
						// if (pos[0] < 0 || pos[0] > terrainSize - 1 || pos[2] < 0 || pos[2] > terrainSize - 1) {
						// 	return -1000;
						// }

						var x = pos[0];
						var z = terrainSize - pos[2];

						var col = Math.floor(x);
						var row = Math.floor(z);

						var intOnX = x - col,
							intOnZ = z - row;

						var col1 = col + 1;
						var row1 = row + 1;

						col = MathUtils.moduloPositive(col, terrainSize);
						row = MathUtils.moduloPositive(row, terrainSize);
						col1 = MathUtils.moduloPositive(col1, terrainSize);
						row1 = MathUtils.moduloPositive(row1, terrainSize);

						var topLeft = this.terrainInfo.heights[row * terrainSize + col];
						var topRight = this.terrainInfo.heights[row * terrainSize + col1];
						var bottomLeft = this.terrainInfo.heights[row1 * terrainSize + col];
						var bottomRight = this.terrainInfo.heights[row1 * terrainSize + col1];

						return MathUtils.lerp(intOnZ, MathUtils.lerp(intOnX, topLeft, topRight),
							MathUtils.lerp(intOnX, bottomLeft, bottomRight));
					}.bind(this),
					getNormalAt: function(pos) {
						var x = pos[0];
						var z = terrainSize - pos[2];

						var col = Math.floor(x);
						var row = Math.floor(z);

						var col1 = col + 1;
						var row1 = row + 1;

						col = MathUtils.moduloPositive(col, terrainSize);
						row = MathUtils.moduloPositive(row, terrainSize);
						col1 = MathUtils.moduloPositive(col1, terrainSize);
						row1 = MathUtils.moduloPositive(row1, terrainSize);

						var topLeft = this.terrainInfo.heights[row * terrainSize + col];
						var topRight = this.terrainInfo.heights[row * terrainSize + col1];
						var bottomLeft = this.terrainInfo.heights[row1 * terrainSize + col];

						return calcVec.setDirect((topLeft - topRight), 1, (bottomLeft - topLeft)).normalize();
					}.bind(this),
					getVegetationType: function(xx, zz, slope) {
						var rand = MathUtils.fastRandom();
						if (MathUtils.smoothstep(0.82, 0.91, slope) < rand) {
							return null;
						}

						if (this.terrainInfo) {
							xx = Math.floor(xx);
							zz = Math.floor(zz);

							if (xx < 0 || xx > terrainSize - 1 || zz < 0 || zz > terrainSize - 1) {
								return null;
							}

							xx *= this.terrain.splatMult;
							zz *= this.terrain.splatMult;

							var index = (zz * terrainSize * this.terrain.splatMult + xx) * 4;
							var splat1 = this.terrainInfo.splat[index + 0] / 255.0;
							var splat2 = this.terrainInfo.splat[index + 1] / 255.0;
							var splat3 = this.terrainInfo.splat[index + 2] / 255.0;
							var splat4 = this.terrainInfo.splat[index + 3] / 255.0;
							var type = splat1 > rand ? terrainData.ground2 : splat2 > rand ? terrainData.ground3 : splat3 > rand ? terrainData.ground4 : splat4 > rand ? terrainData.ground5 : terrainData.ground1;

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
					}.bind(this),
					getForrestType: function(xx, zz, slope, rand) {
						if (MathUtils.smoothstep(0.8, 0.88, slope) < rand) {
							return null;
						}

						if (this.terrainInfo) {
							xx = Math.floor(xx);
							zz = Math.floor(zz);

							if (xx < 0 || xx > terrainSize - 1 || zz < 0 || zz > terrainSize - 1) {
								return null;
							}

							xx *= this.terrain.splatMult;
							zz *= this.terrain.splatMult;

							var index = (zz * terrainSize * this.terrain.splatMult + xx) * 4;
							var splat1 = this.terrainInfo.splat[index + 0] / 255.0;
							var splat2 = this.terrainInfo.splat[index + 1] / 255.0;
							var splat3 = this.terrainInfo.splat[index + 2] / 255.0;
							var splat4 = this.terrainInfo.splat[index + 3] / 255.0;
							var type = splat1 > rand ? terrainData.ground2 : splat2 > rand ? terrainData.ground3 : splat3 > rand ? terrainData.ground4 : splat4 > rand ? terrainData.ground5 : terrainData.ground1;

							var test = 0;
							for (var veg in type.forrest) {
								test += type.forrest[veg];
								if (rand < test) {
									return veg;
								}
							}
							return null;
						}
						return null;
					}.bind(this),
					getLightAt: function(pos) {
						if (pos[0] < 0 || pos[0] > terrainSize - 1 || pos[2] < 0 || pos[2] > terrainSize - 1) {
							return -1000;
						}

						if (!this.lightMapData || !this.lightMapSize) {
							return 1;
						}

						var x = pos[0] * this.lightMapSize / terrainSize;
						var z = (terrainSize - pos[2]) * this.lightMapSize / terrainSize;

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
					}.bind(this),

					getType: function(xx, zz, slope, rand) {
						if (MathUtils.smoothstep(0.8, 0.88, slope) < rand) {
							return terrainData.stone;
						}

						if (this.terrainInfo) {
							xx = Math.floor(xx);
							zz = Math.floor(zz);

							if (xx < 0 || xx > terrainSize - 1 || zz < 0 || zz > terrainSize - 1) {
								return terrainData.stone;
							}

							xx *= this.terrain.splatMult;
							zz *= this.terrain.splatMult;

							var index = (zz * terrainSize * this.terrain.splatMult + xx) * 4;
							var splat1 = this.terrainInfo.splat[index + 0] / 255.0;
							var splat2 = this.terrainInfo.splat[index + 1] / 255.0;
							var splat3 = this.terrainInfo.splat[index + 2] / 255.0;
							var splat4 = this.terrainInfo.splat[index + 3] / 255.0;
							var type = splat1 > rand ? terrainData.ground2 : splat2 > rand ? terrainData.ground3 : splat3 > rand ? terrainData.ground4 : splat4 > rand ? terrainData.ground5 : terrainData.ground1;

							return type;
						}
						return terrainData.stone;
					}.bind(this)
				};

				return new TextureCreator().loadTexture2D(this.resourceFolder + terrainData.vegetationAtlas).then(function (vegetationAtlasTexture) {
					vegetationAtlasTexture.anisotropy = 4;
					return new TextureCreator().loadTexture2D(this.resourceFolder + terrainData.forrestAtlas).then(function (forrestAtlasTexture) {
						forrestAtlasTexture.anisotropy = 4;
						return new TextureCreator().loadTexture2D(this.resourceFolder + terrainData.forrestAtlasNormals).then(function (forrestAtlasNormals) {
							this.vegetation.init(this.goo.world, terrainQuery, vegetationAtlasTexture, terrainData, terrainTextures);
							this.forrest.init(this.goo.world, terrainQuery, forrestAtlasTexture, forrestAtlasNormals, terrainData, forrestLODEntityMap, terrainTextures);
						}.bind(this));
					}.bind(this));
				}.bind(this));
			// }.bind(this));
		};

		TerrainHandler.prototype.updatePhysics = function() {
			this.terrain.updateAmmoBody();
		};

		TerrainHandler.prototype.initPhysics = function() {
			this.ammoBody = this.terrain.initAmmoBody();
		};

		TerrainHandler.prototype.useLightmap = function (data, size) {
			if (data) {
				var lightMap = new Texture(data, {
					magFilter: 'Bilinear',
					minFilter: 'NearestNeighborNoMipMaps',
					wrapS: 'EdgeClamp',
					wrapT: 'EdgeClamp',
					generateMipmaps: false,
					format: 'Luminance',
					type: 'UnsignedByte'
				}, size, size);

				this.lightMapData = data;
				this.lightMapSize = size;
				this.terrain.setLightmapTexture(lightMap);
			} else {
				delete this.lightMapData;
				delete this.lightMapSize;
				this.terrain.setLightmapTexture();
			}
		};

		TerrainHandler.prototype.update = function(cameraEntity) {
			var pos = cameraEntity.cameraComponent.camera.translation;

			if (this.terrain) {
				var settings = this.settings;

				if (this.hidden && this.pick) {
					this.terrain.pick(cameraEntity.cameraComponent.camera, this.eventX, this.eventY, this.store);
					this.terrain.setMarker('add', settings.size, this.store.x, this.store.z, settings.power, settings.brushTexture);
					this.pick = false;
				}

				if (this.hidden && this.draw) {
					var type = 'add';
					if (altKey) {
						type = 'sub';
					}

					var rgba = [0, 0, 0, 0];
					if (settings.rgba === 'ground2') {
						rgba = [1, 0, 0, 0];
					} else if (settings.rgba === 'ground3') {
						rgba = [0, 1, 0, 0];
					} else if (settings.rgba === 'ground4') {
						rgba = [0, 0, 1, 0];
					} else if (settings.rgba === 'ground5') {
						rgba = [0, 0, 0, 1];
					}

					this.terrain.draw(settings.mode, type, settings.size, this.store.x, this.store.y, this.store.z,
						settings.power * this.goo.world.tpf * 60 / 100, settings.brushTexture, rgba);
					this.terrain.updateTextures();
				}

				this.terrain.update(pos);
			}
			if (this.vegetation) {
				this.vegetation.update(pos.x, pos.z);
			}
			if (this.forrest) {
				this.forrest.update(pos.x, pos.z);
			}
		};

		return TerrainHandler;
	});