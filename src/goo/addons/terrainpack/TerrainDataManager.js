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
			this.resourcePath = folder;
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

		//	if (path) this.setResourceFolder(path);

			var projectFiles = [
				'height_map.raw',
				'splat_map.raw',
				'Materials',
				'Vegetation',
				'Forest',
				'Meta',
				'Ground'
			];

			var checkForJson = function() {
				var promise = this.loadJsonData('data.json');

				return RSVP.all([promise]).then(function (data) {
	//				console.log("Data retrieved: ", data);
					if (!data) console.log("No json data found");

					var jsonObj = data[0];
					var loadedData = JSON.parse(jsonObj);
	//				console.log("Loaded from data.json", loadedData);
					return loadedData;
				});
			}.bind(this);

			var loadLocal = function() {
				var promises = [];
				for (var i = 0; i < projectFiles.length; i++) {
					promises.push(this._loadData(projectFiles[i]));
				}

				var missingIndexes = [];

				return RSVP.all(promises).then(function (datas) {
					var loadedData = {};
					var dataFound = false;
	//				console.log("Datas: ", datas)
					for (var i = 0; i < datas.length; i++) {


						if (datas[i]) {
							loadedData[datas[i].file] = datas[i].data;
							loadedData.local = datas[i].local;
							if (datas[i].local) dataFound = true;
						} else {
	//						console.log("Missing data: ", i, projectFiles[i], dataFound);
							missingIndexes.push(i);

						}
					}
					if (missingIndexes.length != 0) {
	//					console.log("some localStorage data missing:", missingIndexes);
						return checkForJson();
					}

	//				console.log("Loaded from localStorage", loadedData);
					return loadedData;
				});
			}.bind(this);

			return loadLocal();


		};

		TerrainDataManager.prototype.loadJsonData = function (url) {
	//		console.log("Look for "+url+" at:", this.resourcePath);
			var promise = new RSVP.Promise();

				var ajax = new Ajax();
				ajax.get({
					url: this.resourcePath + url,
					responseType: 'application/json'

				}).then(function(request) {

		//			console.log("Get Ajax: ", request);

					promise.resolve(request.response);
				}.bind(this), function(err) {
					promise.resolve(err);
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
				//	console.log("Loading Local Data: ", parsed.file);
					promise.resolve({file:parsed.file, data:parsed.data, local:true});
				}, 0);

			} else {
				var ajax = new Ajax();
				ajax.get({
					url: this.resourcePath + url,
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
	//		console.log("Load TX: ",folder, terrainData )
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