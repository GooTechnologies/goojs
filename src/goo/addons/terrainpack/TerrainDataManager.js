define([
	'goo/addons/terrainpack/Terrain',
	'goo/addons/terrainpack/Vegetation',
	'goo/addons/terrainpack/Forest',
	'goo/math/Vector3',
	'goo/util/Ajax',
	'goo/math/Transform',
	'goo/math/MathUtils',
	'goo/renderer/Texture',
	'goo/renderer/TextureCreator',
	'goo/util/rsvp'
],
	function(
		Terrain,
		Vegetation,
		Forest,
		Vector3,
		Ajax,
		Transform,
		MathUtils,
		Texture,
		TextureCreator,
		RSVP
		) {
		'use strict';

		function TerrainDataManager() {

		}


		TerrainDataManager.prototype.setResourceFolder = function (folder) {
			this.resourceFolder = folder;
		};

		TerrainDataManager.prototype.decodeBase64 = function (base64string) {
				var binary_string = window.atob(base64string);
				var len = binary_string.length;
				var bytes = new Uint8Array( len );
				for (var i = 0; i < len; i++)        {
					bytes[i] = binary_string.charCodeAt(i);
				}
				return bytes.buffer;
		};

		TerrainDataManager.prototype.loadProjectData = function (path) {

			if (path) this.setResourceFolder(path);

			var checkForJson = function() {
				var promise = this.loadJsonData('data.json');

				return RSVP.(promise).then(function (data) {
					var loadedData = JSON.parse(data);
					console.log("Loaded from data.json", loadedData);
					return loadedData;
				});
			}.bind(this);

			var loadLocal = function() {
				var promises = [
					this._loadData('height_map.raw'),
					this._loadData('splat_map.raw'),
					this._loadData('Materials'),
					this._loadData('Vegetation'),
					this._loadData('Forest')
				];

				return RSVP.all(promises).then(function (datas) {
					var loadedData = {};
					var dataFound = false;
					for (var i = 0; i < datas.length; i++) {
						if (datas[i]) {
							loadedData[datas[i].file] = datas[i].data;
							loadedData.local = datas[i].local;
							if (datas[i].local) dataFound = true;
						}
					}

					if (!dataFound) return checkForJson();

					console.log("Loaded from localStorage", loadedData);
					return loadedData;
				});
			}.bind(this);

			return loadLocal();


		};

		TerrainDataManager.prototype.loadJsonData = function (url) {
			console.log("Look for "+url+" at:", this.resourceFolder);
			var promise = new RSVP.Promise();

				var ajax = new Ajax();
				ajax.get({
					url: this.resourceFolder + url,
					responseType: 'application/json'
				}).then(function(request) {
					promise.resolve(request.response);
				}.bind(this), function() {
					promise.resolve(null);
				}.bind(this));

			return promise;
		};

		TerrainDataManager.prototype._loadData = function (url) {
			var promise = new RSVP.Promise();

			var fromLocalStore = localStorage.getItem(url);
			if (fromLocalStore) {

				setTimeout(function() {
					var parsed = JSON.parse(fromLocalStore);
				/*
					var data;
					try {
						data = this.decodeBase64(parsed.data);
					} catch(err) {
						data = parsed.data;
					}
				*/
					console.log("Loading Local Data: ", parsed.file);
					promise.resolve({file:parsed.file, data:parsed.data, local:true});
				}, 0);

			} else {
				var ajax = new Ajax();
				ajax.get({
					url: this.resourceFolder + url,
					responseType: 'arraybuffer'
				}).then(function(request) {

					console.log("Get Ajax: ", request);

				//	promise.resolve(request.response);
					promise.resolve({file:url, data:request.response, local:false});
				}.bind(this), function() {
					promise.resolve(null);
				}.bind(this));
			}

			return promise;
		};

		TerrainDataManager.prototype._textureLoad = function (url) {
			var promise = new RSVP.Promise();
			new TextureCreator().loadTexture2D(url, {
				anisotropy: 4
			}, function (texture) {
				promise.resolve(texture);
			});
			return promise;
		};

		TerrainDataManager.prototype._loadTextures = function (folder, terrainData, callback) {
			var promises = [];
			promises.push(this._textureLoad(folder + terrainData.ground1.texture));
			promises.push(this._textureLoad(folder + terrainData.ground2.texture));
			promises.push(this._textureLoad(folder + terrainData.ground3.texture));
			promises.push(this._textureLoad(folder + terrainData.ground4.texture));
			promises.push(this._textureLoad(folder + terrainData.ground5.texture));
			promises.push(this._textureLoad(folder + terrainData.stone.texture));
			return RSVP.all(promises).then(function (textures) {
				callback(textures);
			})
		};

		return TerrainDataManager;
	});